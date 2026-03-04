import React, { useState, useMemo } from 'react';
import {
    Wallet, TrendingUp, TrendingDown, Clock, IndianRupee,
    Plus, Search, Filter, ArrowUpRight, ArrowDownRight,
    PieChart, History, Target, Landmark, CreditCard, ChevronRight,
    Download, Trash2, Edit2, PlusCircle, PieChart as PieIcon,
    BarChart3, Activity, Briefcase
} from 'lucide-react';
import { PageHeader, StatCard, Button } from '@/components/shared';
import { useData } from '@/contexts/DataContext';
import { formatCurrency } from '@/lib/finance-utils';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
    BarChart, Bar, Legend
} from 'recharts';
import {
    Transaction, TransactionType, Budget, Investment, InvestmentType
} from '@/types/lifeos';
import {
    exportTransactionsToCSV, exportBudgetsToCSV, exportPortfolioToCSV
} from '@/lib/export-utils';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Finance() {
    const {
        transactions, setTransactions,
        investments, setInvestments,
        budgets, setBudgets
    } = useData();

    // Modal States
    const [activeModal, setActiveModal] = useState<'transaction' | 'budget' | 'portfolio' | null>(null);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Filter Stats
    const totalIncome = useMemo(() =>
        transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0),
        [transactions]);

    const totalExpenses = useMemo(() =>
        transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0),
        [transactions]);

    const balance = totalIncome - totalExpenses;

    // Budget Deduction Logic
    const enrichedBudgets = useMemo(() => {
        const currentMonth = format(new Date(), 'yyyy-MM');
        return budgets.map(b => {
            const spent = transactions
                .filter(t => t.type === 'Expense' && t.category === b.category && t.date.startsWith(b.month))
                .reduce((sum, t) => sum + t.amount, 0);
            return { ...b, spent };
        });
    }, [budgets, transactions]);

    // Graph Data
    const cashflowData = useMemo(() => {
        // Simple 7-day trend
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateStr = format(d, 'yyyy-MM-dd');
            const dayIncome = transactions.filter(t => t.type === 'Income' && t.date === dateStr).reduce((s, t) => s + t.amount, 0);
            const dayExpense = transactions.filter(t => t.type === 'Expense' && t.date === dateStr).reduce((s, t) => s + t.amount, 0);
            return { name: format(d, 'MMM d'), income: dayIncome, expense: dayExpense };
        });
        return last7Days;
    }, [transactions]);

    const budgetPieData = useMemo(() => {
        return enrichedBudgets.map(b => ({ name: b.category, value: b.limit }));
    }, [enrichedBudgets]);

    const portfolioData = useMemo(() => {
        const types = ['Bonds', 'Stocks', 'FD', 'SIP', 'Commodities'];
        return types.map(type => ({
            name: type,
            value: investments.filter(inv => inv.type === type).reduce((sum, inv) => sum + inv.amount, 0)
        })).filter(d => d.value > 0);
    }, [investments]);

    // Handlers
    const handleSaveTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const data: any = Object.fromEntries(formData);

        const newTransaction: Transaction = {
            id: editingItem?.id || crypto.randomUUID(),
            date: data.date,
            amount: parseFloat(data.amount),
            type: data.type as TransactionType,
            category: data.category,
            note: data.description,
        };

        if (editingItem?.id) {
            setTransactions(transactions.map(t => t.id === editingItem.id ? newTransaction : t));
        } else {
            setTransactions([...transactions, newTransaction]);
        }
        setActiveModal(null);
        setEditingItem(null);
    };

    const handleSaveBudget = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const data: any = Object.fromEntries(formData);

        const newBudget: Budget = {
            id: editingItem?.id || crypto.randomUUID(),
            month: data.month,
            category: data.category,
            limit: parseFloat(data.amount),
        };

        if (editingItem?.id) {
            setBudgets(budgets.map(b => b.id === editingItem.id ? newBudget : b));
        } else {
            setBudgets([...budgets, newBudget]);
        }
        setActiveModal(null);
        setEditingItem(null);
    };

    const handleSavePortfolio = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const data: any = Object.fromEntries(formData);

        const newInvestment: Investment = {
            id: editingItem?.id || crypto.randomUUID(),
            name: data.title,
            type: data.type as InvestmentType,
            amount: parseFloat(data.amount),
            date: data.date,
            description: data.description,
        };

        if (editingItem?.id) {
            setInvestments(investments.map(inv => inv.id === editingItem.id ? newInvestment : inv));
        } else {
            setInvestments([...investments, newInvestment]);
        }
        setActiveModal(null);
        setEditingItem(null);
    };

    const deleteItem = (type: 'transaction' | 'budget' | 'investment', id: string) => {
        if (type === 'transaction') setTransactions(transactions.filter(t => t.id !== id));
        if (type === 'budget') setBudgets(budgets.filter(b => b.id !== id));
        if (type === 'investment') setInvestments(investments.filter(inv => inv.id !== id));
    };

    return (
        <div className="max-w-7xl mx-auto pb-32 px-4 animate-fade-in shadow-none">
            <PageHeader title="Finance" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <StatCard
                    label="Current Balance"
                    value={formatCurrency(balance)}
                    icon={<Wallet />}
                    className="bg-primary text-primary-foreground border-none shadow-xl shadow-primary/10"
                />
                <StatCard
                    label="Total Inflow"
                    value={formatCurrency(totalIncome)}
                    icon={<ArrowUpRight className="text-success" />}
                />
                <StatCard
                    label="Total Outflow"
                    value={formatCurrency(totalExpenses)}
                    icon={<ArrowDownRight className="text-destructive" />}
                />
            </div>

            {/* TRANSACTIONS SECTION */}
            <section className="mb-24">
                <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-semibold tracking-tight">Active Ledger</h2>
                        <p className="text-[11px] font-medium text-muted-foreground/30 uppercase tracking-widest">Transaction Registry</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => exportTransactionsToCSV(transactions)} className="opacity-40 hover:opacity-100">
                            <Download size={14} className="mr-2" /> Export CSV
                        </Button>
                        <Button onClick={() => { setEditingItem(null); setActiveModal('transaction'); }} variant="outline" size="sm" className="rounded-2xl h-10 px-6">
                            <Plus size={16} className="mr-2" /> Record Transaction
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-4">
                        {transactions.slice(0, 10).map(t => (
                            <div key={t.id} className="group p-6 rounded-3xl bg-secondary/20 border border-border/5 hover:border-primary/20 transition-all flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                        t.type === 'Income' ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                                    )}>
                                        {t.type === 'Income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold tracking-tight text-foreground/80">{t.note || t.category}</h4>
                                        <div className="flex items-center gap-3 mt-1 opacity-30 text-[9px] font-bold uppercase tracking-widest">
                                            <span>{t.date}</span>
                                            <span>•</span>
                                            <span>{t.category}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <span className={cn("text-base font-bold tracking-tight", t.type === 'Income' ? "text-success" : "text-foreground/70")}>
                                        {t.type === 'Income' ? '+' : '-'}{formatCurrency(t.amount)}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => { setEditingItem(t); setActiveModal('transaction'); }} className="p-2 rounded-xl text-muted-foreground/20 hover:text-primary transition-colors"><Edit2 size={14} /></button>
                                        <button onClick={() => deleteItem('transaction', t.id)} className="p-2 rounded-xl text-muted-foreground/10 hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="h-[300px] bg-secondary/10 rounded-3xl p-8 border border-border/5">
                        <span className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-widest mb-6 block text-center">Cashflow Trajectory</span>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={cashflowData}>
                                <defs>
                                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" hide />
                                <YAxis hide />
                                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorInc)" strokeWidth={2} />
                                <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* BUDGET SECTION */}
            <section className="mb-24">
                <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-semibold tracking-tight">Resource Allocation</h2>
                        <p className="text-[11px] font-medium text-muted-foreground/30 uppercase tracking-widest">Monthly Guardrails</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => exportBudgetsToCSV(budgets)} className="opacity-40 hover:opacity-100">
                            <Download size={14} className="mr-2" /> Export CSV
                        </Button>
                        <Button onClick={() => { setEditingItem(null); setActiveModal('budget'); }} variant="outline" size="sm" className="rounded-2xl h-10 px-6">
                            <PlusCircle size={16} className="mr-2" /> Create Directive
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {enrichedBudgets.map(b => (
                            <div key={b.id} className="p-8 rounded-3xl bg-background border border-border/40 hover:border-primary/20 transition-all flex flex-col justify-between group">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-widest">{b.month}</span>
                                        <h4 className="text-xl font-semibold tracking-tight">{b.category}</h4>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => { setEditingItem(b); setActiveModal('budget'); }} className="p-2 text-muted-foreground/20 hover:text-primary transition-colors"><Edit2 size={14} /></button>
                                        <button onClick={() => deleteItem('budget', b.id)} className="p-2 text-muted-foreground/10 hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-[11px] font-bold">
                                        <span className="opacity-40">UTILIZATION</span>
                                        <span className={cn((b.spent! / b.limit) > 0.9 ? "text-destructive" : "text-primary")}>{Math.round((b.spent! / b.limit) * 100)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-secondary/20 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full transition-all duration-1000", (b.spent! / b.limit) > 0.9 ? "bg-destructive" : "bg-primary")}
                                            style={{ width: `${Math.min(100, (b.spent! / b.limit) * 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-end pt-2">
                                        <div className="space-y-0.5">
                                            <p className="text-[9px] font-bold opacity-20 uppercase tracking-widest leading-none">REMAINING</p>
                                            <p className="text-sm font-bold tracking-tight">{formatCurrency(b.limit - b.spent!)}</p>
                                        </div>
                                        <p className="text-[10px] font-semibold opacity-30 tracking-tight">of {formatCurrency(b.limit)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-secondary/10 rounded-3xl p-8 border border-border/5 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-widest mb-10 block text-center">Structural Split</span>
                        <ResponsiveContainer width="100%" height={200}>
                            <RePieChart>
                                <Pie
                                    data={budgetPieData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {budgetPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* PORTFOLIO SECTION */}
            <section className="mb-24">
                <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-semibold tracking-tight">Diverse Portfolio</h2>
                        <p className="text-[11px] font-medium text-muted-foreground/30 uppercase tracking-widest">Wealth Architecture</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => exportPortfolioToCSV(investments)} className="opacity-40 hover:opacity-100">
                            <Download size={14} className="mr-2" /> Export CSV
                        </Button>
                        <Button onClick={() => { setEditingItem(null); setActiveModal('portfolio'); }} variant="outline" size="sm" className="rounded-2xl h-10 px-6">
                            <PlusCircle size={16} className="mr-2" /> Deploy Capital
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    <div className="h-[300px] bg-secondary/10 rounded-3xl p-8 border border-border/5">
                        <span className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-widest mb-10 block text-center">Asset Distribution</span>
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={portfolioData}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {portfolioData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {investments.map(inv => (
                            <div key={inv.id} className="p-8 rounded-3xl bg-secondary/20 border border-border/5 group hover:border-primary/20 transition-all">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-primary/5 text-primary">
                                            {inv.type === 'Stocks' ? <Activity size={20} /> : <Landmark size={20} />}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold tracking-tight">{inv.name}</h4>
                                            <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">{inv.type}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setEditingItem(inv); setActiveModal('portfolio'); }} className="p-2 rounded-xl text-muted-foreground/40 hover:text-primary"><Edit2 size={14} /></button>
                                        <button onClick={() => deleteItem('investment', inv.id)} className="p-2 rounded-xl text-muted-foreground/20 hover:text-destructive"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end pt-4 border-t border-border/5">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-bold opacity-20 uppercase tracking-widest">Deployed on</span>
                                        <div className="text-xs font-semibold opacity-40">{inv.date}</div>
                                    </div>
                                    <div className="text-2xl font-bold tracking-tight text-primary/80">{formatCurrency(inv.amount)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MODALS */}
            {activeModal === 'transaction' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm animate-fade-in shadow-none">
                    <form onSubmit={handleSaveTransaction} className="bg-background border border-border/10 w-full max-w-lg p-10 rounded-3xl shadow-3xl animate-scale-in">
                        <h3 className="text-2xl font-semibold tracking-tight mb-8">Record Movement</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-1">Type</label>
                                    <select name="type" defaultValue={editingItem?.type || 'Expense'} className="w-full bg-secondary/5 border border-border/20 rounded-2xl px-5 py-4 text-sm font-semibold">
                                        <option value="Income">Income</option>
                                        <option value="Expense">Expense</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-1">Category</label>
                                    <input name="category" defaultValue={editingItem?.category || ''} className="w-full bg-secondary/5 border border-border/20 rounded-2xl px-5 py-4 text-sm font-semibold" placeholder="e.g. Salary, Food" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-1">Amount (INR)</label>
                                    <input name="amount" type="number" defaultValue={editingItem?.amount || ''} className="w-full bg-secondary/5 border border-dotted border-border/20 rounded-2xl px-5 py-4 text-sm font-semibold" placeholder="0.00" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-1">Date</label>
                                    <input name="date" type="date" defaultValue={editingItem?.date || format(new Date(), 'yyyy-MM-dd')} className="w-full bg-secondary/5 border border-dotted border-border/20 rounded-2xl px-5 py-4 text-sm font-semibold" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-1">Description</label>
                                <input name="description" defaultValue={editingItem?.note || ''} className="w-full bg-secondary/5 border border-border/20 rounded-2xl px-5 py-4 text-sm font-semibold" placeholder="Add context..." />
                            </div>
                            <div className="flex gap-4 pt-6">
                                <Button type="button" variant="ghost" className="flex-1" onClick={() => setActiveModal(null)}>Discard</Button>
                                <Button type="submit" className="flex-1">Sync Ledger</Button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {activeModal === 'budget' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm animate-fade-in shadow-none">
                    <form onSubmit={handleSaveBudget} className="bg-background border border-border/10 w-full max-w-lg p-10 rounded-3xl shadow-3xl animate-scale-in">
                        <h3 className="text-2xl font-semibold tracking-tight mb-8">Resource Directive</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-1">Category</label>
                                <input name="category" defaultValue={editingItem?.category || ''} className="w-full bg-secondary/5 border border-border/20 rounded-2xl px-5 py-4 text-sm font-semibold" placeholder="e.g. Food, Travel" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-1">Limit (INR)</label>
                                    <input name="amount" type="number" defaultValue={editingItem?.limit || ''} className="w-full bg-secondary/5 border border-border/20 rounded-2xl px-5 py-4 text-sm font-semibold" placeholder="0.00" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-1">Month</label>
                                    <input name="month" type="month" defaultValue={editingItem?.month || format(new Date(), 'yyyy-MM')} className="w-full bg-secondary/5 border border-dotted border-border/20 rounded-2xl px-5 py-4 text-sm font-semibold" required />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <Button type="button" variant="ghost" className="flex-1" onClick={() => setActiveModal(null)}>Discard</Button>
                                <Button type="submit" className="flex-1">Set Limit</Button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {activeModal === 'portfolio' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm animate-fade-in shadow-none">
                    <form onSubmit={handleSavePortfolio} className="bg-background border border-border/10 w-full max-w-lg p-10 rounded-3xl shadow-3xl animate-scale-in">
                        <h3 className="text-2xl font-semibold tracking-tight mb-8">Capital Deployment</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-1">Asset Title</label>
                                    <input name="title" defaultValue={editingItem?.name || ''} className="w-full bg-secondary/5 border border-dotted border-border/20 rounded-2xl px-5 py-4 text-sm font-semibold" placeholder="e.g. HDFC Bluechip" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-1">Type</label>
                                    <select name="type" defaultValue={editingItem?.type || 'Stocks'} className="w-full bg-secondary/5 border border-dotted border-border/20 rounded-2xl px-5 py-4 text-sm font-semibold">
                                        <option value="Stocks">Stocks</option>
                                        <option value="SIP">SIP</option>
                                        <option value="FD">FD</option>
                                        <option value="Bonds">Bonds</option>
                                        <option value="Commodities">Commodities</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-1">Amount (INR)</label>
                                    <input name="amount" type="number" defaultValue={editingItem?.amount || ''} className="w-full bg-secondary/5 border border-dotted border-border/20 rounded-2xl px-5 py-4 text-sm font-semibold" placeholder="0.00" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-1">Date</label>
                                    <input name="date" type="date" defaultValue={editingItem?.date || format(new Date(), 'yyyy-MM-dd')} className="w-full bg-secondary/5 border border-dotted border-border/20 rounded-2xl px-5 py-4 text-sm font-semibold" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-1">Allocation Strategy (Description)</label>
                                <textarea name="description" defaultValue={editingItem?.description || ''} className="w-full bg-secondary/5 border border-dotted border-border/20 rounded-2xl px-5 py-4 text-sm font-semibold min-h-[80px] resize-none" placeholder="Context..." />
                            </div>
                            <div className="flex gap-4 pt-6">
                                <Button type="button" variant="ghost" className="flex-1" onClick={() => setActiveModal(null)}>Discard</Button>
                                <Button type="submit" className="flex-1">Deploy Asset</Button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
