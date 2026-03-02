import React, { useMemo, useState } from 'react';
import {
    Wallet, TrendingUp, TrendingDown, Plus, ArrowRight,
    ShieldCheck, Briefcase, ShoppingBag, Receipt, PieChart, Trash2, Edit2, IndianRupee
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { PageHeader, StatCard, ProgressBar, Button } from '@/components/shared';
import { Transaction, Investment, Budget } from '@/types/lifeos';
import { formatCurrency } from '@/lib/finance-utils';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { exportFinanceDataToCSV } from '@/lib/export-utils';
import { Download } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

export default function Finance() {
    const {
        transactions, setTransactions,
        investments, setInvestments,
        budgets, setBudgets
    } = useData();

    const [isTxModalOpen, setIsTxModalOpen] = useState(false);
    const [isInvModalOpen, setIsInvModalOpen] = useState(false);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [editingInv, setEditingInv] = useState<Investment | null>(null);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

    const totalIncome = useMemo(() =>
        transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0),
        [transactions]);

    const totalExpenses = useMemo(() =>
        transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0),
        [transactions]);

    const currentMonth = format(new Date(), 'yyyy-MM');
    const monthlyBudgets = budgets.filter(b => b.month === currentMonth);

    const balance = totalIncome - totalExpenses;

    const totalInvestments = useMemo(() =>
        investments.reduce((sum, i) => sum + i.amount, 0),
        [investments]);

    const handleSaveTransaction = (tx: Transaction) => {
        if (editingTx) {
            setTransactions(transactions.map(t => t.id === tx.id ? tx : t));
        } else {
            setTransactions([tx, ...transactions]);
        }
        setIsTxModalOpen(false);
        setEditingTx(null);
    };

    const handleSaveInvestment = (inv: Investment) => {
        if (editingInv) {
            setInvestments(investments.map(i => i.id === inv.id ? inv : i));
        } else {
            setInvestments([...investments, inv]);
        }
        setIsInvModalOpen(false);
        setEditingInv(null);
    };

    const handleSaveBudget = (budget: Budget) => {
        if (editingBudget) {
            setBudgets(budgets.map(b => b.id === budget.id ? budget : b));
        } else {
            setBudgets([...budgets, budget]);
        }
        setIsBudgetModalOpen(false);
        setEditingBudget(null);
    };

    const deleteTransaction = (id: string) => setTransactions(transactions.filter(t => t.id !== id));
    const deleteInvestment = (id: string) => setInvestments(investments.filter(i => i.id !== id));
    const deleteBudget = (id: string) => setBudgets(budgets.filter(b => b.id !== id));

    return (
        <div className="animate-fade-in max-w-7xl mx-auto pb-10 px-4 md:px-0">
            <PageHeader
                title="Finance Tracker"
                description="Manage your wealth and portfolio with precision."
            >
                <div className="flex gap-3">
                    <Button variant="outline" size="md" onClick={() => exportFinanceDataToCSV(transactions, investments, budgets)} className="gap-2 border-border/40 hover:bg-secondary/50 rounded-md">
                        <Download className="h-3.5 w-3.5" />
                        <span className="uppercase tracking-widest text-[10px] font-bold">Export Finance</span>
                    </Button>
                    <Button variant="primary" size="md" onClick={() => { setEditingTx(null); setIsTxModalOpen(true); }}>
                        <Plus className="h-4 w-4" /> Add Transaction
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard label="Total Balance" value={formatCurrency(balance)} icon={<IndianRupee className="h-4 w-4" />} />
                <StatCard label="Monthly Income" value={formatCurrency(totalIncome)} icon={<TrendingUp className="h-4 w-4" />} sub="Total recorded" />
                <StatCard label="Monthly Expenses" value={formatCurrency(totalExpenses)} icon={<TrendingDown className="h-4 w-4" />} sub="Total recorded" />
                <StatCard label="Savings Rate" value={`${totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0}%`} icon={<PieChart className="h-4 w-4" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Manual Portfolio Breakdown */}
                    <div className="glass-card p-8 animate-slide-up">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50">Investment Portfolio Breakdown</h2>
                                <p className="text-[10px] text-muted-foreground/40 mt-1 uppercase tracking-widest font-bold">Manual Asset Allocation</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => { setEditingInv(null); setIsInvModalOpen(true); }} className="h-8">
                                <Plus className="h-3.5 w-3.5" /> Add Asset
                            </Button>
                        </div>

                        {investments.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed border-border/10 rounded-2xl opacity-40">
                                <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                <p className="text-[10px] uppercase font-black tracking-widest">No assets logged</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {investments.map(inv => (
                                    <div key={inv.id} className="p-5 rounded-2xl bg-secondary/10 border border-border/5 group relative hover:border-primary/20 transition-all">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                                    <Briefcase className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold tracking-tight">{inv.name}</div>
                                                    <div className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest">{inv.type}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => { setEditingInv(inv); setIsInvModalOpen(true); }} className="p-1 text-muted-foreground/40 hover:text-foreground"><Edit2 className="h-3 w-3" /></button>
                                                <button onClick={() => deleteInvestment(inv.id)} className="p-1 text-muted-foreground/40 hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="text-xl font-black">{formatCurrency(inv.amount)}</div>
                                            <div className="text-[10px] font-bold text-muted-foreground/30">{Math.round((inv.amount / totalInvestments) * 100)}% of Portfolio</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Monthly Budget Tracking */}
                    <div className="glass-card p-8 animate-slide-up delay-200">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50">Monthly Budget Tracking</h2>
                                <p className="text-[10px] text-muted-foreground/40 mt-1 uppercase tracking-widest font-bold">Manual Limits</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => { setEditingBudget(null); setIsBudgetModalOpen(true); }} className="h-8">
                                <Plus className="h-3.5 w-3.5" /> New Budget
                            </Button>
                        </div>

                        {monthlyBudgets.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed border-border/10 rounded-2xl opacity-40">
                                <Receipt className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                <p className="text-[10px] uppercase font-black tracking-widest">No budgets defined</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {monthlyBudgets.map(budget => {
                                    const spent = transactions
                                        .filter(t => t.type === 'Expense' && t.category === budget.category && t.date.startsWith(currentMonth))
                                        .reduce((sum, t) => sum + t.amount, 0);
                                    return (
                                        <BudgetItem
                                            key={budget.id}
                                            budget={budget}
                                            spent={spent}
                                            onEdit={() => { setEditingBudget(budget); setIsBudgetModalOpen(true); }}
                                            onDelete={() => deleteBudget(budget.id)}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="glass-card p-8 animate-slide-up delay-75 h-full">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50">Recent Activity</h2>
                            <ActivityIcon className="h-4 w-4 text-muted-foreground/20" />
                        </div>
                        <div className="space-y-4">
                            {transactions.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground/40 text-sm font-bold">No transactions yet</div>
                            ) : (
                                transactions.slice(0, 10).map(t => (
                                    <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border/5 group hover:border-primary/30 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2 rounded-xl",
                                                t.type === 'Income' ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                                            )}>
                                                {t.type === 'Income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold group-hover:text-primary transition-colors">{t.category}</div>
                                                <div className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest">{format(new Date(t.date), 'MMM d, yyyy')}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={cn("text-sm font-black", t.type === 'Income' ? "text-success" : "")}>
                                                {t.type === 'Income' ? '+' : '-'}{formatCurrency(t.amount)}
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => { setEditingTx(t); setIsTxModalOpen(true); }} className="p-1 text-muted-foreground/40 hover:text-foreground"><Edit2 className="h-3 w-3" /></button>
                                                <button onClick={() => deleteTransaction(t.id)} className="p-1 text-muted-foreground/40 hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <TransactionModal open={isTxModalOpen} onOpenChange={setIsTxModalOpen} onSave={handleSaveTransaction} editingTx={editingTx} />
            <InvestmentModal open={isInvModalOpen} onOpenChange={setIsInvModalOpen} onSave={handleSaveInvestment} editingInv={editingInv} />
            <BudgetModal open={isBudgetModalOpen} onOpenChange={setIsBudgetModalOpen} onSave={handleSaveBudget} editingBudget={editingBudget} />
        </div>
    );
}

function BudgetItem({ budget, spent, onEdit, onDelete }: {
    budget: Budget; spent: number; onEdit: () => void; onDelete: () => void;
}) {
    const percentage = Math.round((spent / budget.limit) * 100);
    return (
        <div className="space-y-4 p-6 rounded-2xl bg-secondary/10 border border-border/5 hover:border-primary/20 transition-all group relative">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={onEdit} className="p-1 text-muted-foreground/40 hover:text-foreground"><Edit2 className="h-3 w-3" /></button>
                <button onClick={onDelete} className="p-1 text-muted-foreground/40 hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
            </div>
            <div className="flex justify-between items-end">
                <div>
                    <div className="text-sm font-black uppercase tracking-tight">{budget.category}</div>
                    <div className="text-[10px] text-muted-foreground/40 font-bold">Monthly Limit: {formatCurrency(budget.limit)}</div>
                </div>
                <div className="text-right">
                    <div className="text-lg font-black tracking-tight">{formatCurrency(spent)}</div>
                    <div className={cn("text-[10px] font-black uppercase tracking-widest", percentage > 90 ? "text-destructive" : "text-primary")}>
                        {percentage}% Consumed
                    </div>
                </div>
            </div>
            <ProgressBar value={Math.min(percentage, 100)} className={cn("h-2", percentage > 90 ? "bg-destructive/10" : "")} />
        </div>
    );
}

function TransactionModal({ open, onOpenChange, onSave, editingTx }: {
    open: boolean; onOpenChange: (o: boolean) => void; onSave: (tx: Transaction) => void; editingTx: Transaction | null;
}) {
    const [amount, setAmount] = useState(editingTx?.amount || 0);
    const [type, setType] = useState<Transaction['type']>(editingTx?.type || 'Expense');
    const [category, setCategory] = useState(editingTx?.category || '');
    const [date, setDate] = useState(editingTx?.date || format(new Date(), 'yyyy-MM-dd'));

    React.useEffect(() => {
        if (editingTx) {
            setAmount(editingTx.amount);
            setType(editingTx.type);
            setCategory(editingTx.category);
            setDate(editingTx.date);
        } else {
            setAmount(0);
            setType('Expense');
            setCategory('');
            setDate(format(new Date(), 'yyyy-MM-dd'));
        }
    }, [editingTx, open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass-card-vibrant border-white/10 max-w-md">
                <DialogHeader><DialogTitle className="text-xl font-black uppercase tracking-tight">{editingTx ? 'Edit' : 'Add'} Transaction</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Type</label>
                            <Select value={type} onValueChange={(v: any) => setType(v)}>
                                <SelectTrigger className="bg-secondary/30 border-none rounded-md h-12"><SelectValue /></SelectTrigger>
                                <SelectContent className="glass-card">
                                    <SelectItem value="Income">Income</SelectItem>
                                    <SelectItem value="Expense">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Date</label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-secondary/30 border-none rounded-md h-12" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Category</label>
                        <Input placeholder="Entertainment, Salary, Rent..." value={category} onChange={e => setCategory(e.target.value)} className="bg-secondary/30 border-none rounded-md h-12" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Amount (₹)</label>
                        <Input type="number" placeholder="0" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} className="bg-secondary/30 border-none rounded-md h-12 text-lg font-black" />
                    </div>
                    <Button variant="primary" className="w-full h-14 rounded-md text-sm font-black uppercase tracking-widest" onClick={() => onSave({ id: editingTx?.id || Math.random().toString(36).substr(2, 9), amount, type, category, date })}>
                        Confirm Transaction
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function InvestmentModal({ open, onOpenChange, onSave, editingInv }: {
    open: boolean; onOpenChange: (o: boolean) => void; onSave: (inv: Investment) => void; editingInv: Investment | null;
}) {
    const [name, setName] = useState(editingInv?.name || '');
    const [type, setType] = useState<Investment['type']>(editingInv?.type || 'Stocks');
    const [amount, setAmount] = useState(editingInv?.amount || 0);

    React.useEffect(() => {
        if (editingInv) {
            setName(editingInv.name);
            setType(editingInv.type);
            setAmount(editingInv.amount);
        } else {
            setName('');
            setType('Stocks');
            setAmount(0);
        }
    }, [editingInv, open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass-card-vibrant border-white/10 max-w-md">
                <DialogHeader><DialogTitle className="text-xl font-black uppercase tracking-tight">{editingInv ? 'Edit' : 'Add'} Asset</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Asset Name</label>
                        <Input placeholder="Apple Stock, Gold, PPF..." value={name} onChange={e => setName(e.target.value)} className="bg-secondary/30 border-none rounded-md h-12" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Asset Type</label>
                        <Select value={type} onValueChange={(v: any) => setType(v)}>
                            <SelectTrigger className="bg-secondary/30 border-none rounded-md h-12"><SelectValue /></SelectTrigger>
                            <SelectContent className="glass-card">
                                <SelectItem value="Stocks">Stocks</SelectItem>
                                <SelectItem value="Bonds">Bonds</SelectItem>
                                <SelectItem value="FD">Fixed Deposit</SelectItem>
                                <SelectItem value="SIP">Mutual Fund / SIP</SelectItem>
                                <SelectItem value="Commodities">Commodities</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Current Value (₹)</label>
                        <Input type="number" placeholder="0" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} className="bg-secondary/30 border-none rounded-md h-12 text-lg font-black" />
                    </div>
                    <Button variant="primary" className="w-full h-14 rounded-md text-sm font-black uppercase tracking-widest" onClick={() => onSave({ id: editingInv?.id || Math.random().toString(36).substr(2, 9), name, type, amount, date: new Date().toISOString() })}>
                        Save Asset
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function BudgetModal({ open, onOpenChange, onSave, editingBudget }: {
    open: boolean; onOpenChange: (o: boolean) => void; onSave: (b: Budget) => void; editingBudget: Budget | null;
}) {
    const [category, setCategory] = useState(editingBudget?.category || '');
    const [limit, setLimit] = useState(editingBudget?.limit || 0);

    React.useEffect(() => {
        if (editingBudget) {
            setCategory(editingBudget.category);
            setLimit(editingBudget.limit);
        } else {
            setCategory('');
            setLimit(0);
        }
    }, [editingBudget, open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass-card-vibrant border-white/10 max-w-md">
                <DialogHeader><DialogTitle className="text-xl font-black uppercase tracking-tight">{editingBudget ? 'Edit' : 'New'} Budget</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Expense Category</label>
                        <Input placeholder="Food, Rent, Travel..." value={category} onChange={e => setCategory(e.target.value)} className="bg-secondary/30 border-none rounded-md h-12" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Monthly Limit (₹)</label>
                        <Input type="number" placeholder="0" value={limit} onChange={e => setLimit(parseFloat(e.target.value) || 0)} className="bg-secondary/30 border-none rounded-md h-12 text-lg font-black" />
                    </div>
                    <Button variant="primary" className="w-full h-14 rounded-md text-sm font-black uppercase tracking-widest" onClick={() => onSave({ id: editingBudget?.id || Math.random().toString(36).substr(2, 9), category, limit, month: format(new Date(), 'yyyy-MM') })}>
                        Set Budget
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ActivityIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    );
}
