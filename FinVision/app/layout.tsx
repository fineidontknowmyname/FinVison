import { Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';

import './globals.css';
import './overwrites.css';

const inter = Inter({ subsets: ['latin'] });

const title = 'FinVision – Track your expenses';
const description = 'Effortlessly Track and Manage Expenses.';

const GOOGLE_ANALYTICS_ID = process.env.GA4_ANALYTICS_ID;

export const metadata = {
	title,
	description,
	manifest: '/manifest.json',
	twitter: {
		card: 'summary_large_image',
		title,
		description,
		creator: '@BinaryBrains', // Updated to BinaryBrains
		// images: ['/og.jpg'], // Using relative path
	},
	openGraph: {
		title,
		description,
		url: 'https://your-domain.com', // Update with your actual domain
		type: 'website',
		// images: ['/og.jpg'], // Using relative path
	},
	icons: {
		icon: '/icons/logo.svg', // Using your SVG logo
		shortcut: '/icons/logo.png', // Using your PNG logo as shortcut
		apple: '/icons/logo.png', // Using your PNG logo for Apple
	},
	appleWebApp: {
		title,
		statusBarStyle: 'black',
		startupImage: ['/icons/logo.png'], // Using your PNG logo
	},
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	userScalable: false,
	themeColor: '#09090b',
};

export const revalidate = 0;

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={`${inter.className} flex h-full flex-col text-gray-600 antialiased`}>{children}</body>
			<Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`} strategy="afterInteractive" />
			<Script id="ga4" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					gtag('js', new Date());
					gtag('config', '${GOOGLE_ANALYTICS_ID}');
				`}
			</Script>
		</html>
	);
}