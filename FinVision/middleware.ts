import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import urls from 'constants/url';

export async function middleware(req: NextRequest) {
	const res = NextResponse.next();
	const hostname = req.headers.get('host');
	const url = req.nextUrl;

	const currentHost = hostname?.replace(`.${urls.homeWithoutApp}`, '');

	// Redirect all app routes directly to dashboard without authentication
	if (currentHost === 'app') {
		// Redirect signin and signup to dashboard
		if (url.pathname === '/signin' || url.pathname === '/signup') {
			url.pathname = '/dashboard';
			return NextResponse.redirect(url);
		}

		// Rewrite all app routes to dashboard
		url.pathname = `/dashboard${url.pathname}`;
		return NextResponse.rewrite(url);
	}

	return res;
}

export const config = {
	matcher: [
		/*
		 * Match all paths except for:
		 * 1. /api/ routes
		 * 2. /_next/ (Next.js internals)
		 * 3. /_proxy/ (special page for OG tags proxying)
		 * 4. /_static (inside /public)
		 * 5. /_vercel (Vercel internals)
		 * 6. /favicon.ico, /sitemap.xml (static files)
		 */
		'/((?!api/|_next/|_proxy/|_static|_vercel|favicon.ico|sitemap.xml).*)',
	],
};
