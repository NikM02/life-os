import React, { useState, useMemo } from 'react';
import {
    Video, Calendar as CalendarIcon, List, BookOpen, Plus,
    Filter, MoreVertical, Search, CheckCircle2,
    PlayCircle, Clock, Layout, ChevronRight, AlertCircle,
    Clapperboard, PenTool, Scissors, Image as ImageIcon,
    Share2, BarChart3, TrendingUp
} from 'lucide-react';
import { PageHeader, StatCard, ProgressBar, CategoryBadge, Button } from '@/components/shared';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { ContentItem, ContentSOP, ContentPipelineData, ContentStatus } from '@/types/lifeos';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

const CHANNELS = ['Nikstrm Tech Channel', 'Wholenix', 'Trivahh Channel', 'Website', 'Digital Assets'];
const STATUSES: ContentStatus[] = ['Idea', 'Script & Thumbnail', 'Outline & Draft', 'Published'];

const INITIAL_SOPS: ContentSOP[] = CHANNELS.map(channel => ({
    channel,
    scriptTemplate: `# ${channel} Script Template\n\n## Hook\n[Add hook here]\n\n## Intro\n[Add intro here]\n\n## Body\n- Point 1\n- Point 2\n\n## Outro\n[Add CTA here]`,
    filmingChecklist: ['Charge batteries', 'Check audio levels', 'Set up lighting', 'Clean lens'],
    editingChecklist: ['Color grade', 'Add b-roll', 'Sound design', 'Export 4K'],
    uploadChecklist: ['SEO Title', 'Description tags', 'End screens', 'Cards']
}));

import { useData } from '@/contexts/DataContext';

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
            setData({
                ...data,
                items: data.items.map(i => i.id === editingItem.id ? item : i)
            });
        } else {
            setData({ ...data, items: [...data.items, item] });
        }
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this content?')) {
            setData({
                ...data,
                items: data.items.filter(i => i.id !== id)
            });
        }
    };

    return (
        <div className="animate-fade-in pb-10 px-8">
            <PageHeader
                title="Content Pipeline"
                description="Streamline your creative workflow from idea to hit video."
            >
                <div className="flex items-center gap-3">
                    <select
                        value={selectedChannel}
                        onChange={(e) => setSelectedChannel(e.target.value)}
                        className="bg-secondary/40 border border-border/5 rounded-xl px-5 py-3 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all appearance-none pr-10 cursor-pointer"
                    >
                        <option value="All">All Content</option>
                        {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <Button
                        onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                        variant="primary"
                    >
                        <Plus className="h-4 w-4" /> New Content
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard label="Total Content" value={stats.total} icon={<Video className="h-4 w-4" />} />
                <StatCard label="In Production" value={stats.inProduction} icon={<PlayCircle className="h-4 w-4" />} />
                <StatCard label="Published" value={stats.published} icon={<CheckCircle2 className="h-4 w-4" />} />
                <StatCard label="Efficiency" value={`${stats.rate}%`} icon={<BarChart3 className="h-4 w-4" />} />
            </div>

            <div className="min-h-[600px] overflow-hidden">
                <ContentKanban
                    items={filteredItems}
                    setData={(items) => setData({ ...data, items })}
                    onEdit={(item) => { setEditingItem(item); setIsModalOpen(true); }}
                    onDelete={handleDelete}
                />
            </div>

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

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <Button
            variant={active ? 'glass' : 'ghost'}
            size="sm"
            onClick={onClick}
            className={cn(
                "px-6 !rounded-lg border-none shadow-none",
                active ? "bg-background shadow-soft" : "opacity-40"
            )}
        >
            {icon}
            {label}
        </Button>
    );
}

