import React, { useState, useMemo } from 'react';
import {
    Layers, Plus, Filter, MoreVertical, Calendar,
    BarChart3, CheckCircle2, Clock, PlayCircle, TrendingUp, Trash2, Edit2, Timer
} from 'lucide-react';
import { PageHeader, StatCard, ProgressBar, Button } from '@/components/shared';
import { useData } from '@/contexts/DataContext';
import { KanbanTask, KanbanColumn, ExecutionData } from '@/types/lifeos';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { exportExecutionDataToCSV } from '@/lib/export-utils';
import { Download } from 'lucide-react';

const INITIAL_COLUMNS: KanbanColumn[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
];

export default function Execution() {
    const { execution, setExecution } = useData();
    const data = execution;
    const setData = setExecution;

    const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);

    const stats = useMemo(() => {
        const total = data.tasks.length;
        const done = data.tasks.filter(t => t.status === 'done').length;
        const inProgress = data.tasks.filter(t => t.status === 'in-progress').length;
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;

        return { total, done, inProgress, progress };
    }, [data.tasks]);

    const handleUpdateTask = (updatedTask: KanbanTask) => {
        const exists = data.tasks.find(t => t.id === updatedTask.id);
        if (exists) {
            setData({
                ...data,
                tasks: data.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
            });
        } else {
            setData({
                ...data,
                tasks: [...data.tasks, updatedTask]
            });
        }
        setEditingTask(null);
    };

    return (
        <div className="animate-fade-in max-w-7xl mx-auto pb-10 px-4 md:px-0">
            <PageHeader
                title="Daily Execution"
                description="Ship your dreams. Turn goals into reality through consistent action."
            >
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportExecutionDataToCSV(data.tasks)}
                        className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-xl px-4 h-10 transition-all text-[9px] font-extrabold uppercase tracking-widest text-primary"
                    >
                        <Download className="h-4 w-4" />
                        Export Tasks
                    </Button>
                    <Button
                        onClick={() => setEditingTask({
                            id: Math.random().toString(36).substr(2, 9),
                            content: '',
                            status: 'todo',
                            priority: 'Medium',
                            velocity: 0,
                            createdAt: new Date().toISOString(),
                            linkedIds: []
                        })}
                        variant="primary"
                    >
                        <Plus className="h-4 w-4" /> New Task
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard label="Total Tasks" value={stats.total} icon={<Layers className="h-4 w-4" />} />
                <StatCard label="Active" value={stats.inProgress} icon={<PlayCircle className="h-4 w-4" />} />
                <StatCard label="Completed" value={stats.done} icon={<CheckCircle2 className="h-4 w-4" />} />
                <StatCard label="Progress" value={`${stats.progress}%`} icon={<BarChart3 className="h-4 w-4" />} />
            </div>

            <div className="grid grid-cols-1 gap-12">
                <KanbanBoard
                    data={data}
                    setData={setData}
                    onEditTask={setEditingTask}
                />

                <ExecutionAnalytics tasks={data.tasks} />
            </div>

            {editingTask && (
                <TaskModal
                    task={editingTask}
                    onSave={handleUpdateTask}
                    onClose={() => setEditingTask(null)}
                />
            )}
        </div>
    );
}

