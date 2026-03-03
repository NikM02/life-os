import { useState, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Habit, HealthEntry, GoalCategory } from '@/types/lifeos';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus, Check, Trash2, Droplets, Moon, Dumbbell,
  Smile, ChevronLeft, ChevronRight, Activity, Zap, Shield, Heart, Download
} from 'lucide-react';
import { PageHeader, EmptyState, Button, CategoryBadge } from '@/components/shared';
import { format, subDays, addDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useData } from '@/contexts/DataContext';
import { exportHabitsDataToCSV } from '@/lib/export-utils';

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
    <div className="max-w-5xl mx-auto pb-32 px-4 animate-fade-in">
      <PageHeader title="Habits" description="Daily systems and biological markers.">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 bg-secondary/10 p-1 rounded-xl border border-border/40">
            <Button variant="ghost" size="icon" onClick={() => navigateDate(-1)} className="h-8 w-8 rounded-lg">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-col items-center min-w-[90px]">
              <span className="text-[10px] font-bold uppercase tracking-wider">{format(currentDate, 'MMM d')}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigateDate(1)} className="h-8 w-8 rounded-lg" disabled={isToday}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => exportHabitsDataToCSV(habits, health)}
            className="gap-2 rounded-xl px-4 h-10 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </PageHeader>

      {/* Minimal Health Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 bg-secondary/5 p-4 rounded-2xl border border-border/20">
        <div className="flex flex-col gap-1 px-2">
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
            <Moon className="h-3 w-3" /> Sleep
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-black tracking-tighter">{activeHealth.sleep}h</span>
            <Slider value={[activeHealth.sleep]} onValueChange={([v]) => updateHealth('sleep', v)} max={12} step={0.5} className="w-16 h-1" />
          </div>
        </div>
        <div className="flex flex-col gap-1 px-2 border-l border-border/20">
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
            <Droplets className="h-3 w-3" /> Water
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-black tracking-tighter">{activeHealth.water}L</span>
            <Slider value={[activeHealth.water]} onValueChange={([v]) => updateHealth('water', v)} max={5} step={0.25} className="w-16 h-1" />
          </div>
        </div>
        <div className="flex flex-col gap-1 px-2 border-l border-border/20">
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
            <Dumbbell className="h-3 w-3" /> Workout
          </div>
          <Input
            placeholder="Log..."
            value={activeHealth.workout}
            onChange={e => updateHealth('workout', e.target.value)}
            className="bg-transparent border-none p-0 h-6 text-sm font-bold tracking-tight focus-visible:ring-0 placeholder:text-muted-foreground/20"
          />
        </div>
        <div className="flex flex-col gap-1 px-2 border-l border-border/20">
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
            <Smile className="h-3 w-3" /> State
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-black tracking-tighter">{activeHealth.mood}</span>
            <Slider value={[activeHealth.mood]} onValueChange={([v]) => updateHealth('mood', v)} min={1} max={10} step={1} className="w-16 h-1" />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Protocols</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg font-bold uppercase tracking-widest text-[9px] border border-border/40 hover:bg-secondary/50">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> New
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-background border border-border/40 p-6 rounded-2xl shadow-2xl">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-lg font-black uppercase tracking-tight">New Habit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Name</label>
                <Input placeholder="Activity description..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-secondary/20 border-border/20 rounded-xl h-10 text-sm font-medium" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Domain</label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v as GoalCategory })}>
                  <SelectTrigger className="bg-secondary/20 border-border/20 rounded-xl h-10 text-sm font-medium"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-background border-border/40 rounded-xl">{categories.map(c => <SelectItem key={c} value={c} className="text-xs font-medium">{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={addHabit} className="w-full h-11 rounded-xl font-bold uppercase tracking-widest text-[10px] mt-2">Create Protocol</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {habits.length === 0 ? (
        <EmptyState title="Systems Offline" description="Initialize your first performance protocol.">
          <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="rounded-xl h-9 px-6 font-bold uppercase tracking-widest text-[9px]">
            <Plus className="h-3.5 w-3.5 mr-2" /> Start
          </Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map(habit => {
            const doneToday = habit.completedDates.includes(dateStr);
            return (
              <div key={habit.id} className="group bg-background/50 border border-border/20 p-6 rounded-3xl hover:border-primary/40 transition-all duration-500">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <CategoryBadge category={habit.category} className="mb-2 opacity-60" />
                    <h3 className="text-base font-black tracking-tight text-foreground/90">{habit.name}</h3>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteHabit(habit.id)} className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="flex items-center justify-between mb-6 p-4 rounded-2xl bg-secondary/10 border border-border/20">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black tracking-tighter text-primary">{habit.streak}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">Streak</span>
                  </div>
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                      doneToday
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                        : "bg-secondary/40 text-muted-foreground/30 hover:bg-secondary/60 hover:text-muted-foreground/50"
                    )}
                  >
                    <Check className={cn("h-6 w-6 transition-all", doneToday ? "scale-100" : "scale-50 opacity-0")} />
                  </button>
                </div>

                <div className="pt-4 border-t border-border/10 flex gap-2 justify-between">
                  {last7.map((date) => {
                    const done = habit.completedDates.includes(date);
                    const isCurrent = date === dateStr;
                    return (
                      <div key={date} className="flex flex-col items-center gap-1.5 flex-1">
                        <div className={cn(
                          "text-[7px] font-bold uppercase tracking-widest",
                          isCurrent ? "text-primary" : "text-muted-foreground/30"
                        )}>{weekDays[new Date(date).getDay()]}</div>
                        <div className={cn(
                          "h-1 w-full rounded-full transition-all duration-500",
                          done ? "bg-primary/80" : "bg-secondary/40"
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
    </div>
  );
}
