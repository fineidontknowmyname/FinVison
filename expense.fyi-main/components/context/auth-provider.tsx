'use client';

import { createContext, useContext, useMemo } from 'react';

import { SWRConfig } from 'swr';

import fetcher from 'lib/fetcher';

interface User {
	currency: string;
	locale: string;
	billing_start_date: string;
	trial_start_date: string;
	order_status: string;
	usage: number;
	email: string;
	plan_status: string;
	new_signup_email: boolean;
	basic_usage_limit_email: boolean;
	premium_plan_expired_email: boolean;
	premium_usage_limit_email: boolean;
	monthly_email_report: boolean;
	isPremium: boolean;
	isPremiumPlanEnded: boolean;
}

const AuthContext = createContext(null);

export const AuthProvider = (props: any) => {
	const { children, ...others } = props;

	// Mock user data for demo purposes
	const mockUser = {
		currency: 'USD',
		locale: 'en-US',
		billing_start_date: new Date().toISOString(),
		trial_start_date: new Date().toISOString(),
		order_status: 'paid',
		usage: 0,
		email: 'demo@expense.fyi',
		plan_status: 'premium',
		new_signup_email: false,
		basic_usage_limit_email: false,
		premium_plan_expired_email: false,
		premium_usage_limit_email: false,
		monthly_email_report: false,
		isPremium: true,
		isPremiumPlanEnded: false,
	};

	const value = useMemo(() => {
		return {
			initial: false,
			session: { user: mockUser },
			user: mockUser,
			signOut: () => {},
		};
	}, []);

	return (
		<AuthContext.Provider value={value} {...others}>
			<SWRConfig value={{ fetcher }}>{children}</SWRConfig>
		</AuthContext.Provider>
	);
};

export const useUser = () => {
	const context = useContext<any>(AuthContext);
	if (context === undefined) {
		throw new Error(`useUser must be used within a AuthContext.`);
	}
	return context?.user ?? null;
};
