import React, { useMemo, useState } from 'react';
import {
    Wallet, TrendingUp, TrendingDown, Plus,
    Briefcase, Receipt, PieChart, Trash2, Edit2, IndianRupee, Download, Activity
} from 'lucide-react';
import { PageHeader, StatCard, ProgressBar, Button } from '@/components/shared';
import { Transaction, Investment, Budget } from '@/types/lifeos';
import { formatCurrency } from '@/lib/finance-utils';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { exportFinanceDataToCSV } from '@/lib/export-utils';
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
        <div className="animate-fade-in max-w-7xl mx-auto pb-32 px-4 shadow-none">
            <PageHeader title="Terminal" description="Capital management and asset allocation tracking.">
                <div className="flex gap-3">
                    <Button variant="ghost" size="sm" onClick={() => exportFinanceDataToCSV(transactions, investments, budgets)} className="opacity-40 hover:opacity-100">
                        <Download size={14} className="mr-2" /> Export
                    </Button>
                    <Button variant="outline" size="sm" className="border-border/10 h-9" onClick={() => { setEditingTx(null); setIsTxModalOpen(true); }}>
                        <Plus size={14} className="mr-2" /> Add Entry
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                <StatCard label="Net Capital" value={formatCurrency(balance)} icon={<IndianRupee />} />
                <StatCard label="Inflow" value={formatCurrency(totalIncome)} icon={<TrendingUp />} className="bg-success/5" />
                <StatCard label="Outflow" value={formatCurrency(totalExpenses)} icon={<TrendingDown />} className="bg-destructive/5" />
                <StatCard label="Retention" value={`${totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0}%`} icon={<PieChart />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2 space-y-20">
                    <section>
                        <div className="flex items-center justify-between mb-8 opacity-30">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] italic">Portfolio Breakdown</h2>
                            <Button variant="ghost" size="sm" onClick={() => { setEditingInv(null); setIsInvModalOpen(true); }} className="h-6 px-2 text-[8px]">
                                INIT ASSET
                            </Button>
                        </div>
                        {investments.length === 0 ? (
                            <div className="py-20 border border-dashed border-border/10 rounded-3xl text-center opacity-20">
                                <p className="text-[10px] font-black uppercase tracking-widest">No assets logged</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {investments.map(inv => (
                                    <div key={inv.id} className="border border-border/10 p-6 rounded-2xl group hover:bg-secondary/5 transition-all">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="space-y-1">
                                                <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">{inv.type}</div>
                                                <h3 className="text-sm font-black italic uppercase tracking-tight">{inv.name}</h3>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingInv(inv); setIsInvModalOpen(true); }} className="text-muted-foreground/30 hover:text-foreground"><Edit2 size={10} /></button>
                                                <button onClick={() => deleteInvestment(inv.id)} className="text-destructive/20 hover:text-destructive"><Trash2 size={10} /></button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="text-xl font-black">{formatCurrency(inv.amount)}</div>
                                            <div className="text-[8px] font-bold text-muted-foreground/20 italic">{Math.round((inv.amount / totalInvestments) * 100)}% WEIGHT</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-8 opacity-30">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] italic">Consumption Tracking</h2>
                            <Button variant="ghost" size="sm" onClick={() => { setEditingBudget(null); setIsBudgetModalOpen(true); }} className="h-6 px-2 text-[8px]">
                                INIT LIMIT
                            </Button>
                        </div>
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
                    </section>
                </div>

                <aside className="space-y-12">
                    <div className="opacity-30">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] italic flex items-center gap-3"><Activity size={10} /> Live Journal</h2>
                    </div>
                    <div className="space-y-3">
                        {transactions.slice(0, 15).map(t => (
                            <div key={t.id} className="flex items-center justify-between p-4 rounded-xl border border-border/5 group hover:bg-secondary/5 transition-all text-[10px] font-bold">
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-1 h-3 rounded-full opacity-30", t.type === 'Income' ? "bg-success" : "bg-destructive")} />
                                    <div className="uppercase tracking-widest">{t.category}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={cn("font-black tracking-tight", t.type === 'Income' ? "text-success" : "")}>
                                        {t.type === 'Income' ? '+' : '-'}{formatCurrency(t.amount)}
                                    </div>
                                    <button onClick={() => deleteTransaction(t.id)} className="opacity-0 group-hover:opacity-100 text-destructive/20 hover:text-destructive transition-all">
                                        <Trash2 size={10} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>

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
        <div className="space-y-4 p-6 rounded-2xl border border-border/10 group relative">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onEdit} className="text-muted-foreground/30 hover:text-foreground"><Edit2 size={10} /></button>
                <button onClick={onDelete} className="text-destructive/20 hover:text-destructive"><Trash2 size={10} /></button>
            </div>
            <div className="flex justify-between items-end mb-2">
                <div className="text-[10px] font-black uppercase tracking-widest italic">{budget.category}</div>
                <div className="text-[8px] font-black uppercase tracking-widest opacity-20 italic">LIMIT: {formatCurrency(budget.limit)}</div>
            </div>
            <div className="flex justify-between items-end">
                <div className="text-xl font-black italic">{formatCurrency(spent)}</div>
                <div className={cn("text-[9px] font-black uppercase tracking-widest", percentage > 90 ? "text-destructive" : "text-primary/40")}>
                    {percentage}%
                </div>
            </div>
            <ProgressBar value={Math.min(percentage, 100)} className="h-1" />
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
            <DialogContent className="bg-background border-border/10 max-w-md p-10 rounded-3xl">
                <DialogHeader><DialogTitle className="text-lg font-black uppercase tracking-tight italic border-b border-border/5 pb-4">INIT ENTRY</DialogTitle></DialogHeader>
                <div className="space-y-6 mt-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Protocol</label>
                            <Select value={type} onValueChange={(v: any) => setType(v)}>
                                <SelectTrigger className="bg-secondary/5 border-border/10 rounded-xl h-11 text-[10px] font-bold uppercase tracking-widest"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-background border-border/10">
                                    <SelectItem value="Income" className="text-[10px] font-bold uppercase tracking-widest">Inflow</SelectItem>
                                    <SelectItem value="Expense" className="text-[10px] font-bold uppercase tracking-widest">Outflow</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Timestamp</label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-secondary/5 border-border/10 rounded-xl h-11 text-[10px] font-bold" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Classification</label>
                        <Input value={category} onChange={e => setCategory(e.target.value)} className="bg-secondary/5 border-border/10 rounded-xl h-11 text-[10px] font-bold uppercase tracking-widest" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Magnitude (₹)</label>
                        <Input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} className="bg-secondary/5 border-border/10 rounded-xl h-12 text-lg font-black italic" />
                    </div>
                    <Button variant="primary" className="w-full h-12 mt-4" onClick={() => onSave({ id: editingTx?.id || crypto.randomUUID(), amount, type, category, date })}>
                        COMMIT LOG
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
            <DialogContent className="bg-background border-border/10 max-w-md p-10 rounded-3xl">
                <DialogHeader><DialogTitle className="text-lg font-black uppercase tracking-tight italic border-b border-border/5 pb-4">INIT ASSET</DialogTitle></DialogHeader>
                <div className="space-y-6 mt-8">
                    <div className="space-y-2">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Identifier</label>
                        <Input value={name} onChange={e => setName(e.target.value)} className="bg-secondary/5 border-border/10 rounded-xl h-11 text-[10px] font-bold uppercase tracking-widest" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Category</label>
                        <Select value={type} onValueChange={(v: any) => setType(v)}>
                            <SelectTrigger className="bg-secondary/5 border-border/10 rounded-xl h-11 text-[10px] font-bold uppercase tracking-widest"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-background border-border/10">
                                <SelectItem value="Stocks" className="text-[10px] font-bold uppercase tracking-widest">Equity</SelectItem>
                                <SelectItem value="Bonds" className="text-[10px] font-bold uppercase tracking-widest">Fixed Income</SelectItem>
                                <SelectItem value="Commodities" className="text-[10px] font-bold uppercase tracking-widest">Commodities</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Valuation (₹)</label>
                        <Input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} className="bg-secondary/5 border-border/10 rounded-xl h-12 text-lg font-black italic" />
                    </div>
                    <Button variant="primary" className="w-full h-12 mt-4" onClick={() => onSave({ id: editingInv?.id || crypto.randomUUID(), name, type, amount, date: new Date().toISOString() })}>
                        DEPLOY ASSET
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
            <DialogContent className="bg-background border-border/10 max-w-md p-10 rounded-3xl">
                <DialogHeader><DialogTitle className="text-lg font-black uppercase tracking-tight italic border-b border-border/5 pb-4">INIT BUDGET</DialogTitle></DialogHeader>
                <div className="space-y-6 mt-8">
                    <div className="space-y-2">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Sector</label>
                        <Input value={category} onChange={e => setCategory(e.target.value)} className="bg-secondary/5 border-border/10 rounded-xl h-11 text-[10px] font-bold uppercase tracking-widest" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Threshold (₹)</label>
                        <Input type="number" value={limit} onChange={e => setLimit(parseFloat(e.target.value) || 0)} className="bg-secondary/5 border-border/10 rounded-xl h-12 text-lg font-black italic" />
                    </div>
                    <Button variant="primary" className="w-full h-12 mt-4" onClick={() => onSave({ id: editingBudget?.id || crypto.randomUUID(), category, limit, month: format(new Date(), 'yyyy-MM') })}>
                        SET THRESHOLD
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
