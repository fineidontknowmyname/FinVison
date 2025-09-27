import { NextRequest, NextResponse } from 'next/server';

import { checkAuth } from 'lib/auth';
import prisma from 'lib/prisma';

import messages from 'constants/messages';

export async function POST(request: NextRequest) {
	const { notes, name, price, category, date, paid_via } = await request.json();
	
	return await checkAuth(async (user: any) => {
		try {
			// Validate required fields
			if (!name || !price || !category || !date) {
				return NextResponse.json(
					{ error: 'Missing required fields' }, 
					{ status: 400 }
				);
			}

			// First, ensure the user exists in the database
			let dbUser = await prisma.users.findUnique({
				where: { id: user.id }
			});

			// If user doesn't exist, create it
			if (!dbUser) {
				dbUser = await prisma.users.create({
					data: {
						id: user.id,
						email: user.email,
						currency: user.currency || 'USD',
						locale: user.locale || 'en-US',
					}
				});
			}

			// Now create the expense
			await prisma.expenses.create({
				data: { 
					notes: notes || '', 
					name, 
					price, 
					category, 
					user_id: user.id, 
					date, 
					paid_via: paid_via || '' 
				},
			});
			
			return NextResponse.json('added', { status: 201 });
		} catch (error) {
			console.error('Add expense error:', error);
			return NextResponse.json(
				{ error: 'Database error', message: messages.request.failed }, 
				{ status: 500 }
			);
		}
	}, false);
}