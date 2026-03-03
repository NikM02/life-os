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
import { CategoryBadge, StatCard } from '@/components/shared';

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
    <div className="max-w-6xl mx-auto space-y-20 pb-32 animate-fade-in px-4 pt-16 shadow-none">
      <section className="space-y-6">
        <Link to="/vision" className="group block space-y-4">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/30 block">Current Directive</span>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground/90 leading-tight transition-all">
            {vision?.oneYearVision || "Design your existence. Define your trajectory."}
          </h1>
        </Link>
      </section>

      <section className="space-y-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-foreground/80">Biological State</h2>
          <Link to="/habits" className="text-xs font-semibold text-muted-foreground/40 hover:text-primary transition-colors">Details</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {[
            { label: 'Sleep', value: `${todayHealth.sleep}h`, icon: Moon },
            { label: 'Water', value: `${todayHealth.water}L`, icon: Droplets },
            { label: 'Activity', value: todayHealth.workout || 'Nominal', icon: Flame },
            { label: 'Neuro', value: `${todayHealth.mood}/10`, icon: Smile },
            { label: 'Journal', value: todayReflection ? 'Captured' : 'Pending', icon: BrainCircuit }
          ].map((item, i) => (
            <div key={i} className="flex flex-col gap-3 p-6 bg-secondary/20 rounded-3xl border border-border/5 group hover:border-primary/20 transition-all duration-500">
              <div className="flex items-center gap-3 opacity-20 group-hover:opacity-40 transition-opacity">
                <item.icon size={14} />
                <span className="text-[10px] font-semibold uppercase tracking-wider">{item.label}</span>
              </div>
              <span className="text-lg font-semibold tracking-tight text-foreground/90">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <section className="space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-foreground/80">Capital Assets</h2>
            <Link to="/finance" className="text-xs font-semibold text-muted-foreground/40 hover:text-primary transition-colors">Terminal</Link>
          </div>
          <div className="p-10 rounded-3xl bg-secondary/20 border border-border/5 space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/30">Available Equity</span>
              <div className="text-4xl font-semibold tracking-tight">{formatCurrency(balance)}</div>
            </div>
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-border/5">
              <div className="space-y-1">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/30">Inflow</span>
                <div className="text-xl font-semibold text-success/80">{formatCurrency(totalIncome)}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/30">Outflow</span>
                <div className="text-xl font-semibold text-destructive/80">{formatCurrency(totalExpenses)}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-foreground/80">Active Objectives</h2>
            <Link to="/goals" className="text-xs font-semibold text-muted-foreground/40 hover:text-primary transition-colors">Manifest</Link>
          </div>
          <div className="embla overflow-hidden" ref={missionsEmblaRef}>
            <div className="embla__container flex gap-6">
              {(!goals || goals.filter(g => g.status !== 'Completed').length === 0) ? (
                <div className="embla__slide flex-[0_0_100%] border border-dashed border-border/10 p-12 rounded-3xl text-center opacity-20">
                  <span className="text-xs font-medium italic">No active objectives</span>
                </div>
              ) : (
                goals.filter(g => g.status !== 'Completed').map(goal => (
                  <div key={goal.id} className="embla__slide flex-[0_0_90%]">
                    <div className="bg-background border border-border/10 p-8 rounded-3xl h-full flex flex-col justify-between hover:border-primary/20 transition-all group">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <CategoryBadge category={goal.category} className="opacity-40" />
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/20">{goal.timeframe}</span>
                        </div>
                        <h3 className="text-lg font-semibold tracking-tight leading-tight group-hover:text-primary transition-colors">{goal.title}</h3>
                      </div>
                      <div className="mt-8 pt-6 border-t border-border/5 flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/20">Progress</span>
                        <span className="text-xs font-bold text-primary">{goal.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="space-y-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-foreground/80">Execution Registry</h2>
          <Link to="/execution" className="text-xs font-semibold text-muted-foreground/40 hover:text-primary transition-colors">Registry</Link>
        </div>
        <div className="embla overflow-hidden" ref={executionEmblaRef}>
          <div className="embla__container flex gap-6">
            {(!execution || !execution.tasks || execution.tasks.filter(e => e.status !== 'Done').length === 0) ? (
              <div className="embla__slide flex-[0_0_100%] border border-dashed border-border/10 p-12 rounded-3xl text-center opacity-20">
                <span className="text-xs font-medium italic">System optimized</span>
              </div>
            ) : (
              execution.tasks.filter(e => e.status !== 'Done').map(item => (
                <div key={item.id} className="embla__slide flex-[0_0_80%] md:flex-[0_0_30%]">
                  <div className="bg-secondary/10 border border-border/10 p-8 rounded-3xl h-full hover:border-primary/40 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <span className={cn(
                        "text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-lg border",
                        item.priority === 'High' ? "border-destructive/30 text-destructive/60" : "border-border/30 text-muted-foreground/30"
                      )}>{item.priority} Priority</span>
                      <span className="text-[9px] font-medium text-muted-foreground/20 italic">{item.dueDate || 'ASAP'}</span>
                    </div>
                    <h3 className="text-sm font-semibold tracking-normal text-foreground/80 group-hover:text-primary transition-colors">{item.content}</h3>
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
