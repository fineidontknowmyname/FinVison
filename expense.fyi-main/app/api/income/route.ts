import { NextRequest, NextResponse } from 'next/server';

import { checkAuth } from 'lib/auth';
import prisma from 'lib/prisma';

import messages from 'constants/messages';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = request.nextUrl;
		const from = searchParams.get('from') || '';
		const to = searchParams.get('to') || '';
		const categories: any = searchParams.get('categories') || '';
		const OR = { OR: categories?.split(',').map((category: any) => ({ category: { contains: category } })) };

		const result = await checkAuth(async (user: any) => {
			try {
				console.log('Querying database for user:', user.id);
				
				const where = {
					user_id: user.id,
					...(categories.length && OR),
					...(to && from && { date: { lte: to, gte: from } }),
				};

				const data = await prisma.income.findMany({
					where,
					orderBy: { updated_at: 'desc' },
				});
				
				console.log('Found data:', data);
				return data.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
			} catch (error) {
				console.error('Database error:', error);
				throw error;
			}
		});

		// Return proper JSON response with headers
		return NextResponse.json(result || [], {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
		});
		
	} catch (error) {
		console.error('API route error:', error);
		return NextResponse.json(
			{ error: 'Internal server error', message: messages.request.failed }, 
			{ 
				status: 500,
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const { id } = await request.json();
		const result = await checkAuth(async (user: any) => {
			if (!id?.length) {
				throw new Error('Invalid ID');
			}
			await prisma.income.delete({
				where: { id: id[0] },
			});
			return 'deleted';
		});

		return NextResponse.json(result, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error, message: messages.request.failed }, { status: 500 });
	}
}

export async function PUT(request: NextRequest) {
	try {
		const { notes, name, price, category, id, date } = await request.json();
		const result = await checkAuth(async () => {
			if (!id) {
				throw new Error('Invalid ID');
			}
			await prisma.income.update({
				data: { notes, name, price, date, category },
				where: { id },
			});
			return 'updated';
		});

		return NextResponse.json(result, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error, message: messages.request.failed }, { status: 500 });
	}
}