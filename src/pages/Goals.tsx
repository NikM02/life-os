import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Goal, GoalCategory, GoalStatus, GoalTimeframe } from '@/types/lifeos';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus, Target, Trash2, Edit2, Calendar, MessageSquare,
  Info, CheckCircle2, Clock, PlayCircle, Loader2, Sparkles,
  Shield, Zap, Rocket, Crosshair, TrendingUp, BookOpen, UserPlus, Heart, Wallet, Compass, Users, Download
} from 'lucide-react';
import { PageHeader, CategoryBadge, StatusBadge, EmptyState, Button } from '@/components/shared';
import { cn } from '@/lib/utils';
import { exportGoalsDataToCSV } from '@/lib/export-utils';

const categories: GoalCategory[] = ['Wealth', 'Health', 'Skills', 'Relationships', 'Spiritual', 'Lifestyle', 'Books', 'Finance', 'Networking'];
const statuses: GoalStatus[] = ['Not Started', 'In Progress', 'Half Done', 'Completed'];
const timeframes: GoalTimeframe[] = ['Monthly', 'Weekly'];

const categoryIcons: Record<string, any> = {
  Wealth: Wallet,
  Health: Heart,
  Skills: Zap,
  Relationships: UserPlus,
  Spiritual: Sparkles,
  Lifestyle: Compass,
  Books: BookOpen,
  Finance: TrendingUp,
  Networking: Users
};

