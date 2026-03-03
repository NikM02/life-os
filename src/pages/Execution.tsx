import React, { useState, useMemo } from 'react';
import {
    ListChecks, Plus, Search, Filter, Calendar, Clock,
    CheckCircle2, Circle, AlertCircle, MoreVertical,
    ChevronRight, Play, CheckCircle, Download
} from 'lucide-react';
import { PageHeader, StatCard, Button, CategoryBadge, ProgressBar } from '@/components/shared';
import { useData } from '@/contexts/DataContext';
import { Task, ExecutionData } from '@/types/lifeos';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { exportExecutionDataToCSV } from '@/lib/export-utils';

export default function Execution() {
    const { execution, setExecution } = useData();
    const [activeTab, setActiveTab] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
    const [searchQuery, setSearchQuery] = useState('');

    const stats = useMemo(() => {
        const total = execution.tasks.length;
        const completed = execution.tasks.filter(t => t.status === 'Done').length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        const highPriority = execution.tasks.filter(t => t.priority === 'High' && t.status !== 'Done').length;
        return { total, completed, progress, highPriority };
    }, [execution.tasks]);

    const filteredTasks = useMemo(() => {
        return execution.tasks
            .filter(t => (activeTab === 'All' || t.priority === activeTab))
            .filter(t => t.content.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
                if (a.status === 'Done' && b.status !== 'Done') return 1;
                if (a.status !== 'Done' && b.status === 'Done') return -1;
                return 0;
            });
    }, [execution.tasks, activeTab, searchQuery]);

    const toggleTask = (id: string) => {
        const updatedTasks = execution.tasks.map(t =>
            t.id === id ? { ...t, status: t.status === 'Done' ? 'Todo' : 'Done' as any } : t
        );
        setExecution({ ...execution, tasks: updatedTasks });
    };

    return (
        <div className="max-w-7xl mx-auto pb-32 px-4 animate-fade-in shadow-none">
            <PageHeader
                title="Execution"
                description="The operational registry. Execute with absolute focus and rhythmic consistency."
            >
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => exportExecutionDataToCSV(execution)} className="opacity-40 hover:opacity-100">
                        <Download size={14} className="mr-2" /> Export
                    </Button>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter operations..."
                            className="bg-secondary/20 border border-border/10 rounded-2xl pl-12 pr-6 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm" className="h-10 px-6 rounded-2xl">
                        <Plus size={16} className="mr-2" /> New Task
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
                <StatCard label="Total Workload" value={stats.total} icon={<ListChecks />} />
                <StatCard label="Critical Path" value={stats.highPriority} icon={<AlertCircle className="text-destructive" />} />
                <StatCard label="Operations Done" value={stats.completed} icon={<CheckCircle2 />} />
                <StatCard label="System Yield" value={`${stats.progress}%`} icon={<Play />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-10">
                    <div className="flex items-center justify-between opacity-60">
                        <h2 className="text-xl font-semibold tracking-tight">Daily Registry</h2>
                        <div className="flex gap-4">
                            {['All', 'High', 'Medium', 'Low'].map(priority => (
                                <button
                                    key={priority}
                                    onClick={() => setActiveTab(priority as any)}
                                    className={cn(
                                        "text-[11px] font-semibold uppercase tracking-widest transition-all",
                                        activeTab === priority ? "text-primary border-b border-primary pb-1" : "text-muted-foreground/40 hover:text-muted-foreground"
                                    )}
                                >
                                    {priority}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredTasks.map(task => (
                            <div key={task.id} className={cn(
                                "group flex items-center justify-between p-6 rounded-3xl bg-secondary/10 border border-border/5 hover:border-primary/20 transition-all duration-300",
                                task.status === 'Done' && "opacity-40 grayscale"
                            )}>
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={() => toggleTask(task.id)}
                                        className={cn(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                            task.status === 'Done' ? "bg-primary border-primary text-primary-foreground" : "border-border/60 hover:border-primary/40"
                                        )}
                                    >
                                        {task.status === 'Done' && <CheckCircle size={14} />}
                                    </button>
                                    <div className="space-y-1">
                                        <h4 className={cn(
                                            "text-sm font-semibold tracking-tight transition-all",
                                            task.status === 'Done' ? "line-through text-muted-foreground/60" : "text-foreground/80 group-hover:text-primary"
                                        )}>
                                            {task.content}
                                        </h4>
                                        <div className="flex items-center gap-3 opacity-30 text-[10px] font-semibold uppercase tracking-widest">
                                            <span className={cn(
                                                task.priority === 'High' ? "text-destructive" : ""
                                            )}>{task.priority} Priority</span>
                                            {task.dueDate && <span>• {task.dueDate}</span>}
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2 rounded-xl opacity-0 group-hover:opacity-100 text-muted-foreground/30 hover:text-primary transition-all">
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                        ))}
                        {filteredTasks.length === 0 && (
                            <div className="text-center py-20 border border-dashed border-border/10 rounded-3xl opacity-20 italic">
                                <span className="text-xs font-semibold uppercase tracking-widest">Optimize the next cycle</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-12 pt-10">
                    <div className="p-10 rounded-3xl bg-background border border-border/10 shadow-sm space-y-8">
                        <h3 className="text-lg font-semibold tracking-tight opacity-40">Efficiency</h3>
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end text-[10px] font-semibold uppercase tracking-widest opacity-60">
                                    <span>Performance</span>
                                    <span>{stats.progress}%</span>
                                </div>
                                <ProgressBar value={stats.progress} className="h-1.5 opacity-60" />
                            </div>
                            <p className="text-sm text-muted-foreground/40 leading-relaxed italic">
                                "Consistency is the signature of mastery. Execute the mundane until it becomes sublime."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