function ContentKanban({
    items,
    setData,
    onEdit,
    onDelete
}: {
    items: ContentItem[];
    setData: (items: ContentItem[]) => void;
    onEdit: (item: ContentItem) => void;
    onDelete: (id: string) => void;
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
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
            {STATUSES.map(status => (
                <div
                    key={status}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => onDrop(e, status)}
                    className="flex-shrink-0 w-80 flex flex-col gap-4"
                >
                    <div className="flex items-center justify-between px-2 mb-2">
                        <div className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", status === 'Published' ? "bg-success" : "bg-primary")} />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{status}</h3>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg bg-secondary/50 text-muted-foreground/60">
                                {items.filter(i => i.status === status).length}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 min-h-[500px]">
                        {items.filter(i => i.status === status).map(item => (
                            <div
                                key={item.id}
                                draggable
                                onDragStart={e => onDragStart(e, item.id)}
                                className={cn(
                                    "glass-card p-5 cursor-grab active:cursor-grabbing hover:border-primary/40 transition-all group relative",
                                    draggedId === item.id && "opacity-40 grayscale-[0.5]"
                                )}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/10">
                                        {item.channel}
                                    </div>
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        item.priority === 'High' ? "bg-destructive shadow-glow shadow-destructive/50" :
                                            item.priority === 'Medium' ? "bg-warning" : "bg-success"
                                    )} />
                                </div>
                                <h4 className="text-sm font-bold leading-tight mb-4">{item.title}</h4>
                                <div className="flex items-center justify-between pt-4 border-t border-border/5">
                                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter text-muted-foreground/40">
                                        <Clock className="h-3 w-3" />
                                        {item.dueDate ? format(new Date(item.dueDate), 'MMM d, yyyy') : 'No Date'}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => onEdit(item)}
                                            className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground/60 hover:text-primary"
                                        >
                                            <PenTool className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(item.id)}
                                            className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground/40 hover:text-destructive"
                                        >
                                            <AlertCircle className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function ContentModal({
    item,
    onClose,
    onSave
}: {
    item?: ContentItem | null;
    onClose: () => void;
    onSave: (item: ContentItem) => void;
}) {
    const [title, setTitle] = useState(item?.title || '');
    const [channel, setChannel] = useState(item?.channel || CHANNELS[0]);
    const [status, setStatus] = useState<ContentStatus>(item?.status || 'Idea');
    const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>(item?.priority || 'Medium');
    const [hook, setHook] = useState(item?.hook || '');
    const [dueDate, setDueDate] = useState(item?.dueDate ? item.dueDate.split('T')[0] : new Date().toISOString().split('T')[0]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
            <div className="glass-card-vibrant w-full max-w-xl p-8 shadow-2xl animate-scale-in">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-2xl bg-primary shadow-glow shadow-primary/20">
                        <Clapperboard className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black tracking-tighter">{item ? 'Edit Content' : 'Produce New Content'}</h3>
                        <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest mt-1">Idea to Reality Pipeline</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Creative Title</label>
                        <input
                            autoFocus
                            className="w-full bg-secondary/50 border border-border/10 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/20"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter a catchy working title..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Channel</label>
                            <select className="w-full bg-secondary/50 border border-border/10 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none" value={channel} onChange={e => setChannel(e.target.value)}>
                                {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Deadline Date</label>
                            <input
                                type="date"
                                className="w-full bg-secondary/50 border border-border/10 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Priority</label>
                            <select className="w-full bg-secondary/50 border border-border/10 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none" value={priority} onChange={e => setPriority(e.target.value as any)}>
                                <option value="Low">Low Priority</option>
                                <option value="Medium">Medium Priority</option>
                                <option value="High">High Priority (Viral Potential)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Current Status</label>
                            <select className="w-full bg-secondary/50 border border-border/10 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none" value={status} onChange={e => setStatus(e.target.value as any)}>
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">The Hook / Angle</label>
                        <textarea
                            className="w-full bg-secondary/50 border border-border/10 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none h-24 transition-all"
                            value={hook}
                            onChange={(e) => setHook(e.target.value)}
                            placeholder="Why would someone click this?"
                        />
                    </div>

                    <div className="flex gap-4 pt-6">
                        <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                        <Button
                            variant="primary"
                            className="flex-1"
                            disabled={!title}
                            onClick={() => onSave({
                                id: item?.id || crypto.randomUUID(),
                                title,
                                channel,
                                status,
                                priority,
                                hook,
                                dueDate: new Date(dueDate).toISOString()
                            })}
                        >
                            {item ? 'Save Changes' : 'Start Pipeline'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
