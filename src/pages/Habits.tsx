import { useState, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Habit, HealthEntry, GoalCategory } from '@/types/lifeos';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus, Flame, Check, Trash2, Droplets, Moon, Dumbbell,
  Smile, ChevronLeft, ChevronRight, Activity, Zap, Shield, Sparkles, Heart, BrainCircuit, Download
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader, EmptyState, Button, ProgressBar, CategoryBadge } from '@/components/shared';
import { format, subDays, addDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useData } from '@/contexts/DataContext';
import { exportAllDataToCSV, exportHabitsDataToCSV } from '@/lib/export-utils';

const categories: GoalCategory[] = ['Wealth', 'Health', 'Skills', 'Relationships', 'Spiritual', 'Lifestyle', 'Books', 'Finance', 'Networking'];

export default function Habits() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const isToday = isSameDay(currentDate, new Date());

  const { habits, setHabits, health, setHealth } = useData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Health' as GoalCategory });

  const activeHealth = useMemo(() => {
    return health.find(h => h.date === dateStr) || { date: dateStr, sleep: 0, water: 0, workout: '', mood: 5 };
  }, [health, dateStr]);

  const addHabit = () => {
    if (!form.name.trim()) return;
    setHabits([...habits, { id: crypto.randomUUID(), name: form.name, category: form.category, streak: 0, completedDates: [] }]);
    setForm({ name: '', category: 'Health' });
    setOpen(false);
  };

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => {
      if (h.id !== id) return h;
      const done = h.completedDates.includes(dateStr);
      const completedDates = done ? h.completedDates.filter(d => d !== dateStr) : [...h.completedDates, dateStr];
      const streak = done ? Math.max(0, h.streak - 1) : h.streak + 1;
      return { ...h, completedDates, streak };
    }));
  };

  const deleteHabit = (id: string) => setHabits(habits.filter(h => h.id !== id));

  const updateHealth = (field: string, value: number | string) => {
    const updated = health.filter(h => h.date !== dateStr);
    setHealth([...updated, { ...activeHealth, [field]: value }]);
  };

  const navigateDate = (days: number) => {
    setCurrentDate(prev => days > 0 ? addDays(prev, days) : subDays(prev, Math.abs(days)));
  };

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(currentDate, 6 - i);
    return format(d, 'yyyy-MM-dd');
  });

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="max-w-6xl mx-auto pb-32 px-4 animate-fade-in">
      <PageHeader title="Habits & Health" description="Monitor your daily protocols and biometrics.">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 bg-secondary/20 p-1 rounded-xl border border-white/5 backdrop-blur-md">
            <Button variant="ghost" size="icon" onClick={() => navigateDate(-1)} className="h-8 w-8 rounded-lg">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-col items-center min-w-[100px]">
              <span className="text-xs font-bold tracking-tight">{format(currentDate, 'MMM d, yyyy')}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigateDate(1)} className="h-8 w-8 rounded-lg" disabled={isToday}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportHabitsDataToCSV(habits, health)}
            className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-xl px-4 h-10 transition-all text-[9px] font-extrabold uppercase tracking-widest text-primary"
          >
            <Download className="h-3.5 w-3.5" />
            Export Data
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="habits" className="mt-12">
        <TabsList className="mb-12 bg-secondary/20 p-1.5 rounded-2xl border border-white/5 w-fit mx-auto backdrop-blur-xl">
          <TabsTrigger value="habits" className="px-10 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow data-[state=active]:shadow-primary/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500">
            Psychology
          </TabsTrigger>
          <TabsTrigger value="health" className="px-10 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow data-[state=active]:shadow-primary/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500">
            Biology
          </TabsTrigger>
        </TabsList>

        <TabsContent value="habits" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-glow shadow-primary/10">
                <Activity className="h-6 w-6" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground/60">Active Protocols</h2>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="primary" size="sm" className="h-11 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-glow shadow-primary/20">
                  <Plus className="h-4 w-4 mr-2" /> New Protocol
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md glass-card border-white/10 p-0 overflow-hidden rounded-[2rem]">
                <div className="bg-primary/5 p-8 border-b border-white/5">
                  <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Shield className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Habit Architecture</span>
                    </div>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight text-foreground">New Habit Protocol</DialogTitle>
                  </DialogHeader>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Protocol Name</label>
                    <Input placeholder="System action..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-secondary/30 border-white/5 rounded-xl h-12 font-bold text-foreground placeholder:text-muted-foreground/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Domain</label>
                    <Select value={form.category} onValueChange={v => setForm({ ...form, category: v as GoalCategory })}>
                      <SelectTrigger className="bg-secondary/30 border-white/5 rounded-xl h-12 font-bold text-foreground"><SelectValue /></SelectTrigger>
                      <SelectContent className="glass-card border-white/10 rounded-xl">{categories.map(c => <SelectItem key={c} value={c} className="font-bold text-xs">{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Button variant="primary" onClick={addHabit} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs mt-4 shadow-glow shadow-primary/20">Initialize Protocol</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {habits.length === 0 ? (
            <EmptyState title="No Systems Active" description="Initialize your first habit protocol to begin performance tracking.">
              <Button variant="primary" size="sm" onClick={() => setOpen(true)} className="rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[10px]">
                <Plus className="h-4 w-4 mr-2" /> Start System
              </Button>
            </EmptyState>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {habits.map(habit => {
                const doneToday = habit.completedDates.includes(dateStr);
                return (
                  <div key={habit.id} className="glass-card p-8 group relative hover:border-primary/30 transition-all duration-700 rounded-[2.5rem] overflow-hidden animate-slide-up shadow-xl">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none transform scale-150 rotate-12 group-hover:opacity-[0.06] group-hover:scale-[1.7] transition-all duration-1000">
                      <Zap className="h-16 w-16 text-primary" />
                    </div>

                    <div className="flex items-start justify-between mb-8 relative z-10">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <CategoryBadge category={habit.category} />
                          {habit.streak > 5 && <div className="p-1 px-3 rounded-full bg-warning/10 text-warning text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-warning/20">
                            <Flame className="h-3 w-3" /> Hot Streak
                          </div>}
                        </div>
                        <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors leading-tight text-foreground/90">{habit.name}</h3>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <Button variant="ghost" size="icon" onClick={() => deleteHabit(habit.id)} className="h-10 w-10 rounded-xl bg-white/5 hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-8 relative z-10 p-5 rounded-3xl bg-secondary/20 border border-white/5">
                      <div className="flex items-center gap-4 px-2">
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 mb-1">Streak</span>
                          <span className="text-3xl font-black italic tracking-tighter text-warning">{habit.streak}</span>
                        </div>
                        <div className="h-10 w-[1px] bg-white/5 mx-2" />
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 mb-1">Reliability</span>
                          <span className="text-3xl font-black italic tracking-tighter text-primary">{Math.round((habit.completedDates.length / 30) * 100)}%</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleHabit(habit.id)}
                        className={cn(
                          "w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-700 shadow-glow shadow-primary/0",
                          doneToday
                            ? "bg-primary border-primary text-primary-foreground shadow-primary/20 scale-105"
                            : "bg-background border-white/5 text-muted-foreground/20 hover:border-primary/50 hover:text-muted-foreground/60"
                        )}
                      >
                        <Check className={cn("h-9 w-9 transition-transform duration-700", doneToday ? "scale-110" : "scale-50 opacity-10")} />
                      </button>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex gap-2 justify-between relative z-10">
                      {last7.map((date) => {
                        const done = habit.completedDates.includes(date);
                        const isCurrent = date === dateStr;
                        return (
                          <div key={date} className="flex flex-col items-center gap-2 flex-1">
                            <div className={cn(
                              "text-[8px] font-black uppercase tracking-widest",
                              isCurrent ? "text-primary" : "text-muted-foreground/20"
                            )}>{weekDays[new Date(date).getDay()]}</div>
                            <div className={cn(
                              "h-2 w-full rounded-full transition-all duration-500",
                              done ? "bg-primary shadow-glow shadow-primary/40" : "bg-white/5"
                            )} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="health" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl border-white/5 hover:border-indigo-500/20 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <Moon className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sleep</h3>
                <span className="ml-auto text-2xl font-black text-indigo-500">{activeHealth.sleep}h</span>
              </div>
              <Slider value={[activeHealth.sleep]} onValueChange={([v]) => updateHealth('sleep', v)} max={12} step={0.5} />
            </div>

            <div className="glass-card p-6 rounded-2xl border-white/5 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Droplets className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Hydration</h3>
                <span className="ml-auto text-2xl font-black text-primary">{activeHealth.water}L</span>
              </div>
              <Slider value={[activeHealth.water]} onValueChange={([v]) => updateHealth('water', v)} max={5} step={0.25} />
            </div>

            <div className="glass-card p-6 rounded-2xl border-white/5 hover:border-success/20 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-success/10 text-success">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Workout</h3>
              </div>
              <Input
                placeholder="Session details..."
                value={activeHealth.workout}
                onChange={e => updateHealth('workout', e.target.value)}
                className="bg-secondary/20 border-white/5 rounded-xl h-12 text-sm"
              />
            </div>

            <div className="glass-card p-6 rounded-2xl border-white/5 hover:border-warning/20 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-warning/10 text-warning">
                  <Smile className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mood</h3>
                <span className="ml-auto text-2xl font-black text-warning">{activeHealth.mood}/10</span>
              </div>
              <Slider value={[activeHealth.mood]} onValueChange={([v]) => updateHealth('mood', v)} min={1} max={10} step={1} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
