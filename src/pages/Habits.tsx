import React, { useState, useMemo } from 'react';
import {
  Activity, Zap, Moon, Droplets, Flame, Smile, Plus,
  ChevronRight, TrendingUp, Calendar, Heart, BrainCircuit,
  Dna, Gauge, CheckCircle2, Circle
} from 'lucide-react';
import { PageHeader, StatCard, ProgressBar, Button } from '@/components/shared';
import { useData } from '@/contexts/DataContext';
import { format, subDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { HealthData } from '@/types/lifeos';

export default function Habits() {
  const { health, setHealth } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const todayData = useMemo(() => {
    return health.find(h => isSameDay(new Date(h.date), selectedDate)) || {
      sleep: 0, water: 0, workout: '', mood: 5, date: format(selectedDate, 'yyyy-MM-dd')
    };
  }, [health, selectedDate]);

  const stats = useMemo(() => {
    const avgSleep = health.length > 0 ? (health.reduce((sum, h) => sum + h.sleep, 0) / health.length).toFixed(1) : 0;
    const avgWater = health.length > 0 ? (health.reduce((sum, h) => sum + h.water, 0) / health.length).toFixed(1) : 0;
    return { avgSleep, avgWater };
  }, [health]);

  const updateMetric = (metric: keyof HealthData, value: any) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existingIndex = health.findIndex(h => h.date === dateStr);

    const newData = { ...todayData, [metric]: value, date: dateStr };

    if (existingIndex >= 0) {
      setHealth(health.map((h, i) => i === existingIndex ? newData : h));
    } else {
      setHealth([...health, newData as HealthData]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-32 px-4 animate-fade-in shadow-none">
      <PageHeader
        title="Biologicals"
        description="Monitor physiological markers and optimize the biological vehicle for peak performance."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <StatCard label="Sleep Mean" value={`${stats.avgSleep}h`} icon={<Moon />} />
        <StatCard label="Hydration Mean" value={`${stats.avgWater}L`} icon={<Droplets />} />
        <StatCard label="Neural Tone" value="Optimal" icon={<BrainCircuit />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-12">
          <div className="p-10 rounded-3xl bg-secondary/10 border border-border/5 space-y-12">
            <div className="flex items-center justify-between border-b border-border/10 pb-8">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30">Temporal Bio-Stamp</span>
                <h3 className="text-xl font-semibold tracking-tight">{format(selectedDate, 'MMMM d, yyyy')}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30 ml-1">Regeneration (Hours)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range" min="0" max="12" step="0.5"
                    className="w-full h-1.5 bg-secondary/40 rounded-full appearance-none cursor-pointer accent-primary"
                    value={todayData.sleep}
                    onChange={(e) => updateMetric('sleep', parseFloat(e.target.value))}
                  />
                  <span className="text-lg font-semibold w-12 text-right">{todayData.sleep}h</span>
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30 ml-1">Hydration (Liters)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range" min="0" max="5" step="0.25"
                    className="w-full h-1.5 bg-secondary/40 rounded-full appearance-none cursor-pointer accent-primary"
                    value={todayData.water}
                    onChange={(e) => updateMetric('water', parseFloat(e.target.value))}
                  />
                  <span className="text-lg font-semibold w-12 text-right">{todayData.water}L</span>
                </div>
              </div>

              <div className="space-y-6 md:col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30 ml-1">Biological Protocol (Workout)</label>
                <input
                  className="w-full bg-background border border-border/10 rounded-2xl px-6 py-4 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                  placeholder="Declare activity... (e.g. Zone 2 Endurance, Hypertrophy)"
                  value={todayData.workout}
                  onChange={(e) => updateMetric('workout', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-12">
          <div className="p-10 rounded-3xl border border-border/10 space-y-8">
            <h3 className="text-lg font-semibold tracking-tight opacity-40">System Integration</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-3xl bg-secondary/10 group">
                <div className="w-10 h-10 rounded-2xl bg-background flex items-center justify-center text-muted-foreground/30 group-hover:text-primary transition-colors">
                  <Zap size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Dynamic Intensity</h4>
                  <p className="text-[10px] font-medium text-muted-foreground/40 italic">Active protocols yielding results.</p>
                </div>
              </div>
            </div>
            <Button className="w-full text-xs" variant="outline">Analyze Biological Drift</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
