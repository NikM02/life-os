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
    <div className="max-w-7xl mx-auto space-y-12 pb-32 animate-fade-in px-4">
      {/* Vision Card */}
      <section className="relative overflow-hidden group">
        <Link to="/vision" className="block">
          <div className="glass-card p-10 rounded-[3rem] border-primary/10 bg-primary/[0.01] hover:bg-primary/[0.03] transition-all duration-500 relative overflow-hidden group/card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Core Vision</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground leading-tight">
                  {vision?.oneYearVision || "Design your existence. Define your trajectory."}
                </h1>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Health & Habits */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Health & Habits</h2>
          </div>
          <Link to="/habits" className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/30 hover:text-primary transition-colors">Adjust</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="glass-card p-6 rounded-3xl flex items-center gap-4 hover:border-blue-500/20 transition-all">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500"><Moon className="h-5 w-5" /></div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Sleep</div>
              <div className="text-xl font-black">{todayHealth.sleep}h</div>
            </div>
          </div>
          <div className="glass-card p-6 rounded-3xl flex items-center gap-4 hover:border-primary/20 transition-all">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary"><Droplets className="h-5 w-5" /></div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Hydration</div>
              <div className="text-xl font-black">{todayHealth.water}L</div>
            </div>
          </div>
          <div className="glass-card p-6 rounded-3xl flex items-center gap-4 hover:border-success/20 transition-all">
            <div className="p-3 rounded-2xl bg-success/10 text-success"><Flame className="h-5 w-5" /></div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Status</div>
              <div className="text-xs font-bold truncate max-w-[80px]">{todayHealth.workout || "Inactive"}</div>
            </div>
          </div>
          <div className="glass-card p-6 rounded-3xl flex items-center gap-4 hover:border-warning/20 transition-all">
            <div className="p-3 rounded-2xl bg-warning/10 text-warning"><Smile className="h-5 w-5" /></div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Neuro</div>
              <div className="text-xl font-black">{todayHealth.mood}/10</div>
            </div>
          </div>
          <div className="glass-card p-6 rounded-3xl flex items-center gap-4 hover:border-primary/20 transition-all border-primary/10 bg-primary/[0.02]">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 flex items-center gap-1.5">Journal {todayReflection && <CheckCircle2 className="h-2.5 w-2.5 text-primary" />}</div>
              <div className="text-xs font-bold">{todayReflection ? "Captured" : "Pending"}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Finance */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Resource Management</h2>
          </div>
          <Link to="/finance" className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/30 hover:text-emerald-500 transition-colors">Finance Terminal</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-8 rounded-[2rem] relative overflow-hidden group hover:border-emerald-500/10 transition-all duration-500">
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-2">Available Balance</div>
            <div className="text-3xl font-black tracking-tighter text-foreground mb-4">{formatCurrency(balance)}</div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500/70 bg-emerald-500/5 w-fit px-3 py-1 rounded-full border border-emerald-500/5">
              <ArrowUpRight className="h-3 w-3" /> Optimal
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2rem] flex flex-col justify-center gap-5 group hover:border-blue-500/10 transition-all duration-500">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">Inflow</div>
                <div className="text-xl font-black text-emerald-500 tracking-tighter flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4" /> {formatCurrency(totalIncome)}
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">Outflow</div>
                <div className="text-xl font-black text-red-500 tracking-tighter flex items-center gap-1.5 uppercase">
                  {formatCurrency(totalExpenses)} <TrendingDown className="h-4 w-4" />
                </div>
              </div>
            </div>
            <ProgressBar value={totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0} className="h-2 bg-secondary/20" />
            <div className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest text-center">Ratio: {totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0}%</div>
          </div>

          <div className="glass-card p-6 rounded-[2rem] flex flex-col justify-center items-center text-center hover:border-primary/10 transition-all duration-500">
            <div className="p-4 rounded-2xl bg-secondary/10 mb-3 grayscale opacity-30">
              <Layers className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">System Status</h3>
            <p className="text-[8px] font-medium text-muted-foreground/30 uppercase tracking-widest">Nominal</p>
          </div>
        </div>
      </section>

      {/* Active Missions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Active Missions</h2>
          </div>
          <Link to="/goals" className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/30 hover:text-primary transition-colors">Manifest</Link>
        </div>

        <div className="embla overflow-hidden" ref={missionsEmblaRef}>
          <div className="embla__container flex gap-6">
            {(!goals || goals.filter(g => g.status !== 'Completed').length === 0) ? (
              <div className="embla__slide flex-[0_0_100%]">
                <div className="glass-card p-16 rounded-[3rem] text-center border-dashed border-white/5 opacity-40">
                  <Target className="h-12 w-12 mx-auto mb-6 text-muted-foreground/20" />
                  <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">No active high-impact missions</p>
                </div>
              </div>
            ) : (
              goals.filter(g => g.status !== 'Completed').map(goal => (
                <div key={goal.id} className="embla__slide flex-[0_0_85%] md:flex-[0_0_30%]">
                  <div className="glass-card p-10 rounded-[2.5rem] h-full flex flex-col justify-between hover:border-primary/30 transition-all duration-700 shadow-xl group">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <CategoryBadge category={goal.category} />
                        <span className="text-[8px] font-black uppercase tracking-widest text-primary/40 px-2 py-1 bg-primary/5 rounded-lg border border-primary/10">{goal.timeframe}</span>
                      </div>
                      <h3 className="text-xl font-black tracking-tight mb-3 group-hover:text-primary transition-colors leading-tight">{goal.title}</h3>
                      <p className="text-xs font-medium text-muted-foreground/60 leading-relaxed italic line-clamp-2">{goal.description}</p>
                    </div>

                    <div className="mt-8 space-y-4">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/20">
                        <span>Progress</span>
                        <span className="text-primary">{goal.progress}%</span>
                      </div>
                      <ProgressBar value={goal.progress} className="h-2 bg-secondary/30" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Execution Tracker */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Daily Tasks</h2>
          </div>
          <Link to="/execution" className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/30 hover:text-orange-500 transition-colors">Queue</Link>
        </div>

        <div className="embla overflow-hidden" ref={executionEmblaRef}>
          <div className="embla__container flex gap-6">
            {(!execution || !execution.tasks || execution.tasks.filter(e => e.status !== 'Done').length === 0) ? (
              <div className="embla__slide flex-[0_0_100%]">
                <div className="glass-card p-16 rounded-[3rem] text-center border-dashed border-white/5 opacity-40">
                  <Layers className="h-12 w-12 mx-auto mb-6 text-muted-foreground/20" />
                  <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">Task queue empty. System optimized.</p>
                </div>
              </div>
            ) : (
              execution.tasks.filter(e => e.status !== 'Done').map(item => (
                <div key={item.id} className="embla__slide flex-[0_0_85%] md:flex-[0_0_40%]">
                  <div className="glass-card p-10 rounded-[2.5rem] h-full flex flex-col justify-between hover:border-orange-500/30 transition-all duration-700 shadow-xl group border-l-4 border-l-transparent hover:border-l-orange-500">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
                        <Target className="h-4 w-4" />
                      </div>
                      <div className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border",
                        item.priority === 'High' ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-white/5 border-white/5 text-muted-foreground/40"
                      )}>
                        {item.priority}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black tracking-tight group-hover:text-orange-500 transition-colors">{item.content}</h3>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                        <span>{item.dueDate || 'No Deadline'}</span>
                      </div>
                    </div>
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
