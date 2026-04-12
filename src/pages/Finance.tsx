import React, { useState, useMemo } from 'react';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, IndianRupee, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type EntryType = 'income' | 'expense';

interface Entry {
  id: string;
  type: EntryType;
  label: string;
  amount: number;
  date: string; // yyyy-MM-dd
}

function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Finance() {
  const [entries, setEntries] = useLocalStorage<Entry[]>('lifeos-finance-entries', []);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<EntryType>('expense');
  const [formLabel, setFormLabel] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const monthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
  const monthLabel = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const monthEntries = useMemo(() =>
    entries
      .filter(e => e.date.startsWith(monthKey))
      .sort((a, b) => b.date.localeCompare(a.date)),
    [entries, monthKey]
  );

  const totalIncome = useMemo(() =>
    monthEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0),
    [monthEntries]
  );

  const totalExpense = useMemo(() =>
    monthEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0),
    [monthEntries]
  );

  const balance = totalIncome - totalExpense;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLabel.trim() || !formAmount) return;
    const newEntry: Entry = {
      id: crypto.randomUUID(),
      type: formType,
      label: formLabel.trim(),
      amount: parseFloat(formAmount),
      date: formDate,
    };
    setEntries([...entries, newEntry]);
    setFormLabel('');
    setFormAmount('');
    setFormDate(format(new Date(), 'yyyy-MM-dd'));
    setShowForm(false);
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto pb-32 px-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>
          <p className="text-xs text-muted-foreground/50 mt-1">Track salary &amp; expenses</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setFormType('expense'); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-sm"
        >
          <Plus size={14} />
          Add Entry
        </button>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between mb-6 p-4 rounded-2xl bg-secondary/30 border border-border/20">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-secondary/60 transition-all">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold">{monthLabel}</span>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-secondary/60 transition-all">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-background border border-border/30 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Income</p>
          <p className="text-base font-bold text-green-600 tracking-tight">{formatINR(totalIncome)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-background border border-border/30 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Expense</p>
          <p className="text-base font-bold text-red-500 tracking-tight">{formatINR(totalExpense)}</p>
        </div>
        <div className={cn(
          "p-4 rounded-2xl border space-y-1",
          balance >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
        )}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Balance</p>
          <p className={cn("text-base font-bold tracking-tight", balance >= 0 ? "text-green-700" : "text-red-600")}>
            {formatINR(balance)}
          </p>
        </div>
      </div>

      {/* Add Entry Form (inline) */}
      {showForm && (
        <div className="mb-6 p-6 rounded-2xl border border-border/40 bg-background shadow-sm space-y-4">
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setFormType('income')}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-bold transition-all border",
                formType === 'income'
                  ? "bg-green-500 text-white border-green-500"
                  : "border-border/30 text-muted-foreground/60 hover:border-green-300"
              )}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setFormType('expense')}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-bold transition-all border",
                formType === 'expense'
                  ? "bg-red-500 text-white border-red-500"
                  : "border-border/30 text-muted-foreground/60 hover:border-red-300"
              )}
            >
              Expense
            </button>
          </div>
          <form onSubmit={handleAdd} className="space-y-3">
            <input
              autoFocus
              type="text"
              placeholder={formType === 'income' ? 'e.g. Salary, Freelance' : 'e.g. Rent, Groceries'}
              value={formLabel}
              onChange={e => setFormLabel(e.target.value)}
              required
              className="w-full bg-secondary/20 border border-border/20 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Amount (₹)"
                value={formAmount}
                onChange={e => setFormAmount(e.target.value)}
                required
                min={1}
                className="w-full bg-secondary/20 border border-border/20 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <input
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                required
                className="w-full bg-secondary/20 border border-border/20 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-border/30 text-muted-foreground/60 hover:bg-secondary/40 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Entries List */}
      {monthEntries.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground/30">
          <IndianRupee size={32} className="mx-auto mb-3 opacity-20" />
          <p className="text-xs font-medium">No entries for {monthLabel}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {monthEntries.map(entry => (
            <div
              key={entry.id}
              className="flex items-center justify-between px-5 py-4 rounded-2xl border border-border/20 bg-background hover:border-border/40 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                  entry.type === 'income' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                )}>
                  {entry.type === 'income'
                    ? <ArrowUpRight size={16} />
                    : <ArrowDownRight size={16} />
                  }
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground/80 leading-tight">{entry.label}</p>
                  <p className="text-[10px] text-muted-foreground/40 mt-0.5">
                    {format(new Date(entry.date + 'T00:00:00'), 'd MMM yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={cn(
                  "text-sm font-bold tracking-tight",
                  entry.type === 'income' ? "text-green-600" : "text-foreground/70"
                )}>
                  {entry.type === 'income' ? '+' : '-'}{formatINR(entry.amount)}
                </span>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground/20 hover:text-red-500 transition-all p-1.5 rounded-lg"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
