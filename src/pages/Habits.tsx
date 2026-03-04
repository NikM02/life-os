import React, { useState, useMemo } from 'react';
import {
  Activity, Zap, Moon, Droplets, Flame, Smile, Plus,
  ChevronRight, TrendingUp, Calendar, Heart, BrainCircuit,
  Dna, Gauge, CheckCircle2, Circle, Trash2, Edit2, Download,
  X, Info, ListFilter, Star, Clock, Sparkles, Battery,
  Brain, History
} from 'lucide-react';
import { PageHeader, StatCard, Button, CategoryBadge } from '@/components/shared';
import { useData } from '@/contexts/DataContext';
import { format, isSameDay, startOfWeek, addDays, isWithinInterval, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Habit, HealthEntry, GoalCategory } from '@/types/lifeos';
import { exportHabitsDataToCSV } from '@/lib/export-utils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const CATEGORIES: GoalCategory[] = ['Health', 'Skills', 'Relationships', 'Spiritual', 'Lifestyle', 'Wealth'];

export default function Habits() {
  const { habits, setHabits, health, setHealth } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeModal, setActiveModal] = useState<'habit' | 'bio' | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Filter Stats
  const todayData = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return health.find(h => h.date === dateStr) || {
      sleep: 0, water: 0, workout: '', mood: 5, energy: 5, date: dateStr
    };
  }, [health, selectedDate]);

  const stats = useMemo(() => {
    const total = health.length || 1;
    return {
      avgSleep: (health.reduce((s, h) => s + h.sleep, 0) / total).toFixed(1),
      avgWater: (health.reduce((s, h) => s + h.water, 0) / total).toFixed(1),
      avgEnergy: (health.reduce((s, h) => s + h.energy, 0) / total).toFixed(1),
      avgMood: (health.reduce((s, h) => s + h.mood, 0) / total).toFixed(1),
    };
  }, [health]);

  // Handlers
  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const weekdaysArr = WEEKDAYS.map((_, i) => formData.get(`day-${i}`) ? i : -1).filter(d => d !== -1);

    const newHabit: Habit = {
      id: editingHabit?.id || crypto.randomUUID(),
      name: formData.get('name') as string,
      category: formData.get('category') as GoalCategory,
      priority: formData.get('priority') as 'Low' | 'Medium' | 'High',
      description: formData.get('description') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      weekdays: weekdaysArr,
      streak: editingHabit?.streak || 0,
      completedDates: editingHabit?.completedDates || []
    };

    if (editingHabit) {
      setHabits(habits.map(h => h.id === editingHabit.id ? newHabit : h));
    } else {
      setHabits([...habits, newHabit]);
    }
    setActiveModal(null);
    setEditingHabit(null);
  };

  const updateBiological = (metric: keyof HealthEntry, value: any) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existingIndex = health.findIndex(h => h.date === dateStr);
    const newData = { ...todayData, [metric]: value, date: dateStr };

    if (existingIndex >= 0) {
      setHealth(health.map((h, i) => i === existingIndex ? newData : h));
    } else {
      setHealth([...health, newData as HealthEntry]);
    }
  };

  const toggleHabitCompletion = (id: string) => {
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    setHabits(habits.map(h => {
      if (h.id === id) {
        const completed = h.completedDates.includes(dateStr);
        const newDates = completed
          ? h.completedDates.filter(d => d !== dateStr)
          : [...h.completedDates, dateStr];

        // Redimentary streak calculation
        let streak = 0;
        const sorted = [...newDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        let checkDate = new Date();
        if (sorted.includes(format(checkDate, 'yyyy-MM-dd'))) {
          for (let i = 0; i < sorted.length; i++) {
            if (sorted.includes(format(checkDate, 'yyyy-MM-dd'))) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else break;
          }
        }

        return { ...h, completedDates: newDates, streak };
      }
      return h;
    }));
  };

  const deleteHabit = (id: string) => {
    if (confirm('Erase this protocol?')) {
      setHabits(habits.filter(h => h.id !== id));
    }
  };

  const exportBioCSV = () => {
    const rows = [['ID', 'Date', 'Sleep (h)', 'Water (L)', 'Mood (1-10)', 'Energy (1-10)', 'Workout']];
    health.sort((a, b) => b.date.localeCompare(a.date)).forEach((h, i) => {
      rows.push([(i + 1).toString(), h.date, h.sleep.toString(), h.water.toString(), h.mood.toString(), h.energy.toString(), h.workout || '']);
    });
    const csvContent = rows.map(e => e.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `biological_archive_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const exportHabitCSV = () => {
    const rows = [['ID', 'Habit Name', 'Category', 'Priority', 'Start Date', 'End Date', 'Description', 'Streak']];
    habits.forEach(h => {
      rows.push([h.id, h.name, h.category, h.priority, h.startDate || '', h.endDate || '', h.description || '', h.streak.toString()]);
    });
    const csvContent = rows.map(e => e.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `habits_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto pb-32 px-4 animate-fade-in shadow-none">
      <PageHeader title="Biologicals & Habits" description="">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportHabitCSV} className="rounded-xl">
            <Download size={14} />
            Export Habits
          </Button>
          <Button onClick={() => { setEditingHabit(null); setActiveModal('habit'); }} className="rounded-xl shadow-lg shadow-primary/10">
            <Plus size={16} />
            Add Habit
          </Button>
        </div>
      </PageHeader>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        <StatCard label="Sleep Mean" value={`${stats.avgSleep}h`} icon={<Moon />} />
        <StatCard label="Hydration" value={`${stats.avgWater}L`} icon={<Droplets />} />
        <StatCard label="Neuro Tone" value={`${stats.avgMood}/10`} icon={<Brain />} />
        <StatCard label="Energy Bias" value={`${stats.avgEnergy}/10`} icon={<Battery />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left: Biologicals */}
        <div className="lg:col-span-5 space-y-12">
          <section className="p-8 rounded-[2rem] bg-secondary/5 border border-border/5 space-y-10">
            <div className="flex items-center justify-between border-b border-border/10 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                  <Activity size={18} />
                </div>
                <h3 className="font-semibold tracking-tight uppercase text-xs">Bio Tracker</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveModal('bio')} className="text-[10px] uppercase font-bold tracking-widest opacity-40 hover:opacity-100">
                <History size={14} className="mr-2" />
                Archive
              </Button>
            </div>

            <div className="space-y-10">
              {[
                { label: 'Regeneration', key: 'sleep', max: 12, unit: 'h', icon: Moon },
                { label: 'Hydration', key: 'water', max: 5, unit: 'L', icon: Droplets },
                { label: 'Neural Tone', key: 'mood', max: 10, unit: '/10', icon: Smile },
                { label: 'Energy Potential', key: 'energy', max: 10, unit: '/10', icon: Battery },
              ].map((item) => (
                <div key={item.key} className="space-y-4 group">
                  <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-2">
                      <item.icon size={12} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{item.label}</label>
                    </div>
                    <span className="text-xs font-bold font-mono tracking-tighter opacity-60">{(todayData as any)[item.key]}{item.unit}</span>
                  </div>
                  <input
                    type="range" min="0" max={item.max} step={item.key === 'water' || item.key === 'sleep' ? 0.25 : 1}
                    className="w-full h-1.5 bg-secondary/20 rounded-full appearance-none cursor-pointer accent-primary"
                    value={(todayData as any)[item.key]}
                    onChange={(e) => updateBiological(item.key as any, parseFloat(e.target.value))}
                  />
                </div>
              ))}

              <div className="space-y-4 pt-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">Physical Protocol</label>
                <textarea
                  className="w-full bg-background border border-border/10 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all resize-none h-24"
                  placeholder="Describe activity or biomarkers..."
                  value={todayData.workout}
                  onChange={(e) => updateBiological('workout', e.target.value)}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right: Habits */}
        <div className="lg:col-span-7 space-y-10">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Active Protocols</h2>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">{habits.length} Habits</span>
          </div>

          {habits.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 border-2 border-border/5 rounded-3xl text-center">
              <Calendar size={32} className="text-muted-foreground/10 mb-4" />
              <p className="text-xs font-medium text-muted-foreground/30">No protocols initialized.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {habits.map((habit) => (
                <div key={habit.id} className="group relative bg-secondary/10 border border-border/5 hover:border-primary/20 rounded-[2rem] p-8 transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform">
                    <button onClick={() => { setEditingHabit(habit); setActiveModal('habit'); }} className="p-2 hover:bg-background rounded-xl text-muted-foreground/30 hover:text-primary transition-all">
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => deleteHabit(habit.id)} className="p-2 hover:bg-background rounded-xl text-muted-foreground/30 hover:text-destructive transition-all">
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <CategoryBadge category={habit.category} className="opacity-40" />
                        <div className={cn(
                          "px-2 py-0.5 rounded-lg border text-[9px] font-bold uppercase",
                          habit.priority === 'High' ? "border-destructive/30 text-destructive/60" :
                            habit.priority === 'Medium' ? "border-primary/30 text-primary" : "border-border/30 text-muted-foreground/30"
                        )}>{habit.priority}</div>
                      </div>
                      <h4 className="text-lg font-semibold tracking-tight leading-tight group-hover:text-primary transition-colors pr-8">
                        {habit.name}
                      </h4>
                      {habit.description && <p className="text-[10px] text-muted-foreground/40 line-clamp-2 leading-relaxed italic">{habit.description}</p>}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/20">Streak</span>
                        <div className="flex items-center gap-1.5 pt-1">
                          <Flame size={14} className={cn("transition-colors", habit.streak > 0 ? "text-orange-500" : "text-muted-foreground/20")} />
                          <span className="text-sm font-bold font-mono">{habit.streak}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleHabitCompletion(habit.id)}
                        className={cn(
                          "w-12 h-12 rounded-2xl border transition-all duration-500 flex items-center justify-center",
                          habit.completedDates.includes(format(new Date(), 'yyyy-MM-dd'))
                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-95"
                            : "bg-background border-border/10 text-transparent hover:border-primary/40 hover:text-primary/10"
                        )}
                      >
                        <CheckCircle2 size={24} strokeWidth={1} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Habit Modal */}
      {activeModal === 'habit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-fade-in shadow-none">
          <div className="bg-background border border-border/10 rounded-[2.5rem] w-full max-w-xl p-10 shadow-2xl space-y-8 relative overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-semibold tracking-tight">{editingHabit ? 'Edit Protocol' : 'Initial Protocol'}</h2>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-secondary rounded-2xl transition-colors">
                <X size={20} className="text-muted-foreground/40" />
              </button>
            </div>

            <form onSubmit={handleSaveHabit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">Descriptor</label>
                  <input
                    name="name" required
                    defaultValue={editingHabit?.name}
                    className="w-full bg-background border border-border/10 rounded-2xl px-6 py-4 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                    placeholder="Habit name..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">Classification</label>
                    <select
                      name="category"
                      defaultValue={editingHabit?.category || 'Health'}
                      className="w-full bg-background border border-border/10 rounded-2xl px-6 py-4 text-sm font-semibold appearance-none focus:outline-none"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">Priority Bias</label>
                    <select
                      name="priority"
                      defaultValue={editingHabit?.priority || 'Medium'}
                      className="w-full bg-background border border-border/10 rounded-2xl px-6 py-4 text-sm font-semibold appearance-none focus:outline-none"
                    >
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">Start Threshold</label>
                    <input
                      type="date" name="startDate"
                      defaultValue={editingHabit?.startDate}
                      className="w-full bg-background border border-border/10 rounded-2xl px-6 py-4 text-sm font-semibold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">End Threshold</label>
                    <input
                      type="date" name="endDate"
                      defaultValue={editingHabit?.endDate}
                      className="w-full bg-background border border-border/10 rounded-2xl px-6 py-4 text-sm font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">Weekly Resonance</label>
                  <div className="flex justify-between gap-2 p-4 bg-secondary/5 border border-border/10 rounded-2xl">
                    {WEEKDAYS.map((day, i) => (
                      <label key={day} className="flex flex-col items-center gap-2 cursor-pointer group">
                        <span className="text-[9px] font-bold text-muted-foreground/20 group-hover:text-primary transition-colors">{day}</span>
                        <input
                          type="checkbox" name={`day-${i}`}
                          defaultChecked={editingHabit?.weekdays?.includes(i)}
                          className="w-5 h-5 rounded-lg border-2 border-border/20 appearance-none checked:bg-primary checked:border-primary transition-all cursor-pointer"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">Contextual Metadata</label>
                  <textarea
                    name="description"
                    defaultValue={editingHabit?.description}
                    className="w-full bg-background border border-border/10 rounded-2xl p-4 text-xs font-medium focus:outline-none h-24 resize-none"
                    placeholder="Protocol details..."
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1 rounded-2xl" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button type="submit" className="flex-1 rounded-2xl shadow-lg shadow-primary/20">Initialize</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bio Archive Dialog */}
      {activeModal === 'bio' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-fade-in shadow-none">
          <div className="bg-background border border-border/10 rounded-[2.5rem] w-full max-w-4xl p-10 shadow-2xl space-y-8 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold tracking-tight">Biological Audit Archive</h2>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={exportBioCSV} className="rounded-xl py-2">
                  <Download size={14} />
                  Export CSV
                </Button>
                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-secondary rounded-2xl transition-colors">
                  <X size={20} className="text-muted-foreground/40" />
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
              <table className="w-full">
                <thead className="sticky top-0 bg-background pb-4 border-b border-border/10">
                  <tr className="text-left">
                    <th className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 py-4">Bio-Stamp</th>
                    <th className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 py-4">Sleep</th>
                    <th className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 py-4">H2O</th>
                    <th className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 py-4">Neuro</th>
                    <th className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 py-4">Energy</th>
                    <th className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 py-4">Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5">
                  {health.sort((a, b) => b.date.localeCompare(a.date)).map((entry, i) => (
                    <tr key={i} className="hover:bg-secondary/5 transition-colors">
                      <td className="py-5 text-xs font-semibold">{format(parseISO(entry.date), 'MMM d, yyyy')}</td>
                      <td className="py-5 text-xs font-mono">{entry.sleep}h</td>
                      <td className="py-5 text-xs font-mono">{entry.water}L</td>
                      <td className="py-5 text-xs font-mono">{entry.mood}/10</td>
                      <td className="py-5 text-xs font-mono">{entry.energy}/10</td>
                      <td className="py-5 text-[10px] text-muted-foreground/50 italic max-w-xs truncate">{entry.workout || '--'}</td>
                    </tr>
                  ))}
                  {health.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-xs font-medium text-muted-foreground/20">Archive empty.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
