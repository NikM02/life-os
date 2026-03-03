import React, { useState, useMemo } from 'react';
import {
    Layers, Plus, CheckCircle2, PlayCircle, TrendingUp, Trash2, Edit2, Timer, Download, Calendar, BarChart3
} from 'lucide-react';
import { PageHeader, StatCard, ProgressBar, Button } from '@/components/shared';
import { useData } from '@/contexts/DataContext';
import { KanbanTask, KanbanColumn, ExecutionData } from '@/types/lifeos';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { exportExecutionDataToCSV } from '@/lib/export-utils';

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
        <div className="animate-fade-in max-w-7xl mx-auto pb-32 px-4 shadow-none">
            <PageHeader
                title="Execution"
                description="Convert intent into tangible output."
            >
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => exportExecutionDataToCSV(data.tasks)}
                        className="h-9 px-4 rounded-xl opacity-40 hover:opacity-100"
                    >
                        <Download size={14} className="mr-2" /> Export
                    </Button>
                    <Button
                        onClick={() => setEditingTask({
                            id: crypto.randomUUID(),
                            content: '',
                            status: 'todo',
                            priority: 'Medium',
                            velocity: 0,
                            createdAt: new Date().toISOString(),
                            linkedIds: []
                        })}
                        variant="outline"
                        size="sm"
                        className="h-9 px-4 rounded-xl border-border/10"
                    >
                        <Plus size={14} className="mr-2" /> New Task
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                <StatCard label="Input" value={stats.total} icon={<Layers />} />
                <StatCard label="Active" value={stats.inProgress} icon={<PlayCircle />} className="bg-primary/5" />
                <StatCard label="Output" value={stats.done} icon={<CheckCircle2 />} />
                <StatCard label="Rate" value={`${stats.progress}%`} icon={<BarChart3 />} />
            </div>

            <div className="space-y-20">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {data.columns.map(column => (
                <div
                    key={column.id}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, column.id)}
                    className="flex flex-col gap-8"
                >
                    <div className="flex items-center gap-3 px-1 opacity-30">
                        <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            column.id === 'todo' ? "bg-muted-foreground" :
                                column.id === 'in-progress' ? "bg-primary" :
                                    "bg-success"
                        )} />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">{column.title}</h3>
                        <span className="text-[8px] font-bold">{data.tasks.filter(t => t.status === column.id).length}</span>
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
                                        "bg-background border border-border/10 p-5 rounded-2xl cursor-grab active:cursor-grabbing hover:bg-secondary/5 transition-all group",
                                        draggedTaskId === task.id && "opacity-40"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <span className={cn(
                                            "text-[7px] font-black uppercase tracking-widest",
                                            task.priority === 'High' ? "text-destructive" :
                                                task.priority === 'Medium' ? "text-warning" :
                                                    "text-success"
                                        )}>
                                            {task.priority}
                                        </span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => onEditTask(task)} className="text-muted-foreground/30 hover:text-foreground"><Edit2 size={10} /></button>
                                            <button onClick={() => deleteTask(task.id)} className="text-destructive/20 hover:text-destructive"><Trash2 size={10} /></button>
                                        </div>
                                    </div>
                                    <h4 className="text-[11px] font-bold text-foreground/80 leading-relaxed uppercase tracking-wide mb-5">{task.content}</h4>
                                    <div className="flex items-center justify-between pt-4 border-t border-border/5 text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30">
                                        <div className="flex items-center gap-1.5"><Calendar size={10} /> {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : '-'}</div>
                                        <div className="flex items-center gap-1.5"><Timer size={10} /> {task.velocity || 0}H</div>
                                    </div>
                                </div>
                            ))}

                        {data.tasks.filter(task => task.status === column.id).length === 0 && (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 border border-dashed border-border/5 rounded-2xl opacity-10">
                                <p className="text-[8px] font-black uppercase tracking-[0.3em]">Standby</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm animate-fade-in">
            <div className="bg-background border border-border/10 w-full max-w-md p-10 rounded-3xl shadow-2xl animate-scale-in">
                <h3 className="text-lg font-black tracking-tight mb-8 uppercase italic border-b border-border/5 pb-4">
                    Initialize Protocol
                </h3>

                <div className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Directive</label>
                        <input
                            autoFocus
                            className="w-full bg-secondary/5 border border-border/10 rounded-xl px-4 py-4 text-[10px] font-bold uppercase tracking-widest focus:outline-none"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Declare action..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Priority</label>
                            <select
                                className="w-full bg-secondary/5 border border-border/10 rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest focus:outline-none appearance-none"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as any)}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Status</label>
                            <select
                                className="w-full bg-secondary/5 border border-border/10 rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest focus:outline-none appearance-none"
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
                        <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Velocity (H)</label>
                        <input
                            type="number"
                            className="w-full bg-secondary/5 border border-border/10 rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest focus:outline-none"
                            value={velocity}
                            onChange={(e) => setVelocity(parseFloat(e.target.value) || 0)}
                        />
                    </div>

                    <div className="flex gap-4 pt-6">
                        <Button variant="ghost" className="flex-1 h-12" onClick={onClose}>Abort</Button>
                        <Button variant="primary" className="flex-1 h-12" onClick={() => onSave({ ...task, content, priority, status, velocity })}>Deploy</Button>
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
        <div className="border border-border/10 p-10 rounded-3xl animate-slide-up bg-secondary/5">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 italic">Telemetry</h2>
                </div>
                <div className="opacity-10"><BarChart3 size={20} /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-10">
                    <div>
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Efficiency</span>
                            <span className="text-xl font-black italic">{completionRate}%</span>
                        </div>
                        <ProgressBar value={completionRate} className="h-1" />
                    </div>

                    <div className="p-6 rounded-2xl border border-border/5 flex items-center justify-between bg-background/50">
                        <div className="flex items-center gap-4">
                            <div className="w-1 h-4 bg-destructive opacity-40" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Critical Path focus</span>
                        </div>
                        <div className="text-lg font-black">{highPriority}</div>
                    </div>
                </div>

                <div className="flex flex-col justify-end">
                    <div className="bg-background/50 border border-border/5 p-8 rounded-2xl">
                        <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30 mb-4">Accumulated Velocity</div>
                        <div className="text-3xl font-black tracking-tighter italic">{totalVelocity} <span className="text-[10px] uppercase tracking-widest not-italic ml-2 opacity-30">Hours</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
