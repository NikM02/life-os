import { Transaction, FinanceDistribution } from '../types/lifeos';

export const calculateDistribution = (income: number): FinanceDistribution => {
    return {
        emergencyFund: income * 0.25,
        investments: income * 0.25,
        bills: income * 0.30,
        spending: income * 0.20,
    };
};

export const getMonthYear = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};
