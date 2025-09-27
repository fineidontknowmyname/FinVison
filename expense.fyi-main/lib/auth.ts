// lib/auth.ts
export const checkAuth = async (callback: Function, isGetMethod = true) => {
	// Mock user with valid UUID format
	const mockUser = {
		id: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID format
		email: 'demo@expense.fyi',
		currency: 'USD',
		locale: 'en-US',
		billing_start_date: new Date().toISOString(),
		trial_start_date: new Date().toISOString(),
		order_status: 'paid',
		usage: 0,
		plan_status: 'premium',
		new_signup_email: false,
		basic_usage_limit_email: false,
		premium_plan_expired_email: false,
		premium_usage_limit_email: false,
		monthly_email_report: false,
		isPremium: true,
		isPremiumPlanEnded: false,
	};
	
	return callback(mockUser);
};