import React, { useState, useMemo } from 'react';
import {
    Video, Plus, CheckCircle2, PlayCircle, Clock, Clapperboard, PenTool, BarChart3, Download
} from 'lucide-react';
import { PageHeader, StatCard, Button } from '@/components/shared';
import { ContentItem, ContentStatus } from '@/types/lifeos';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useData } from '@/contexts/DataContext';
import { exportContentDataToCSV } from '@/lib/export-utils';

const CHANNELS = ['Nikstrm Tech Channel', 'Wholenix', 'Trivahh Channel', 'Website', 'Digital Assets'];
const STATUSES: ContentStatus[] = ['Idea', 'Script & Thumbnail', 'Outline & Draft', 'Published'];

export default function ContentPipeline() {
    const { content: data, setContent: setData } = useData();
    const [selectedChannel, setSelectedChannel] = useState<string>('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

    const filteredItems = useMemo(() => {
        if (selectedChannel === 'All') return data.items;
        return data.items.filter(item => item.channel === selectedChannel);
    }, [data.items, selectedChannel]);

    const stats = useMemo(() => {
        const total = filteredItems.length;
        const published = filteredItems.filter(i => i.status === 'Published').length;
        const inProduction = filteredItems.filter(i => !['Idea', 'Published'].includes(i.status)).length;
        const rate = total > 0 ? Math.round((published / total) * 100) : 0;
        return { total, published, inProduction, rate };
    }, [filteredItems]);

    const handleSave = (item: ContentItem) => {
        if (editingItem) {
            setData({ ...data, items: data.items.map(i => i.id === editingItem.id ? item : i) });
        } else {
            setData({ ...data, items: [...data.items, item] });
        }
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleDelete = (id: string) => {
        setData({ ...data, items: data.items.filter(i => i.id !== id) });
    };

    return (
        <div className="animate-fade-in max-w-7xl mx-auto pb-32 px-4 shadow-none">
            <PageHeader title="Pipeline" description="Creative asset sequencing and output velocity.">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => exportContentDataToCSV(data.items)} className="opacity-40 hover:opacity-100">
                        <Download size={14} className="mr-2" /> Export
                    </Button>
                    <select
                        value={selectedChannel}
                        onChange={(e) => setSelectedChannel(e.target.value)}
                        className="bg-secondary/5 border border-border/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none h-9 appearance-none italic"
                    >
                        <option value="All">ALL STREAMS</option>
                        {CHANNELS.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                    </select>
                    <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} variant="outline" size="sm" className="h-9 px-4 rounded-xl border-border/10">
                        <Plus size={14} className="mr-2" /> INIT PROD
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                <StatCard label="Inventory" value={stats.total} icon={<Video />} />
                <StatCard label="In Logic" value={stats.inProduction} icon={<PlayCircle />} className="bg-primary/5" />
                <StatCard label="Released" value={stats.published} icon={<CheckCircle2 />} />
                <StatCard label="Yield" value={`${stats.rate}%`} icon={<BarChart3 />} />
            </div>

            <ContentKanban
                items={filteredItems}
                setData={(items) => setData({ ...data, items })}
                onEdit={(item) => { setEditingItem(item); setIsModalOpen(true); }}
                onDelete={handleDelete}
            />

            {isModalOpen && (
                <ContentModal
                    item={editingItem}
                    onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

function ContentKanban({ items, setData, onEdit, onDelete }: {
    items: ContentItem[]; setData: (items: ContentItem[]) => void; onEdit: (item: ContentItem) => void; onDelete: (id: string) => void;
}) {
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const onDragStart = (e: React.DragEvent, id: string) => {
        setDraggedId(id);
        e.dataTransfer.setData('contentId', id);
    };
    const onDrop = (e: React.DragEvent, status: ContentStatus) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('contentId') || draggedId;
        if (!id) return;
        setData(items.map(item => item.id === id ? { ...item, status } : item));
        setDraggedId(null);
    };

    return (
        <div className="flex gap-10 overflow-x-auto pb-10 scrollbar-hide">
            {STATUSES.map(status => (
                <div key={status} onDragOver={e => e.preventDefault()} onDrop={e => onDrop(e, status)} className="flex-shrink-0 w-80 flex flex-col gap-8">
                    <div className="flex items-center gap-3 px-1 opacity-30">
                        <div className={cn("w-1.5 h-1.5 rounded-full", status === 'Published' ? "bg-success" : "bg-primary")} />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] italic">{status}</h3>
                        <span className="text-[8px] font-bold">{items.filter(i => i.status === status).length}</span>
                    </div>

                    <div className="flex-1 flex flex-col gap-4 min-h-[500px]">
                        {items.filter(i => i.status === status).map(item => (
                            <div
                                key={item.id}
                                draggable
                                onDragStart={e => onDragStart(e, item.id)}
                                className={cn(
                                    "bg-background border border-border/10 p-5 rounded-2xl cursor-grab active:cursor-grabbing hover:bg-secondary/5 transition-all group",
                                    draggedId === item.id && "opacity-40"
                                )}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <span className="text-[7px] font-black uppercase tracking-widest text-primary/40">{item.channel}</span>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onEdit(item)} className="text-muted-foreground/30 hover:text-foreground"><PenTool size={10} /></button>
                                        <button onClick={() => onDelete(item.id)} className="text-destructive/20 hover:text-destructive"><CheckCircle2 size={10} /></button>
                                    </div>
                                </div>
                                <h4 className="text-[11px] font-black uppercase tracking-wide leading-tight mb-5 italic">{item.title}</h4>
                                <div className="flex items-center justify-between pt-4 border-t border-border/5 text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">
                                    <div className="flex items-center gap-1.5"><Clock size={10} /> {item.dueDate ? format(new Date(item.dueDate), 'MMM d') : '-'}</div>
                                    <div className={cn("w-1.5 h-1.5 rounded-full", item.priority === 'High' ? "bg-destructive" : item.priority === 'Medium' ? "bg-warning" : "bg-success")} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function ContentModal({ item, onClose, onSave }: {
    item?: ContentItem | null; onClose: () => void; onSave: (item: ContentItem) => void;
}) {
    const [title, setTitle] = useState(item?.title || '');
    const [channel, setChannel] = useState(item?.channel || CHANNELS[0]);
    const [status, setStatus] = useState<ContentStatus>(item?.status || 'Idea');
    const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>(item?.priority || 'Medium');
    const [dueDate, setDueDate] = useState(item?.dueDate ? item.dueDate.split('T')[0] : new Date().toISOString().split('T')[0]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm animate-fade-in shadow-none">
            <div className="bg-background border border-border/10 w-full max-w-md p-10 rounded-3xl shadow-2xl animate-scale-in">
                <h3 className="text-lg font-black tracking-tight mb-8 uppercase italic border-b border-border/5 pb-4">INIT PRODUCTION</h3>
                <div className="space-y-8 mt-8">
                    <div className="space-y-2">
                        <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Asset Title</label>
                        <input className="w-full bg-secondary/5 border border-border/10 rounded-xl px-4 py-4 text-[10px] font-black uppercase tracking-widest focus:outline-none italic" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Declare..." />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Stream</label>
                            <select className="w-full bg-secondary/5 border border-border/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:outline-none appearance-none" value={channel} onChange={e => setChannel(e.target.value)}>
                                {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Horizon</label>
                            <input type="date" className="w-full bg-secondary/5 border border-border/10 rounded-xl px-4 py-3 text-[10px] font-black focus:outline-none" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Priority</label>
                            <select className="w-full bg-secondary/5 border border-border/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:outline-none appearance-none" value={priority} onChange={e => setPriority(e.target.value as any)}>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Status</label>
                            <select className="w-full bg-secondary/5 border border-border/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest focus:outline-none appearance-none" value={status} onChange={e => setStatus(e.target.value as any)}>
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-6">
                        <Button variant="ghost" className="flex-1 h-12" onClick={onClose}>Abort</Button>
                        <Button variant="primary" className="flex-1 h-12" onClick={() => onSave({ id: item?.id || crypto.randomUUID(), title, channel, status, priority, hook: '', dueDate: new Date(dueDate).toISOString() })}>DEPLOY</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