export default function Goals() {
  const { goals, setGoals, execution } = useData();
  const [open, setOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filterTf, setFilterTf] = useState<string>('all');
  const [filterCat, setFilterCat] = useState<string>('all');

  const initialForm = {
    title: '',
    description: '',
    category: 'Wealth' as GoalCategory,
    timeframe: 'Monthly' as GoalTimeframe,
    fromDate: '',
    toDate: '',
    remarks: '',
    linkedIds: [] as string[]
  };
  const [form, setForm] = useState(initialForm);

  const saveGoal = () => {
    if (!form.title.trim()) return;

    if (editingGoal) {
      setGoals(goals.map(g => g.id === editingGoal.id ? { ...g, ...form } : g));
    } else {
      const goal: Goal = {
        id: crypto.randomUUID(),
        ...form,
        status: 'Not Started',
        progress: 0,
        createdAt: new Date().toISOString(),
      };
      setGoals([...goals, goal]);
    }

    closeDialog();
  };

  const closeDialog = () => {
    setOpen(false);
    setEditingGoal(null);
    setForm(initialForm);
  };

  const startEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setForm({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      timeframe: goal.timeframe,
      fromDate: goal.fromDate || '',
      toDate: goal.toDate || '',
      remarks: goal.remarks || '',
      linkedIds: goal.linkedIds || []
    });
    setOpen(true);
  };

  const updateStatus = (id: string, status: GoalStatus) => {
    setGoals(goals.map(g => g.id === id ? { ...g, status, progress: status === 'Completed' ? 100 : status === 'Half Done' ? 50 : g.progress } : g));
  };

  const deleteGoal = (id: string) => setGoals(goals.filter(g => g.id !== id));

  const filtered = goals.filter(g =>
    (filterTf === 'all' || g.timeframe === filterTf) &&
    (filterCat === 'all' || g.category === filterCat)
  );

  const getStatusIcon = (status: GoalStatus) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="h-6 w-6 text-success" />;
      case 'Half Done': return <Loader2 className="h-6 w-6 text-warning animate-spin" />;
      case 'In Progress': return <PlayCircle className="h-6 w-6 text-primary" />;
      default: return <Clock className="h-6 w-6 text-muted-foreground" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-32 px-4 animate-fade-in">
      <PageHeader title="Focus Track" description="Strategic objectives and high-impact operations.">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportGoalsDataToCSV(goals)}
            className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-xl px-4 h-10 transition-all text-[9px] font-extrabold uppercase tracking-widest text-primary"
          >
            <Download className="h-3.5 w-3.5" />
            Export Objectives
          </Button>
          <Dialog open={open} onOpenChange={(val) => { if (!val) closeDialog(); setOpen(val); }}>
            <DialogTrigger asChild>
              <Button variant="primary" size="sm" className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px]">
                <Plus className="h-4 w-4 mr-2" /> New Objective
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md glass-card border-white/10 p-0 overflow-hidden rounded-[2rem]">
              <div className="bg-primary/5 p-8 border-b border-white/5">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Target className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Objective Protocol</span>
                  </div>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight text-foreground">
                    {editingGoal ? 'Recalibrate' : 'Initiate'} Objective
                  </DialogTitle>
                </DialogHeader>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Objective Title</label>
                  <Input placeholder="Operation name..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-secondary/30 border-white/5 rounded-xl h-12 font-bold text-foreground placeholder:text-muted-foreground/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Core Requirement</label>
                  <Input placeholder="Focus details..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-secondary/30 border-white/5 rounded-xl h-12 font-bold text-foreground placeholder:text-muted-foreground/20" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Domain</label>
                    <Select value={form.category} onValueChange={v => setForm({ ...form, category: v as GoalCategory })}>
                      <SelectTrigger className="bg-secondary/30 border-white/5 rounded-xl h-12 font-bold text-foreground"><SelectValue /></SelectTrigger>
                      <SelectContent className="glass-card border-white/10 rounded-xl">{categories.map(c => <SelectItem key={c} value={c} className="font-bold text-xs">{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Horizon</label>
                    <Select value={form.timeframe} onValueChange={v => setForm({ ...form, timeframe: v as GoalTimeframe })}>
                      <SelectTrigger className="bg-secondary/30 border-white/5 rounded-xl h-12 font-bold text-foreground"><SelectValue /></SelectTrigger>
                      <SelectContent className="glass-card border-white/10 rounded-xl">{timeframes.map(t => <SelectItem key={t} value={t} className="font-bold text-xs">{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Start Date</label>
                    <Input type="date" value={form.fromDate} onChange={e => setForm({ ...form, fromDate: e.target.value })} className="bg-secondary/30 border-white/5 rounded-xl h-12 font-bold text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">End Date</label>
                    <Input type="date" value={form.toDate} onChange={e => setForm({ ...form, toDate: e.target.value })} className="bg-secondary/30 border-white/5 rounded-xl h-12 font-bold text-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Intel Remarks</label>
                  <Input placeholder="Additional notes..." value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} className="bg-secondary/30 border-white/5 rounded-xl h-12 font-bold text-foreground placeholder:text-muted-foreground/20" />
                </div>

                <Button variant="primary" onClick={saveGoal} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs mt-4 shadow-glow shadow-primary/20">
                  {editingGoal ? 'Update Objective' : 'Deploy Objective'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader >

      <div className="flex gap-4 mb-12 flex-wrap items-center">
        <div className="flex items-center gap-3 bg-secondary/20 p-1 rounded-xl border border-white/5">
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 px-3">Horizon:</span>
          <Select value={filterTf} onValueChange={setFilterTf}>
            <SelectTrigger className="w-32 h-8 text-[9px] font-black uppercase tracking-widest border-none bg-transparent hover:bg-white/5 rounded-lg"><SelectValue /></SelectTrigger>
            <SelectContent className="glass-card border-white/10 rounded-xl">
              <SelectItem value="all" className="font-black text-[9px] uppercase tracking-widest">Global</SelectItem>
              {timeframes.map(t => <SelectItem key={t} value={t} className="font-black text-[9px] uppercase tracking-widest">{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3 bg-secondary/20 p-1 rounded-xl border border-white/5">
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 px-3">Domain:</span>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-32 h-8 text-[9px] font-black uppercase tracking-widest border-none bg-transparent hover:bg-white/5 rounded-lg"><SelectValue /></SelectTrigger>
            <SelectContent className="glass-card border-white/10 rounded-xl">
              <SelectItem value="all" className="font-black text-[9px] uppercase tracking-widest">Global</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c} className="font-black text-[9px] uppercase tracking-widest">{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {
        filtered.length === 0 ? (
          <EmptyState title="Operational Void" description="Deploy your first objective parameters to begin tracking performance.">
            <Button variant="primary" size="sm" onClick={() => setOpen(true)} className="rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[10px]">
              <Plus className="h-4 w-4 mr-2" /> Initiate Objective
            </Button>
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filtered.map(goal => {
              const Icon = categoryIcons[goal.category] || Target;
              return (
                <div key={goal.id} className="glass-card p-8 group relative overflow-hidden rounded-[2.5rem] border-white/5 hover:border-primary/20 transition-all duration-700">
                  <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none transform scale-150 rotate-12 group-hover:opacity-[0.05] group-hover:scale-[1.7] transition-all duration-700">
                    <Icon className="h-24 w-24" />
                  </div>

                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CategoryBadge category={goal.category} />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 px-2.5 py-1 bg-secondary/40 border border-white/5 rounded-lg">{goal.timeframe}</span>
                          </div>
                          <h3 className="text-xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">{goal.title}</h3>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(goal)} className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)} className="h-10 w-10 rounded-xl hover:bg-destructive/10 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mb-8 relative z-10">
                    <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed italic line-clamp-2">
                      {goal.description || "No specific objective parameters defined."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 p-6 rounded-2xl bg-white/5 border border-white/5 mb-8 relative z-10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                        <Calendar className="h-3 w-3" /> Activation
                      </div>
                      <div className="text-xs font-black tracking-tighter text-foreground/90">{goal.fromDate || 'N/A'}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                        <Crosshair className="h-3 w-3" /> Target
                      </div>
                      <div className="text-xs font-black tracking-tighter text-foreground/90">{goal.toDate || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="relative z-10 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">Status Protocols</span>
                      </div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">{goal.status}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {statuses.map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(goal.id, s)}
                          className={cn(
                            "text-[8px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all duration-500 border",
                            goal.status === s
                              ? 'bg-primary border-primary text-primary-foreground shadow-glow shadow-primary/20 scale-105'
                              : 'bg-white/5 border-transparent text-muted-foreground/40 hover:text-foreground hover:bg-white/10'
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }
    </div >
  );
}
