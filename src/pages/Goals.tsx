import { useState, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Goal, GoalCategory, GoalStatus, GoalTimeFrame } from '@/types/lifeos';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Target, Trash2, ChevronRight, TrendingUp, Clock, Filter, Layers } from 'lucide-react';
import { PageHeader, EmptyState, Button, ProgressBar, CategoryBadge, StatCard } from '@/components/shared';
import { useData } from '@/contexts/DataContext';

const categories: GoalCategory[] = ['Wealth', 'Health', 'Skills', 'Relationships', 'Spiritual', 'Lifestyle', 'Books', 'Finance', 'Networking'];

export default function Goals() {
  const { goals, setGoals } = useData();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<GoalCategory | 'All'>('All');
  const [form, setForm] = useState({
    title: '', description: '', category: 'Skills' as GoalCategory,
    timeframe: 'Annual' as GoalTimeFrame
  });

  const filteredGoals = useMemo(() =>
    filter === 'All' ? goals : goals.filter(g => g.category === filter),
    [goals, filter]);

  const addGoal = () => {
    if (!form.title.trim()) return;
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      ...form,
      status: 'Not Started',
      progress: 0,
    };
    setGoals([...goals, newGoal]);
    setForm({ title: '', description: '', category: 'Skills', timeframe: 'Annual' });
    setOpen(false);
  };

  const updateProgress = (id: string, delta: number) => {
    setGoals(goals.map(g => {
      if (g.id !== id) return g;
      const progress = Math.min(100, Math.max(0, g.progress + delta));
      const status: GoalStatus = progress === 0 ? 'Not Started' : progress === 100 ? 'Completed' : 'In Progress';
      return { ...g, progress, status };
    }));
  };

  const deleteGoal = (id: string) => setGoals(goals.filter(g => g.id !== id));

  return (
    <div className="max-w-5xl mx-auto pb-32 px-4 animate-fade-in">
      <PageHeader title="Objectives" description="Manage high-impact performance targets." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <StatCard label="Active" value={goals.filter(g => g.status !== 'Completed').length} icon={<Target />} />
        <StatCard label="Success" value={goals.filter(g => g.status === 'Completed').length} icon={<Layers />} className="bg-success/5" />
        <StatCard label="Pipeline" value={goals.length} icon={<Clock />} />
      </div>

      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">Registry</h2>
          <Select value={filter} onValueChange={v => setFilter(v as any)}>
            <SelectTrigger className="w-[120px] bg-transparent border-none text-[8px] font-black uppercase tracking-widest text-primary h-auto p-0 focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border-border/10 rounded-xl">
              <SelectItem value="All" className="text-[9px] font-bold uppercase tracking-widest">All domains</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c} className="text-[9px] font-bold uppercase tracking-widest">{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl border-border/10">
              <Plus size={14} className="mr-2" /> New objective
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-background border border-border/10 p-8 rounded-3xl shadow-2xl">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-lg font-black uppercase tracking-tight italic border-b border-border/10 pb-4">Initialize Objective</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Title</label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-secondary/5 border-border/10 rounded-xl h-11 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Domain</label>
                  <Select value={form.category} onValueChange={v => setForm({ ...form, category: v as GoalCategory })}>
                    <SelectTrigger className="bg-secondary/5 border-border/10 rounded-xl h-11 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-background border-border/10">{categories.map(c => <SelectItem key={c} value={c} className="text-[8px] uppercase font-bold">{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Horizon</label>
                  <Select value={form.timeframe} onValueChange={v => setForm({ ...form, timeframe: v as GoalTimeFrame })}>
                    <SelectTrigger className="bg-secondary/5 border-border/10 rounded-xl h-11 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-background border-border/10">
                      {['Quarterly', 'Annual', 'Three Year'].map(t => <SelectItem key={t} value={t} className="text-[8px] uppercase font-bold">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={addGoal} className="w-full h-12 mt-4">Deploy objective</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {filteredGoals.length === 0 ? (
        <EmptyState title="Queue inactive" description="Define your next performance marker." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map(goal => (
            <div key={goal.id} className="bg-background border border-border/10 p-6 rounded-2xl group transition-all hover:bg-secondary/5">
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-2">
                  <CategoryBadge category={goal.category} />
                  <h3 className="text-base font-black tracking-tight leading-tight group-hover:text-primary transition-colors uppercase italic">{goal.title}</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)} className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={12} className="text-destructive/40" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest">
                  <div className="flex gap-4">
                    <span className="text-muted-foreground/30">{goal.timeframe}</span>
                  </div>
                  <span className="text-primary">{goal.progress}%</span>
                </div>
                <ProgressBar value={goal.progress} className="h-1 bg-secondary/10" />
                <div className="flex gap-2 pt-2">
                  <button onClick={() => updateProgress(goal.id, -10)} className="text-[7px] font-bold uppercase tracking-widest border border-border/10 px-2 py-1 rounded hover:bg-secondary/20 transition-colors">Dec</button>
                  <button onClick={() => updateProgress(goal.id, 10)} className="text-[7px] font-bold uppercase tracking-widest border border-border/10 px-2 py-1 rounded hover:bg-secondary/20 transition-colors">Inc</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
