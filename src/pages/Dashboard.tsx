import React, { useMemo } from 'react';
import {
  Eye, Target, Layers,
  Heart, Wallet, ArrowUpRight,
  Compass, Flame, Droplets, Moon,
  Smile, IndianRupee, TrendingUp, TrendingDown,
  ChevronRight, ChevronLeft, CheckCircle2, BrainCircuit
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useData } from '@/contexts/DataContext';
import { formatCurrency } from '@/lib/finance-utils';
import { format } from 'date-fns';
import useEmblaCarousel from 'embla-carousel-react';
import { CategoryBadge, ProgressBar } from '@/components/shared';

export default function Dashboard() {
  const { vision, goals, execution, transactions, health, reflections } = useData();

  // Finance aggregation
  const totalIncome = useMemo(() =>
    (transactions || []).filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0),
    [transactions]);
  const totalExpenses = useMemo(() =>
    (transactions || []).filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0),
    [transactions]);
  const balance = totalIncome - totalExpenses;

  // Health aggregation (today's data)
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayHealth = useMemo(() =>
    (health || []).find(h => h.date === today) || { sleep: 0, water: 0, workout: '', mood: 5 },
    [health, today]
  );

  const todayReflection = useMemo(() =>
    (reflections || []).find(r => r.date === today),
    [reflections, today]
  );

  // Carousels
  const [missionsEmblaRef] = useEmblaCarousel({ align: 'start', loop: false });
  const [executionEmblaRef] = useEmblaCarousel({ align: 'start', loop: false });

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-32 animate-fade-in px-4 pt-10">
      {/* Reduced Vision Heading */}
      <section className="border-b border-border/10 pb-10">
        <Link to="/vision" className="group block">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/30 mb-4 block">Current Directive</span>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground/90 leading-tight transition-all group-hover:text-primary">
            {vision?.oneYearVision || "Design your existence. Define your trajectory."}
          </h1>
        </Link>
      </section>

      {/* Health & Habits - Compact Bar */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">Biological State</h2>
          <Link to="/habits" className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/20 hover:text-primary">Details</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Sleep', value: `${todayHealth.sleep}h`, icon: Moon, color: 'text-blue-500' },
            { label: 'Water', value: `${todayHealth.water}L`, icon: Droplets, color: 'text-primary' },
            { label: 'Activity', value: todayHealth.workout || 'Nominal', icon: Flame, color: 'text-success' },
            { label: 'Neuro', value: `${todayHealth.mood}/10`, icon: Smile, color: 'text-warning' },
            { label: 'Journal', value: todayReflection ? 'Captured' : 'Pending', icon: BrainCircuit, color: 'text-primary' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col gap-1 p-4 bg-secondary/5 rounded-2xl border border-border/10">
              <div className="flex items-center gap-2 opacity-30">
                <item.icon className="h-3 w-3" />
                <span className="text-[8px] font-bold uppercase tracking-widest">{item.label}</span>
              </div>
              <span className="text-sm font-black tracking-tight">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Finance - Minimal Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">Resources</h2>
          <Link to="/finance" className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/20 hover:text-emerald-500">Terminal</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-secondary/5 rounded-3xl border border-border/10">
          <div className="space-y-1">
            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">Equity</span>
            <div className="text-2xl font-black tracking-tighter">{formatCurrency(balance)}</div>
          </div>
          <div className="space-y-1 md:border-l md:border-border/10 md:pl-8">
            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">Inflow</span>
            <div className="text-xl font-black text-emerald-500/80 tracking-tighter">{formatCurrency(totalIncome)}</div>
          </div>
          <div className="space-y-1 md:border-l md:border-border/10 md:pl-8">
            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">Outflow</span>
            <div className="text-xl font-black text-red-500/80 tracking-tighter">{formatCurrency(totalExpenses)}</div>
          </div>
        </div>
      </section>

      {/* Missions - Minimal Cards */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">Critical Objectives</h2>
          <Link to="/goals" className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/20 hover:text-primary">Manifest</Link>
        </div>

        <div className="embla overflow-hidden" ref={missionsEmblaRef}>
          <div className="embla__container flex gap-6">
            {(!goals || goals.filter(g => g.status !== 'Completed').length === 0) ? (
              <div className="embla__slide flex-[0_0_100%] border border-dashed border-border/20 p-12 rounded-3xl text-center opacity-30">
                <span className="text-[9px] font-bold uppercase tracking-widest">No active objectives</span>
              </div>
            ) : (
              goals.filter(g => g.status !== 'Completed').map(goal => (
                <div key={goal.id} className="embla__slide flex-[0_0_80%] md:flex-[0_0_30%]">
                  <div className="bg-background border border-border/20 p-6 rounded-3xl h-full flex flex-col justify-between hover:border-primary/40 transition-colors group">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">{goal.category}</span>
                        <span className="text-[7px] font-bold uppercase tracking-widest text-primary opacity-40">{goal.timeframe}</span>
                      </div>
                      <h3 className="text-base font-black tracking-tight mb-2 group-hover:text-primary transition-colors">{goal.title}</h3>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[8px] font-bold uppercase tracking-widest">
                      <span className="text-muted-foreground/20">Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Tasks - Subtle List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">Execution Queue</h2>
          <Link to="/execution" className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/20 hover:text-orange-500">Full Queue</Link>
        </div>

        <div className="embla overflow-hidden" ref={executionEmblaRef}>
          <div className="embla__container flex gap-6">
            {(!execution || !execution.tasks || execution.tasks.filter(e => e.status !== 'Done').length === 0) ? (
              <div className="embla__slide flex-[0_0_100%] border border-dashed border-border/20 p-12 rounded-3xl text-center opacity-30">
                <span className="text-[9px] font-bold uppercase tracking-widest">System optimized</span>
              </div>
            ) : (
              execution.tasks.filter(e => e.status !== 'Done').map(item => (
                <div key={item.id} className="embla__slide flex-[0_0_80%] md:flex-[0_0_35%]">
                  <div className="bg-secondary/5 border border-border/20 p-6 rounded-3xl h-full hover:border-orange-500/40 transition-colors group">
                    <div className="flex items-center justify-between mb-4">
                      <span className={cn(
                        "text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
                        item.priority === 'High' ? "border-red-500/30 text-red-500/60" : "border-border/30 text-muted-foreground/30"
                      )}>{item.priority}</span>
                      <span className="text-[7px] font-bold text-muted-foreground/20 uppercase tracking-widest">{item.dueDate || 'ASAP'}</span>
                    </div>
                    <h3 className="text-sm font-black tracking-tight group-hover:text-orange-500 transition-colors uppercase">{item.content}</h3>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
