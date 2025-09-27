import { Inter } from 'next/font/google';
import Script from 'next/script';

import NextTopLoader from 'nextjs-toploader';

import { AuthProvider } from 'components/context/auth-provider';
import { SidebarContextProvider } from 'components/context/sidebar-provider';
import { ThemeProvider } from 'components/context/theme-provider';
import DashboardLayout from 'components/layout';
import Sidebar from 'components/sidebar';
import { Toaster } from 'components/ui/sonner';

const GOOGLE_ANALYTICS_ID = process.env.GA4_ANALYTICS_ID;

const inter = Inter({ subsets: ['latin'] });

const title = 'Expense.fyi – Overview';
const description = 'Effortlessly Track and Manage Expenses.';

export const metadata = {
	title,
	description,
};

export const revalidate = 0;

export default async function Layout({ children }: any) {
	return (
		<>
			<html lang="en" suppressHydrationWarning>
				<body className={`${inter.className} flex h-full flex-col text-gray-600 antialiased`}>
					<NextTopLoader color="#0076ff" height={2} showSpinner={false} />
					<AuthProvider>
						<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
							<main className="relative flex min-h-full min-w-full bg-background">
								<DashboardLayout>
									<SidebarContextProvider>
										<Sidebar />
										<div className="h-full w-full sm:ml-[64px]">
											<div className="flex h-full w-full flex-col max-sm:ml-0">{children}</div>
										</div>
									</SidebarContextProvider>
								</DashboardLayout>
							</main>
						</ThemeProvider>
						<Toaster closeButton position="top-right" theme="system" visibleToasts={3} richColors />
					</AuthProvider>
				</body>
				<Script
					src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
					strategy="afterInteractive"
				/>
				<Script id="ga4" strategy="afterInteractive">
					{`
						window.dataLayer = window.dataLayer || [];
						function gtag(){dataLayer.push(arguments);}
						gtag('js', new Date());

						gtag('config', '${GOOGLE_ANALYTICS_ID}');
					`}
				</Script>
			</html>
		</>
	);
}
