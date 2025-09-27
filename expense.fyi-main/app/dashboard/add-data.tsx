'use client';

import { useCallback } from 'react';

import Add from 'components/add-button';
import { useOverview } from 'components/context/overview-provider';

import { lookup } from 'lib/lookup';

const AddData = () => {
	const { data } = useOverview();
	const { mutateExpenses } = data.mutate;
	
	const onLookupExpenses = useCallback((name: string) => lookup({ data: data.expenses, name }), [data]);
	
	const handleAddExpense = async (expenseData: any) => {
		try {
			const response = await fetch('/api/expenses/add', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(expenseData),
			});
			
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to add expense');
			}
			
			// Refresh the data
			mutateExpenses();
			return await response.json();
		} catch (error) {
			console.error('Error adding expense:', error);
			throw error;
		}
	};

	return <Add type="expenses" mutate={handleAddExpense} onLookup={onLookupExpenses} />;
};

export default AddData;