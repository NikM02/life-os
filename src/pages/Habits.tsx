import { useState, useMemo } from 'react';
import { Habit, GoalCategory } from '@/types/lifeos';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus, Check, Trash2, Droplets, Moon, Dumbbell,
  Smile, ChevronLeft, ChevronRight, Activity, Download
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

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(currentDate, 6 - i);
    return format(d, 'yyyy-MM-dd');
  });

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="max-w-5xl mx-auto pb-32 px-4 animate-fade-in shadow-none">
      <PageHeader title="Biologicals" description="Maintain peak physiological configuration.">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => exportHabitsDataToCSV(habits, health)} className="opacity-40 hover:opacity-100">
            <Download size={14} className="mr-2" /> Export
          </Button>
          <div className="flex items-center gap-4 bg-secondary/5 px-3 py-1.5 rounded-xl border border-border/10">
            <button onClick={() => setCurrentDate(prev => subDays(prev, 1))} className="opacity-30 hover:opacity-100 transition-opacity"><ChevronLeft size={14} /></button>
            <div className="flex flex-col items-center min-w-[70px]">
              <span className="text-[10px] font-black uppercase tracking-tighter italic">{format(currentDate, 'MMM d')}</span>
            </div>
            <button onClick={() => setCurrentDate(prev => addDays(prev, 1))} disabled={isToday} className="disabled:opacity-5 opacity-30 hover:opacity-100 transition-opacity"><ChevronRight size={14} /></button>
          </div>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-24 opacity-80">
        {[
          { label: 'Sleep', value: `${activeHealth.sleep}H`, icon: Moon, field: 'sleep', max: 12, step: 0.5 },
          { label: 'Hydration', value: `${activeHealth.water}L`, icon: Droplets, field: 'water', max: 5, step: 0.25 },
          { label: 'State', value: `${activeHealth.mood}/10`, icon: Smile, field: 'mood', max: 10, step: 1 },
        ].map((item) => (
          <div key={item.label} className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 italic">{item.label}</span>
              <span className="text-sm font-black italic">{item.value}</span>
            </div>
            <Slider value={[(activeHealth as any)[item.field]]} onValueChange={([v]) => updateHealth(item.field, v)} max={item.max} step={item.step} className="h-1" />
          </div>
        ))}
        <div className="space-y-4">
          <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Activity</span>
          <Input
            className="bg-secondary/5 border-none border-b border-border/10 rounded-none h-6 p-0 text-sm font-black italic uppercase placeholder:text-muted-foreground/10 focus-visible:ring-0"
            placeholder="Log session..."
            value={activeHealth.workout}
            onChange={e => updateHealth('workout', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-12">
        <div className="flex justify-between items-center opacity-30">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] italic flex items-center gap-3"><Activity size={10} /> Runtime Protocols</h2>
          <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="text-[8px] font-black uppercase tracking-widest">
            Init protocol
          </Button>
        </div>

        {habits.length === 0 ? (
          <EmptyState title="Idle" description="Initialize biological performance tracking." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {habits.map(habit => {
              const doneToday = habit.completedDates.includes(dateStr);
              return (
                <div key={habit.id} className="border border-border/10 p-6 rounded-2xl group hover:bg-secondary/5 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <CategoryBadge category={habit.category} className="opacity-40" />
                      <h3 className="text-sm font-black italic uppercase tracking-tight">{habit.name}</h3>
                    </div>
                    <button onClick={() => deleteHabit(habit.id)} className="opacity-0 group-hover:opacity-100 text-destructive/20 hover:text-destructive transition-opacity"><Trash2 size={10} /></button>
                  </div>

                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black italic tracking-tighter text-primary">{habit.streak}</span>
                      <span className="text-[7px] font-black uppercase tracking-widest opacity-20 italic">STREAK</span>
                    </div>
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className={cn(
                        "w-10 h-10 rounded-full border flex items-center justify-center transition-all",
                        doneToday ? "bg-primary border-primary text-background" : "border-border/10 text-muted-foreground/10 hover:border-primary/40 hover:text-primary"
                      )}
                    >
                      <Check size={18} strokeWidth={4} />
                    </button>
                  </div>

                  <div className="pt-4 border-t border-border/5 flex gap-1 justify-between">
                    {last7.map((date) => {
                      const done = habit.completedDates.includes(date);
                      return <div key={date} className={cn("h-0.5 flex-1 rounded-full opacity-20", done ? "bg-primary opacity-100" : "bg-secondary/20")} />
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-background border-border/10 max-w-md p-10 rounded-3xl">
          <DialogHeader><DialogTitle className="text-lg font-black uppercase tracking-tight italic border-b border-border/5 pb-4">INIT PROTOCOL</DialogTitle></DialogHeader>
          <div className="space-y-6 mt-8">
            <div className="space-y-2">
              <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Directive</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-secondary/5 border-border/10 rounded-xl h-11 text-[10px] font-bold uppercase tracking-widest" />
            </div>
            <div className="space-y-2">
              <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Domain</label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v as GoalCategory })}>
                <SelectTrigger className="bg-secondary/5 border-border/10 rounded-xl h-11 text-[10px] font-bold uppercase tracking-widest"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-background border-border/10">{categories.map(c => <SelectItem key={c} value={c} className="text-[10px] font-bold uppercase tracking-widest">{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={addHabit} className="w-full h-12 mt-4">DEPLOY PROTOCOL</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
