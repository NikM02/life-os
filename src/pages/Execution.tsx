import React, { useState, useMemo } from 'react';
import {
    ListChecks, Plus, Search, Filter, Calendar, Clock,
    CheckCircle2, Circle, AlertCircle, MoreVertical,
    ChevronRight, Play, CheckCircle, Download, Edit2, Trash2, X, Save
} from 'lucide-react';
import { PageHeader, StatCard, Button, CategoryBadge, ProgressBar } from '@/components/shared';
import { useData } from '@/contexts/DataContext';
import { KanbanTask, KanbanPriority } from '@/types/lifeos';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { exportExecutionDataToCSV } from '@/lib/export-utils';

export default function Execution() {
    const { execution, setExecution } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPriority, setFilterPriority] = useState<string>('All');
    const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);
    const [isAddingTask, setIsAddingTask] = useState(false);

    const stats = useMemo(() => {
        const total = execution.tasks.length;
        const completed = execution.tasks.filter(t => t.status === 'Done').length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        const highPriority = execution.tasks.filter(t => t.priority === 'High' && t.status !== 'Done').length;
        return { total, completed, progress, highPriority };
    }, [execution.tasks]);

    const filteredTasks = useMemo(() => {
        return execution.tasks
            .filter(t => (filterPriority === 'All' || t.priority === filterPriority))
            .filter(t => t.content.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
                if (a.status === 'Done' && b.status !== 'Done') return 1;
                if (a.status !== 'Done' && b.status === 'Done') return -1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
    }, [execution.tasks, filterPriority, searchQuery]);

    const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newTask: KanbanTask = {
            id: Math.random().toString(36).substr(2, 9),
            content: formData.get('content') as string,
            description: formData.get('description') as string,
            status: 'Todo',
            priority: formData.get('priority') as KanbanPriority,
            dueDate: formData.get('dueDate') as string,
            velocity: Number(formData.get('velocity')) || 0,
            createdAt: new Date().toISOString(),
        };
        setExecution({ ...execution, tasks: [newTask, ...execution.tasks] });
        setIsAddingTask(false);
    };

    const handleUpdateTask = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingTask) return;
        const formData = new FormData(e.currentTarget);
        const updatedTasks = execution.tasks.map(t => t.id === editingTask.id ? {
            ...t,
            content: formData.get('content') as string,
            description: formData.get('description') as string,
            priority: formData.get('priority') as KanbanPriority,
            status: formData.get('status') as string,
            dueDate: formData.get('dueDate') as string,
            velocity: Number(formData.get('velocity')) || 0,
        } : t);
        setExecution({ ...execution, tasks: updatedTasks });
        setEditingTask(null);
    };

    const deleteTask = (id: string) => {
        if (confirm('Decommission this operational unit?')) {
            setExecution({ ...execution, tasks: execution.tasks.filter(t => t.id !== id) });
        }
    };

    const toggleStatus = (task: KanbanTask) => {
        const newStatus = task.status === 'Done' ? 'Todo' : 'Done';
        const updatedTasks = execution.tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
        setExecution({ ...execution, tasks: updatedTasks });
    };

    return (
        <div className="max-w-7xl mx-auto pb-32 px-4 animate-fade-in shadow-none">
            <PageHeader
                title="Execution"
                description="The operational registry. Execute with absolute focus and rhythmic consistency."
            >
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <Button variant="ghost" size="sm" onClick={() => exportExecutionDataToCSV(execution.tasks)} className="opacity-40 hover:opacity-100 w-full sm:w-auto">
                        <Download size={14} className="mr-2" /> Export CSV
                    </Button>
                    <div className="relative group w-full sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter registry..."
                            className="bg-secondary/20 border border-border/10 rounded-2xl pl-12 pr-6 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setIsAddingTask(true)} variant="outline" size="sm" className="h-10 px-6 rounded-2xl w-full sm:w-auto border-2 border-border/20 hover:border-primary/40 transition-all">
                        <Plus size={16} className="mr-2" /> New Task
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                <StatCard label="Total Workload" value={stats.total} icon={<ListChecks />} />
                <StatCard label="Critical Path" value={stats.highPriority} icon={<AlertCircle className="text-destructive/50" />} />
                <StatCard label="Operations Done" value={stats.completed} icon={<CheckCircle2 />} />
                <StatCard label="System Yield" value={`${stats.progress}%`} icon={<Play />} />
            </div>

            <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-border/5 pb-6">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground/80">Registry Feed</h2>
                    <div className="flex gap-4 p-1 bg-secondary/10 rounded-xl">
                        {['All', 'High', 'Medium', 'Low'].map(p => (
                            <button
                                key={p}
                                onClick={() => setFilterPriority(p)}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                                    filterPriority === p ? "bg-background shadow-sm text-primary" : "text-muted-foreground/30 hover:text-muted-foreground"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredTasks.map(task => (
                        <div key={task.id} className={cn(
                            "group flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-[32px] bg-secondary/5 border border-border/5 hover:border-primary/10 transition-all duration-500 relative overflow-hidden",
                            task.status === 'Done' && "opacity-40"
                        )}>
                            <div className="flex items-start sm:items-center gap-6 w-full sm:w-auto">
                                <button
                                    onClick={() => toggleStatus(task)}
                                    className={cn(
                                        "mt-1 sm:mt-0 w-8 h-8 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0",
                                        task.status === 'Done' ? "bg-primary border-primary text-primary-foreground" : "border-border/60 hover:border-primary/40 text-transparent"
                                    )}
                                >
                                    <CheckCircle size={16} />
                                </button>
                                <div className="space-y-1 pr-12 sm:pr-0">
                                    <h4 className={cn(
                                        "text-lg font-semibold tracking-tight transition-all",
                                        task.status === 'Done' ? "line-through text-muted-foreground/60" : "text-foreground/80"
                                    )}>
                                        {task.content}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-widest opacity-30">
                                        <span className={cn(
                                            task.priority === 'High' ? "text-destructive" :
                                                task.priority === 'Medium' ? "text-primary" : "text-muted-foreground"
                                        )}>{task.priority} Priority</span>
                                        {task.dueDate && <span className="flex items-center gap-1.5"><Calendar size={10} /> {task.dueDate}</span>}
                                        {task.velocity > 0 && <span className="flex items-center gap-1.5"><Clock size={10} /> {task.velocity}h Velocity</span>}
                                        {task.description && <span className="max-w-[200px] truncate italic border-l border-border/20 pl-4 sm:hidden">{task.description}</span>}
                                    </div>
                                    {task.description && <p className="hidden sm:block text-xs text-muted-foreground/40 italic mt-2 line-clamp-1 max-w-xl">{task.description}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4 sm:mt-0 ml-14 sm:ml-0 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => setEditingTask(task)} className="p-2.5 hover:bg-secondary/10 rounded-xl text-muted-foreground/40 hover:text-primary transition-all">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => deleteTask(task.id)} className="p-2.5 hover:bg-secondary/10 rounded-xl text-muted-foreground/40 hover:text-destructive transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Status Indicator Bar */}
                            <div className={cn(
                                "absolute left-0 top-0 bottom-0 w-1",
                                task.priority === 'High' ? "bg-destructive/20" :
                                    task.priority === 'Medium' ? "bg-primary/20" : "bg-border/20"
                            )} />
                        </div>
                    ))}
                    {filteredTasks.length === 0 && (
                        <div className="text-center py-24 border-2 border-border/5 rounded-[40px] opacity-20 italic">
                            <span className="text-sm font-bold uppercase tracking-widest">Registry optimization complete for this cluster</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {(isAddingTask || editingTask) && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                    <div className="w-full max-w-xl bg-background border border-border/10 rounded-[40px] p-10 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-semibold tracking-tight">{isAddingTask ? 'Deploy New Unit' : 'Modify Operational Unit'}</h3>
                            <button onClick={() => { setIsAddingTask(false); setEditingTask(null); }} className="p-2 hover:bg-secondary/10 rounded-full transition-all text-muted-foreground/30"><X size={24} /></button>
                        </div>
                        <form onSubmit={isAddingTask ? handleAddTask : handleUpdateTask} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-4">Content / Mission</label>
                                <input name="content" defaultValue={editingTask?.content} required className="w-full bg-secondary/10 border border-border/5 rounded-2xl px-6 py-4 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20" placeholder="What must be executed?" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-4">Priority</label>
                                    <select name="priority" defaultValue={editingTask?.priority || 'Medium'} className="w-full bg-secondary/10 border border-border/5 rounded-2xl px-6 py-4 text-xs font-semibold focus:outline-none appearance-none cursor-pointer">
                                        <option value="High">High (Critical Path)</option>
                                        <option value="Medium">Medium (Operational)</option>
                                        <option value="Low">Low (Maintenance)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-4">Status</label>
                                    <select name="status" defaultValue={editingTask?.status || 'Todo'} className="w-full bg-secondary/10 border border-border/5 rounded-2xl px-6 py-4 text-xs font-semibold focus:outline-none appearance-none cursor-pointer">
                                        <option value="Todo">Ready (Todo)</option>
                                        <option value="In Progress">Active (In Progress)</option>
                                        <option value="Done">Complete (Done)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-4">Launch Date / Deadline</label>
                                    <input type="date" name="dueDate" defaultValue={editingTask?.dueDate} className="w-full bg-secondary/10 border border-border/5 rounded-2xl px-6 py-4 text-xs font-semibold focus:outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-4">Velocity (Hours)</label>
                                    <input type="number" name="velocity" defaultValue={editingTask?.velocity} className="w-full bg-secondary/10 border border-border/5 rounded-2xl px-6 py-4 text-xs font-semibold focus:outline-none" placeholder="0" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-4">Operational Details</label>
                                <textarea name="description" defaultValue={editingTask?.description} className="w-full bg-secondary/10 border border-border/5 rounded-3xl p-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 min-h-[120px]" placeholder="Optional description of the mission..." />
                            </div>

                            <Button type="submit" className="w-full rounded-2xl py-6 h-auto text-sm font-bold group">
                                <Save className="mr-2 group-hover:scale-110 transition-transform" size={18} /> {isAddingTask ? 'Initiate Deployment' : 'Sync Registry'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
