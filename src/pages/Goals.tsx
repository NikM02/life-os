import React, { useState, useMemo } from 'react';
import {
  Target, Plus, Filter, Target as TargetIcon, Search,
  TrendingUp, CheckCircle2, Clock, Star, Layers, ChevronRight
} from 'lucide-react';
import { PageHeader, StatCard, ProgressBar, CategoryBadge, Button } from '@/components/shared';
import { useData } from '@/contexts/DataContext';
import { Goal, GoalCategory, GoalTimeframe, GoalStatus } from '@/types/lifeos';
import { cn } from '@/lib/utils';
import { exportGoalsDataToCSV } from '@/lib/export-utils';
import { Download } from 'lucide-react';

const categories: GoalCategory[] = ['Wealth', 'Health', 'Skills', 'Relationships', 'Spiritual', 'Lifestyle', 'Books', 'Finance', 'Networking'];
const timeframes: GoalTimeframe[] = ['1-Year', '5-Year', 'Life'];

export default function Goals() {
  const { goals, setGoals } = useData();
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter(g => g.status === 'Completed').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    const active = goals.filter(g => g.status === 'In Progress').length;
    return { total, completed, progress, active };
  }, [goals]);

  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
      const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'All' || goal.category === filter || goal.timeframe === filter;
      return matchesSearch && matchesFilter;
    });
  }, [goals, filter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto pb-32 px-4 animate-fade-in shadow-none">
      <PageHeader
        title="Objectives"
        description="Establish strategic intent and architect your long-horizon trajectory."
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => exportGoalsDataToCSV(goals)} className="opacity-40 hover:opacity-100">
            <Download size={14} className="mr-2" /> Export
          </Button>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search intentions..."
              className="bg-secondary/20 border border-border/10 rounded-2xl pl-12 pr-6 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="h-10 px-6 rounded-2xl">
            <Plus size={16} className="mr-2" /> New Objective
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        <StatCard label="Total Objectives" value={stats.total} icon={<Layers />} />
        <StatCard label="Active Manifests" value={stats.active} icon={<TrendingUp />} />
        <StatCard label="Realized" value={stats.completed} icon={<CheckCircle2 />} />
        <StatCard label="Yield" value={`${stats.progress}%`} icon={<Star />} />
      </div>

      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-secondary/20 rounded-2xl mb-12 w-fit">
        {['All', ...timeframes, ...categories.slice(0, 4)].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "px-6 py-2 rounded-xl text-[11px] font-semibold transition-all",
              filter === cat ? "bg-background shadow-sm text-primary" : "text-muted-foreground/40 hover:text-muted-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredGoals.map(goal => (
          <div key={goal.id} className="group p-8 rounded-3xl bg-background border border-border/10 hover:border-primary/20 transition-all duration-500 flex flex-col h-full">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <CategoryBadge category={goal.category} className="opacity-40" />
                <h3 className="text-xl font-semibold tracking-tight leading-tight group-hover:text-primary transition-colors">{goal.title}</h3>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/20 italic">{goal.timeframe}</span>
            </div>

            <div className="flex-1">
              <p className="text-sm text-muted-foreground/50 leading-relaxed italic line-clamp-2">
                {goal.status} status • Targeting long-term realization.
              </p>
            </div>

            <div className="mt-10 space-y-4">
              <div className="flex justify-between items-end text-[10px] font-semibold uppercase tracking-widest">
                <span className="text-muted-foreground/20 italic">Progression</span>
                <span className="text-primary">{goal.progress}%</span>
              </div>
              <ProgressBar value={goal.progress} className="h-1 opacity-40 group-hover:opacity-100 group-hover:bg-primary/5 transition-all" />
            </div>
          </div>
        ))}
        {filteredGoals.length === 0 && (
          <div className="col-span-full py-20 text-center border border-dashed border-border/10 rounded-3xl opacity-20">
            <span className="text-xs font-medium uppercase tracking-widest italic">No objectives manifested in this horizon</span>
          </div>
        )}
      </div>
    </div>
  );
}
