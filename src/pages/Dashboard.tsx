import React, { useMemo } from 'react';
import {
  Moon, Droplets, Flame, Smile, BrainCircuit, TrendingUp, TrendingDown, IndianRupee, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useData } from '@/contexts/DataContext';
import { formatCurrency } from '@/lib/finance-utils';
import { format } from 'date-fns';
import useEmblaCarousel from 'embla-carousel-react';
import { CategoryBadge } from '@/components/shared';

export default function Dashboard() {
  const { vision, goals, execution, transactions, health, reflections } = useData();

  const totalIncome = useMemo(() =>
    (transactions || []).filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0),
    [transactions]);
  const totalExpenses = useMemo(() =>
    (transactions || []).filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0),
    [transactions]);
  const balance = totalIncome - totalExpenses;

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayHealth = useMemo(() =>
    (health || []).find(h => h.date === today) || { sleep: 0, water: 0, workout: '', mood: 5 },
    [health, today]
  );

  const todayReflection = useMemo(() =>
    (reflections || []).find(r => r.date === today),
    [reflections, today]
  );

  const [missionsEmblaRef] = useEmblaCarousel({ align: 'start', loop: false });
  const [executionEmblaRef] = useEmblaCarousel({ align: 'start', loop: false });

  return (
    <div className="max-w-6xl mx-auto space-y-24 pb-32 animate-fade-in px-4 pt-16 shadow-none">
      <section className="border-b border-border/5 pb-16">
        <Link to="/vision" className="group block space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/20 italic block">CORE DIRECTIVE</span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground italic leading-tight transition-all group-hover:opacity-40">
            {vision?.oneYearVision || "ESTABLISH TRAJECTORY. DEFINE PARAMETERS."}
          </h1>
        </Link>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between opacity-30">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] italic">Biologicals</h2>
          <Link to="/habits" className="text-[8px] font-black uppercase tracking-widest hover:text-foreground">Uplink</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {[
            { label: 'Sleep', value: `${todayHealth.sleep}H`, icon: Moon },
            { label: 'Water', value: `${todayHealth.water}L`, icon: Droplets },
            { label: 'Activity', value: todayHealth.workout || 'Standby', icon: Flame },
            { label: 'Neuro', value: `${todayHealth.mood}/10`, icon: Smile },
            { label: 'Sync', value: todayReflection ? 'Active' : 'Void', icon: BrainCircuit }
          ].map((item, i) => (
            <div key={i} className="flex flex-col gap-2 p-6 border border-border/10 rounded-2xl group hover:bg-secondary/5 transition-all">
              <div className="flex items-center gap-3 opacity-20">
                <item.icon size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
              </div>
              <span className="text-sm font-black italic uppercase tracking-tight">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between opacity-30">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] italic">Capitals</h2>
          <Link to="/finance" className="text-[8px] font-black uppercase tracking-widest hover:text-foreground">Terminal</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 p-10 border border-border/10 rounded-3xl bg-secondary/5">
          <div className="space-y-2">
            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30 italic">Equity</span>
            <div className="text-3xl font-black italic tracking-tighter">{formatCurrency(balance)}</div>
          </div>
          <div className="space-y-2 opacity-60">
            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30 italic">Inflow</span>
            <div className="text-xl font-black italic tracking-tighter text-success">{formatCurrency(totalIncome)}</div>
          </div>
          <div className="space-y-2 opacity-60">
            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30 italic">Outflow</span>
            <div className="text-xl font-black italic tracking-tighter text-destructive">{formatCurrency(totalExpenses)}</div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between opacity-30">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] italic">Objectives</h2>
          <Link to="/goals" className="text-[8px] font-black uppercase tracking-widest hover:text-foreground">Manifest</Link>
        </div>
        <div className="embla overflow-hidden" ref={missionsEmblaRef}>
          <div className="embla__container flex gap-8">
            {(!goals || goals.filter(g => g.status !== 'Completed').length === 0) ? (
              <div className="embla__slide flex-[0_0_100%] border border-dashed border-border/10 p-16 rounded-3xl text-center opacity-20 italic">
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">No active objectives</span>
              </div>
            ) : (
              goals.filter(g => g.status !== 'Completed').map(goal => (
                <div key={goal.id} className="embla__slide flex-[0_0_80%] md:flex-[0_0_30%]">
                  <div className="border border-border/10 p-8 rounded-3xl h-full flex flex-col justify-between hover:bg-secondary/5 transition-all group">
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <CategoryBadge category={goal.category} className="opacity-40" />
                        <span className="text-[7px] font-black uppercase tracking-widest opacity-20">{goal.timeframe}</span>
                      </div>
                      <h3 className="text-base font-black italic uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{goal.title}</h3>
                    </div>
                    <div className="mt-8 pt-6 border-t border-border/5 flex items-center justify-between text-[8px] font-black uppercase tracking-widest">
                      <span className="opacity-20 italic">Yield</span>
                      <span className="text-primary italic">{goal.progress}%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between opacity-30">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] italic">Execution</h2>
          <Link to="/execution" className="text-[8px] font-black uppercase tracking-widest hover:text-foreground">Registry</Link>
        </div>
        <div className="embla overflow-hidden" ref={executionEmblaRef}>
          <div className="embla__container flex gap-8">
            {(!execution || !execution.tasks || execution.tasks.filter(e => e.status !== 'Done').length === 0) ? (
              <div className="embla__slide flex-[0_0_100%] border border-dashed border-border/10 p-16 rounded-3xl text-center opacity-20 italic">
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Runtime optimal</span>
              </div>
            ) : (
              execution.tasks.filter(e => e.status !== 'Done').map(item => (
                <div key={item.id} className="embla__slide flex-[0_0_80%] md:flex-[0_0_35%]">
                  <div className="border border-border/10 p-8 rounded-3xl h-full hover:bg-secondary/5 transition-all group">
                    <div className="flex items-center justify-between mb-6">
                      <span className={cn(
                        "text-[7px] font-black uppercase tracking-widest opacity-30",
                        item.priority === 'High' && "text-destructive opacity-100"
                      )}>{item.priority}</span>
                      <span className="text-[7px] font-black uppercase tracking-widest opacity-20 italic">{item.dueDate || 'ASAP'}</span>
                    </div>
                    <h3 className="text-sm font-black italic uppercase italic tracking-tight group-hover:opacity-40 transition-all">{item.content}</h3>
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