function KanbanBoard({ data, setData, onEditTask }: {
    data: ExecutionData;
    setData: (data: ExecutionData) => void;
    onEditTask: (task: KanbanTask) => void;
}) {
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    const onDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.setData('taskId', taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDrop = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId') || draggedTaskId;
        if (!taskId) return;

        const newTasks = data.tasks.map(task =>
            task.id === taskId ? { ...task, status: columnId } : task
        );

        setData({ ...data, tasks: newTasks });
        setDraggedTaskId(null);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const deleteTask = (taskId: string) => {
        setData({ ...data, tasks: data.tasks.filter(t => t.id !== taskId) });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.columns.map(column => (
                <div
                    key={column.id}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, column.id)}
                    className="flex flex-col gap-6"
                >
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-2.5 h-2.5 rounded-full",
                                column.id === 'todo' ? "bg-muted-foreground/30" :
                                    column.id === 'in-progress' ? "bg-primary shadow-glow shadow-primary/50" :
                                        "bg-success shadow-glow shadow-success/50"
                            )} />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">{column.title}</h3>
                            <span className="px-2 py-0.5 rounded-lg bg-secondary/50 text-[10px] font-bold text-muted-foreground/40">
                                {data.tasks.filter(t => t.status === column.id).length}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-4 min-h-[400px]">
                        {data.tasks
                            .filter(task => task.status === column.id)
                            .map(task => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, task.id)}
                                    className={cn(
                                        "glass-card p-5 cursor-grab active:cursor-grabbing hover:border-primary/40 transition-all group relative",
                                        draggedTaskId === task.id && "opacity-40 grayscale-[0.5]"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={cn(
                                            "px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border",
                                            task.priority === 'High' ? "bg-destructive/10 text-destructive border-destructive/20" :
                                                task.priority === 'Medium' ? "bg-warning/10 text-warning border-warning/20" :
                                                    "bg-success/10 text-success border-success/20"
                                        )}>
                                            {task.priority}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => onEditTask(task)}
                                                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground/40 hover:text-foreground transition-all"
                                            >
                                                <Edit2 className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={() => deleteTask(task.id)}
                                                className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive transition-all"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="text-sm font-bold text-foreground/90 leading-relaxed mb-4">{task.content}</h4>
                                    <div className="flex items-center justify-between pt-4 border-t border-border/5">
                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-bold uppercase tracking-tighter">
                                            <Calendar className="h-3 w-3 opacity-40" />
                                            {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : '-'}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-primary font-bold uppercase tracking-tighter">
                                            <Timer className="h-3 w-3 opacity-40" />
                                            {task.velocity || 0} hrs
                                        </div>
                                    </div>
                                </div>
                            ))}

                        {data.tasks.filter(task => task.status === column.id).length === 0 && (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/5 rounded-2xl opacity-10">
                                <Layers className="h-12 w-12 mb-4" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-center">Empty Zone</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function TaskModal({ task, onSave, onClose }: {
    task: KanbanTask;
    onSave: (task: KanbanTask) => void;
    onClose: () => void;
}) {
    const [content, setContent] = useState(task.content);
    const [priority, setPriority] = useState(task.priority);
    const [status, setStatus] = useState(task.status);
    const [velocity, setVelocity] = useState(task.velocity || 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-card-vibrant w-full max-w-md p-8 shadow-2xl animate-scale-in">
                <h3 className="text-lg font-black tracking-tight mb-6">
                    {task.content ? 'Edit Task' : 'New Task'}
                </h3>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Task Description</label>
                        <input
                            autoFocus
                            className="w-full bg-secondary/50 border border-border/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What needs to be done?"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Priority</label>
                            <select
                                className="w-full bg-secondary/50 border border-border/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none appearance-none"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as any)}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Status</label>
                            <select
                                className="w-full bg-secondary/50 border border-border/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none appearance-none"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="todo">To Do</option>
                                <option value="in-progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Velocity (hrs)</label>
                        <input
                            type="number"
                            className="w-full bg-secondary/50 border border-border/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            value={velocity}
                            onChange={(e) => setVelocity(parseFloat(e.target.value) || 0)}
                            placeholder="Hours allocated"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-1"
                            onClick={() => onSave({ ...task, content, priority, status, velocity })}
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ExecutionAnalytics({ tasks }: { tasks: KanbanTask[] }) {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'done').length;
    const highPriority = tasks.filter(t => t.priority === 'High').length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    const totalVelocity = tasks.reduce((acc, t) => acc + (t.velocity || 0), 0);

    return (
        <div className="glass-card p-8 animate-slide-up">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-sm font-black tracking-tight">Execution Analytics</h2>
                    <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-1">Real-time Performance Metrics</p>
                </div>
                <div className="p-4 rounded-xl bg-primary/5 text-primary shadow-glow shadow-primary/10">
                    <BarChart3 className="h-6 w-6" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-8">
                    <div>
                        <div className="flex justify-between items-end mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Overall Efficiency</span>
                            <span className="text-xl font-black">{completionRate}%</span>
                        </div>
                        <ProgressBar value={completionRate} className="h-2" />
                    </div>

                    <div className="p-5 rounded-2xl bg-secondary/20 border border-border/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-destructive rounded-full" />
                            <div>
                                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">Critical Paths</div>
                                <div className="text-sm font-bold">High Priority Focus</div>
                            </div>
                        </div>
                        <div className="text-xl font-bold">{highPriority}</div>
                    </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 gap-6">
                    <AnalyticsMiniCard label="Total Velocity" value={totalVelocity.toString()} sub="Total Actual Hours" trend="+2.4" />
                </div>
            </div>
        </div>
    );
}

function AnalyticsMiniCard({ label, value, sub, trend }: { label: string; value: string; sub?: string; trend: string }) {
    const isPositive = trend.startsWith('+');
    return (
        <div className="p-5 rounded-2xl bg-secondary/10 border border-border/5 hover:border-primary/20 transition-all group">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30 mb-3 group-hover:text-primary transition-colors">{label}</div>
            <div className="text-2xl font-bold tracking-tighter mb-0.5">{value} hrs</div>
            {sub && <div className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">{sub}</div>}
            <div className={cn(
                "text-[10px] font-bold mt-4 flex items-center gap-1",
                isPositive ? "text-success" : "text-destructive"
            )}>
                <TrendingUp className={cn("h-3 w-3", !isPositive && "rotate-180")} /> {trend}
            </div>
        </div>
    );
}
