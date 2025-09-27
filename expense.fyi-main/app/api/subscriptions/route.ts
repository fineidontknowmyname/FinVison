import { NextRequest, NextResponse } from 'next/server';

import { format } from 'date-fns';

import { checkAuth } from 'lib/auth';
import { calculatePaidDates, calculatePrevRenewalDate, calculateRenewalDate } from 'lib/date';
import prisma from 'lib/prisma';

import { dateFormat } from 'constants/date';
import messages from 'constants/messages';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = request.nextUrl;
		const from = searchParams.get('from') || '';
		const to = searchParams.get('to') || '';

		const result = await checkAuth(async (user: any) => {
			try {
				const data = await prisma.subscriptions.findMany({
					where: { user_id: user.id },
					orderBy: { date: 'desc' },
				});

				// Safe date calculations
				let updatedDate = data.map((datum) => {
					try {
						const renewal_date = calculateRenewalDate(datum.date, datum.paid);
						const prev_renewal_date = format(calculatePrevRenewalDate(renewal_date, datum.paid), dateFormat);
						return {
							...datum,
							renewal_date: format(renewal_date, dateFormat),
							prev_renewal_date,
							paid_dates: calculatePaidDates(datum, from, to) || [],
						};
					} catch (error) {
						console.error('Date calculation error:', error);
						return {
							...datum,
							renewal_date: datum.date,
							prev_renewal_date: datum.date,
							paid_dates: [],
						};
					}
				});

				if (from !== '' && to !== '') {
					updatedDate = updatedDate.filter((datum) => datum.paid_dates?.length);
				}

				return updatedDate;
			} catch (error) {
				console.error('Database error:', error);
				throw error;
			}
		});

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
			await prisma.subscriptions.delete({
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
		const { notes, name, price, paid, id, url, date, active, cancelled_at } = await request.json();
		const result = await checkAuth(async () => {
			if (!id) {
				throw new Error('Invalid ID');
			}
			await prisma.subscriptions.update({
				data: { notes, name, price, date, url, paid, active, cancelled_at },
				where: { id },
			});
			return 'updated';
		});

		return NextResponse.json(result, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error, message: messages.request.failed }, { status: 500 });
	}
}