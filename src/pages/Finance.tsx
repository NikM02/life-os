import React, { useState, useMemo } from 'react';
import {
    Wallet, TrendingUp, TrendingDown, Clock, IndianRupee,
    Plus, Search, Filter, ArrowUpRight, ArrowDownRight,
    PieChart, History, Target, Landmark, CreditCard, ChevronRight
} from 'lucide-react';
import { PageHeader, StatCard, Button, CategoryBadge } from '@/components/shared';
import { useData } from '@/contexts/DataContext';
import { formatCurrency } from '@/lib/finance-utils';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function Finance() {
    const { transactions, setTransactions, investments, setInvestments, budgets, setBudgets } = useData();

    const [filter, setFilter] = useState<'All' | 'Income' | 'Expense'>('All');
    const [searchQuery, setSearchQuery] = useState('');

    const totalIncome = useMemo(() =>
        transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0),
        [transactions]);

    const totalExpenses = useMemo(() =>
        transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0),
        [transactions]);

    const balance = totalIncome - totalExpenses;

    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(t => (filter === 'All' || t.type === filter))
            .filter(t => t.description.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, filter, searchQuery]);

    return (
        <div className="max-w-7xl mx-auto pb-32 px-4 animate-fade-in shadow-none">
            <PageHeader
                title="Finance"
                description="Monitor equity, orchestrate inflow, and optimize resource distribution."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="md:col-span-1">
                    <StatCard
                        label="Total Equity"
                        value={formatCurrency(balance)}
                        icon={<Wallet />}
                        className="bg-primary text-primary-foreground border-none shadow-xl shadow-primary/10"
                    />
                </div>
                <StatCard
                    label="Total Inflow"
                    value={formatCurrency(totalIncome)}
                    icon={<ArrowUpRight className="text-success" />}
                    sub="Current Cycle"
                />
                <StatCard
                    label="Total Outflow"
                    value={formatCurrency(totalExpenses)}
                    icon={<ArrowDownRight className="text-destructive" />}
                    sub="Current Cycle"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between mb-8 opacity-60">
                        <h2 className="text-xl font-semibold tracking-tight">Activity Log</h2>
                        <div className="flex gap-4">
                            {['All', 'Income', 'Expense'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type as any)}
                                    className={cn(
                                        "text-[11px] font-semibold tracking-wider uppercase transition-all",
                                        filter === type ? "text-primary" : "text-muted-foreground/40 hover:text-muted-foreground"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredTransactions.map(t => (
                            <div key={t.id} className="group flex items-center justify-between p-6 rounded-2xl bg-secondary/20 border border-border/10 hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                                        t.type === 'Income' ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                                    )}>
                                        {t.type === 'Income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-semibold tracking-tight text-foreground/80">{t.description}</h4>
                                        <div className="flex items-center gap-3 mt-1 opacity-30 text-[10px] font-medium uppercase tracking-widest">
                                            <Clock size={10} />
                                            <span>{format(new Date(t.date), 'MMM d, yyyy')}</span>
                                            <span>•</span>
                                            <span>{t.category}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className={cn(
                                    "text-base font-semibold tracking-tight",
                                    t.type === 'Income' ? "text-success" : "text-foreground/80"
                                )}>
                                    {t.type === 'Income' ? '+' : '-'}{formatCurrency(t.amount)}
                                </span>
                            </div>
                        ))}
                        {filteredTransactions.length === 0 && (
                            <div className="text-center py-20 border border-dashed border-border/10 rounded-3xl opacity-20">
                                <span className="text-xs font-medium uppercase tracking-widest italic">No transitions recorded</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-12">
                    <div className="p-8 rounded-3xl bg-secondary/10 border border-border/10 space-y-8">
                        <h3 className="text-lg font-semibold tracking-tight opacity-40">Assets</h3>
                        <div className="space-y-6">
                            {investments.map(inv => (
                                <div key={inv.id} className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-semibold text-muted-foreground/30 uppercase tracking-widest">{inv.type}</span>
                                        <h4 className="text-sm font-semibold tracking-tight">{inv.name}</h4>
                                    </div>
                                    <span className="text-sm font-semibold tracking-tight">{formatCurrency(inv.amount)}</span>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full text-xs opacity-40">Diversify Portfolio</Button>
                    </div>

                    <div className="p-8 rounded-3xl border border-border/10 space-y-8">
                        <h3 className="text-lg font-semibold tracking-tight opacity-40">Allocations</h3>
                        <div className="space-y-6">
                            {budgets.map(b => (
                                <div key={b.id} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-semibold text-muted-foreground/30 uppercase tracking-widest">{b.category}</span>
                                        <span className="text-[11px] font-semibold tracking-tight">{formatCurrency(b.spent)} / {formatCurrency(b.limit)}</span>
                                    </div>
                                    <div className="h-1 bg-secondary/40 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full transition-all duration-1000",
                                                (b.spent / b.limit) > 0.9 ? "bg-destructive/60" : "bg-primary/40"
                                            )}
                                            style={{ width: `${Math.min(100, (b.spent / b.limit) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
