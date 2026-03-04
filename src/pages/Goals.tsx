import React, { useState, useMemo } from 'react';
import {
  Target, Plus, Search, TrendingUp, CheckCircle2, Star,
  Layers, Download, Edit2, Trash2, Save, X, ChevronRight,
  Filter
} from 'lucide-react';
import { PageHeader, StatCard, ProgressBar, CategoryBadge, Button } from '@/components/shared';
import { useData } from '@/contexts/DataContext';
import { Goal, GoalCategory } from '@/types/lifeos';
import { cn } from '@/lib/utils';
import { exportGoalsDataToCSV } from '@/lib/export-utils';

const categories: GoalCategory[] = ['Wealth', 'Health', 'Skills', 'Relationships', 'Spiritual', 'Lifestyle', 'Books', 'Finance', 'Networking'];
const quarters = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

export default function Goals() {
  const { goals, setGoals } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isAddingToQuarter, setIsAddingToQuarter] = useState<typeof quarters[number] | null>(null);

  const stats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter(g => g.status === 'Completed').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    const active = goals.filter(g => g.status === 'In Progress').length;
    return { total, completed, progress, active };
  }, [goals]);

  const addGoal = (e: React.FormEvent<HTMLFormElement>, quarter: typeof quarters[number]) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newGoal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.get('title') as string,
      category: formData.get('category') as GoalCategory,
      status: 'Not Started',
      progress: 0,
      quarter,
      timeframe: 'Weekly', // Default
      createdAt: new Date().toISOString(),
      description: ''
    };
    setGoals([...goals, newGoal]);
    setIsAddingToQuarter(null);
  };

  const updateGoal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingGoal) return;
    const formData = new FormData(e.currentTarget);
    const updatedGoals = goals.map(g => g.id === editingGoal.id ? {
      ...g,
      title: formData.get('title') as string,
      category: formData.get('category') as GoalCategory,
      status: formData.get('status') as any,
      progress: Number(formData.get('progress')),
    } : g);
    setGoals(updatedGoals);
    setEditingGoal(null);
  };

  const deleteGoal = (id: string) => {
    if (confirm('Are you sure you want to remove this objective from your trajectory?')) {
      setGoals(goals.filter(g => g.id !== id));
    }
  };

  const filteredGoals = useMemo(() => {
    return goals.filter(goal =>
      goal.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [goals, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto pb-32 px-4 animate-fade-in shadow-none">
      <PageHeader
        title="Objectives"
        description="Establish strategic intent and architect your quarterly trajectory."
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => exportGoalsDataToCSV(goals)} className="opacity-40 hover:opacity-100">
            <Download size={14} className="mr-2" /> Export CSV
          </Button>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Filter intentions..."
              className="bg-secondary/20 border border-border/10 rounded-2xl pl-12 pr-6 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
        <StatCard label="Total Objectives" value={stats.total} icon={<Layers />} />
        <StatCard label="Active Manifests" value={stats.active} icon={<TrendingUp />} />
        <StatCard label="Realized" value={stats.completed} icon={<CheckCircle2 />} />
        <StatCard label="System Yield" value={`${stats.progress}%`} icon={<Star />} />
      </div>

      <div className="space-y-24">
        {quarters.map((q) => (
          <section key={q} className="space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-primary/20">
                <Target size={24} strokeWidth={1} />
                <h2 className="text-2xl font-semibold tracking-tight text-foreground/80">{q} Objectives</h2>
                <div className="h-px w-32 bg-border/40" />
              </div>
              <Button onClick={() => setIsAddingToQuarter(q)} variant="outline" size="sm" className="rounded-2xl border-dashed border-2 px-6 h-10 hover:border-primary/40 hover:bg-primary/5 transition-all">
                <Plus size={16} className="mr-2" /> Add Objective
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGoals.filter(g => g.quarter === q).map(goal => (
                <div key={goal.id} className="group p-8 rounded-[32px] bg-background border border-border/10 hover:border-primary/20 transition-all duration-500 flex flex-col h-full relative">
                  <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => setEditingGoal(goal)} className="p-2 hover:bg-secondary/10 rounded-xl text-muted-foreground/40 hover:text-primary transition-all">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => deleteGoal(goal.id)} className="p-2 hover:bg-secondary/10 rounded-xl text-muted-foreground/40 hover:text-destructive transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="mb-6">
                    <CategoryBadge category={goal.category} className="mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold tracking-tight leading-tight group-hover:text-primary transition-colors pr-12">
                      {goal.title}
                    </h3>
                  </div>

                  <div className="mt-auto space-y-4">
                    <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest opacity-30">
                      <span>{goal.status}</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <ProgressBar value={goal.progress} className="h-1 opacity-20 group-hover:opacity-100 transition-all" />
                  </div>
                </div>
              ))}

              {filteredGoals.filter(g => g.quarter === q).length === 0 && !isAddingToQuarter && (
                <div className="col-span-full py-16 text-center border-2 border-border/5 rounded-[32px] opacity-20 italic">
                  <span className="text-xs font-semibold uppercase tracking-widest">No objectives manifested for this quarter</span>
                </div>
              )}
            </div>

            {/* Inline Add Form */}
            {isAddingToQuarter === q && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                <div className="w-full max-w-lg bg-background border border-border/10 rounded-[40px] p-10 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-300">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold tracking-tight text-foreground/80">Add {q} Objective</h3>
                    <button onClick={() => setIsAddingToQuarter(null)} className="p-2 hover:bg-secondary/10 rounded-full transition-all text-muted-foreground/30"><X size={20} /></button>
                  </div>
                  <form onSubmit={(e) => addGoal(e, q)} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-4">Title</label>
                      <input name="title" required className="w-full bg-secondary/10 border-2 border-border/10 rounded-2xl px-6 py-4 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20" placeholder="Enter objective title..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-4">Category</label>
                      <select name="category" className="w-full bg-secondary/10 border-2 border-border/10 rounded-2xl px-6 py-4 text-sm font-semibold focus:outline-none appearance-none cursor-pointer">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <Button type="submit" className="w-full rounded-2xl py-6 h-auto text-sm font-semibold">
                      Establish Objective
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Edit Modal */}
      {editingGoal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-background border border-border/10 rounded-[40px] p-10 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold tracking-tight">Modify Objective</h3>
              <button onClick={() => setEditingGoal(null)} className="p-2 hover:bg-secondary/10 rounded-full transition-all text-muted-foreground/30"><X size={20} /></button>
            </div>
            <form onSubmit={updateGoal} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-4">Title</label>
                <input name="title" defaultValue={editingGoal.title} required className="w-full bg-secondary/10 border-2 border-border/10 rounded-2xl px-6 py-4 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-4">Category</label>
                  <select name="category" defaultValue={editingGoal.category} className="w-full bg-secondary/10 border-2 border-border/10 rounded-2xl px-6 py-4 text-xs font-semibold focus:outline-none cursor-pointer">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-4">Status</label>
                  <select name="status" defaultValue={editingGoal.status} className="w-full bg-secondary/10 border-2 border-border/10 rounded-2xl px-6 py-4 text-xs font-semibold focus:outline-none cursor-pointer">
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Half Done">Half Done</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-4 mr-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Progress</label>
                  <span className="text-xs font-bold text-primary">50%</span>
                </div>
                <input type="range" name="progress" min="0" max="100" defaultValue={editingGoal.progress} className="w-full h-1.5 bg-secondary/20 rounded-lg appearance-none cursor-pointer accent-primary mt-2" />
              </div>
              <Button type="submit" className="w-full rounded-2xl py-6 h-auto text-sm font-semibold group mt-4">
                <Save className="mr-2 group-hover:scale-110 transition-transform" size={18} /> Sync Objective
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
