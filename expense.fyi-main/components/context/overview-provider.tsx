'use client';

import { createContext, useContext } from 'react';

import { useDate } from 'components/context/datepicker-provider';

const OverviewContext = createContext(null);

import useSWR from 'swr';

const fetcher = async (url: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return []; // Always return an array
  }
};

export const OverviewContextProvider = (props: any) => {
	const { date } = useDate();
	const { children, ...others } = props;

	// Fetch all data in parallel
	const { data: expenses, isLoading: loadingExpenses, mutate: mutateExpenses } = useSWR('/api/expenses', fetcher);
	const { data: income, isLoading: loadingIncome, mutate: mutateIncome } = useSWR('/api/income', fetcher);
	const { data: subscriptions, isLoading: loadingSubscriptions, mutate: mutateSubscriptions } = useSWR('/api/subscriptions', fetcher);
	const { data: investments, isLoading: loadingInvestments, mutate: mutateInvestments } = useSWR('/api/investments', fetcher);

	const loading = loadingExpenses || loadingIncome || loadingSubscriptions || loadingInvestments;

	const data = {
		expenses: Array.isArray(expenses) ? expenses : [],
		income: Array.isArray(income) ? income : [],
		subscriptions: Array.isArray(subscriptions) ? subscriptions : [],
		investments: Array.isArray(investments) ? investments : [],
		mutate: {
			mutateExpenses,
			mutateIncome,
			mutateSubscriptions,
			mutateInvestments,
		},
	};

	return (
		<OverviewContext.Provider value={{ loading, data }} {...others}>
			{children}
		</OverviewContext.Provider>
	);
};

export const useOverview = () => {
	const context = useContext<any>(OverviewContext);
	if (context === undefined) {
		throw new Error(`useUser must be used within a OverviewContext.`);
	}
	return context;
};