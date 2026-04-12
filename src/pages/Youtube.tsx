import React, { useState, useMemo } from 'react';
import {
    Plus, Layout, List, Search,
    CheckCircle2, Layers, Compass, Download,
    X, Trash2, Edit2, Clock, Zap, Target
} from 'lucide-react';
import { PageHeader, StatCard, Button } from '@/components/shared';
import { useData } from '@/contexts/DataContext';
import { ContentItem, ContentStatus } from '@/types/lifeos';
import { cn } from '@/lib/utils';
import { exportContentDataToCSV } from '@/lib/export-utils';

const CHANNELS = ['wholenix', 'nikstrm', 'trivahh', 'website', 'digi assest'];
const STATUSES: ContentStatus[] = ['Idea', 'Script & Thumbnail', 'Outline & Draft', 'Published'];

export default function Youtube() {
    const { content, setContent } = useData();
    const [view, setView] = useState<'board' | 'list'>('board');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeModal, setActiveModal] = useState<boolean>(false);
    const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
    const [selectedChannel, setSelectedChannel] = useState<string>('All Assets');

    const stats = useMemo(() => {
        const total = content.items.length;
        const published = content.items.filter(i => i.status === 'Published').length;
        const idea = content.items.filter(i => i.status === 'Idea').length;
        return { total, published, idea };
    }, [content.items]);

    const filteredItems = useMemo(() => {
        return content.items.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.channel.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesChannel = selectedChannel === 'All Assets' || item.channel === selectedChannel;
            return matchesSearch && matchesChannel;
        });
    }, [content.items, searchQuery, selectedChannel]);

    const handleSaveAsset = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const newItem: ContentItem = {
            id: editingItem?.id || crypto.randomUUID(),
            title: formData.get('title') as string,
            channel: formData.get('channel') as string,
            description: formData.get('description') as string,
            status: formData.get('status') as ContentStatus,
            priority: formData.get('priority') as 'Low' | 'Medium' | 'High',
            velocity: parseFloat(formData.get('velocity') as string) || 0,
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string,
        };

        if (editingItem) {
            setContent({
                ...content,
                items: content.items.map(i => i.id === editingItem.id ? newItem : i)
            });
        } else {
            setContent({
                ...content,
                items: [...content.items, newItem]
            });
        }

        setActiveModal(false);
        setEditingItem(null);
    };

    const deleteItem = (id: string) => {
        if (confirm('Delete this asset?')) {
            setContent({
                ...content,
                items: content.items.filter(i => i.id !== id)
            });
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-32 px-4 animate-fade-in shadow-none">
            <PageHeader title="Youtube">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => exportContentDataToCSV(content)} className="opacity-40 hover:opacity-100">
                        <Download size={14} className="mr-2" /> Export
                    </Button>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter assets..."
                            className="bg-secondary/20 border border-border/10 rounded-2xl pl-12 pr-6 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => { setEditingItem(null); setActiveModal(true); }} className="h-10 px-6 rounded-2xl shadow-lg shadow-primary/10">
                        <Plus size={16} className="mr-2" /> New Asset
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <StatCard label="Total Assets" value={stats.total} icon={<Layers />} />
                <StatCard label="Incubating" value={stats.idea} icon={<Compass className="text-primary" />} />
                <StatCard label="Deployed" value={stats.published} icon={<CheckCircle2 className="text-success" />} />
            </div>

            <div className="flex items-center justify-between mb-12">
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {['All Assets', ...CHANNELS].map(channel => (
                        <button
                            key={channel}
                            onClick={() => setSelectedChannel(channel)}
                            className={cn(
                                "text-[11px] font-semibold uppercase tracking-widest transition-all whitespace-nowrap px-2 py-1 rounded-lg",
                                selectedChannel === channel ? "text-primary bg-primary/5" : "text-muted-foreground/30 hover:text-primary"
                            )}
                        >
                            {channel}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 p-1 bg-secondary/10 rounded-2xl border border-border/5">
                    <button onClick={() => setView('board')} className={cn("p-2 rounded-xl transition-all", view === 'board' ? "bg-background text-primary shadow-sm" : "text-muted-foreground/30")}>
                        <Layout size={16} />
                    </button>
                    <button onClick={() => setView('list')} className={cn("p-2 rounded-xl transition-all", view === 'list' ? "bg-background text-primary shadow-sm" : "text-muted-foreground/30")}>
                        <List size={16} />
                    </button>
                </div>
            </div>

            {view === 'board' ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                    {STATUSES.map(status => (
                        <div key={status} className="space-y-6">
                            <div className="flex items-center justify-between opacity-60 px-2">
                                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30">{status}</h3>
                                <span className="text-[10px] font-bold opacity-20">{filteredItems.filter(i => i.status === status).length}</span>
                            </div>
                            <div className="space-y-4">
                                {filteredItems.filter(i => i.status === status).map(item => (
                                    <div key={item.id} className="p-6 rounded-3xl bg-secondary/10 border border-border/5 hover:border-primary/20 transition-all duration-500 group relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-semibold text-muted-foreground/30 uppercase tracking-widest">{item.channel}</span>
                                                <div className={cn(
                                                    "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border",
                                                    item.priority === 'High' ? "border-destructive/30 text-destructive/50" : "border-border/30 text-muted-foreground/30"
                                                )}>{item.priority}</div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => { setEditingItem(item); setActiveModal(true); }} className="p-1.5 hover:bg-background rounded-lg text-muted-foreground/40 hover:text-primary transition-all">
                                                    <Edit2 size={12} />
                                                </button>
                                                <button onClick={() => deleteItem(item.id)} className="p-1.5 hover:bg-background rounded-lg text-muted-foreground/40 hover:text-destructive transition-all">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-semibold tracking-tight text-foreground/80 leading-relaxed group-hover:text-primary transition-colors line-clamp-2">{item.title}</h4>
                                            {item.description && <p className="text-[10px] text-muted-foreground/40 line-clamp-2 italic">{item.description}</p>}
                                            <div className="flex items-center justify-between pt-4 border-t border-border/5">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={10} className="text-muted-foreground/30" />
                                                    <span className="text-[9px] font-medium text-muted-foreground/30">{item.velocity || 0}h</span>
                                                </div>
                                                <span className="text-[9px] font-medium text-muted-foreground/20 italic">{item.startDate || 'TBD'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    variant="ghost"
                                    onClick={() => { setEditingItem(null); setActiveModal(true); }}
                                    className="w-full text-[9px] opacity-10 hover:opacity-100 border border-border/10 rounded-3xl py-4 h-auto"
                                >
                                    Manifest Asset
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-secondary/5 rounded-3xl border border-border/5 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-secondary/10">
                            <tr className="text-left border-b border-border/5">
                                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Asset</th>
                                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Channel</th>
                                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Status</th>
                                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Velocity</th>
                                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Timeline</th>
                                <th className="p-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/5">
                            {filteredItems.map(item => (
                                <tr key={item.id} className="hover:bg-secondary/10 transition-colors">
                                    <td className="p-6">
                                        <div className="space-y-1">
                                            <div className="text-sm font-semibold">{item.title}</div>
                                            <div className="text-[10px] text-muted-foreground/40 truncate max-w-xs">{item.description || '--'}</div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-[10px] font-bold uppercase tracking-widest opacity-40">{item.channel}</td>
                                    <td className="p-6">
                                        <span className="px-2 py-0.5 rounded-lg border border-border/10 text-[9px] font-bold uppercase opacity-40">{item.status}</span>
                                    </td>
                                    <td className="p-6 text-xs font-mono opacity-40">{item.velocity || 0}h</td>
                                    <td className="p-6 text-[10px] text-muted-foreground/30 italic">{item.startDate || 'TBD'} - {item.endDate || 'TBD'}</td>
                                    <td className="p-6">
                                        <div className="flex gap-2">
                                            <button onClick={() => { setEditingItem(item); setActiveModal(true); }} className="p-2 hover:bg-background rounded-xl text-muted-foreground/20 hover:text-primary transition-all">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => deleteItem(item.id)} className="p-2 hover:bg-background rounded-xl text-muted-foreground/20 hover:text-destructive transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {
                activeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-fade-in">
                        <div className="bg-background border border-border/10 rounded-[2.5rem] w-full max-w-xl p-10 shadow-2xl space-y-8 relative overflow-hidden">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-2xl font-semibold tracking-tight">{editingItem ? 'Edit Asset' : 'Manifest Asset'}</h2>
                                <button onClick={() => setActiveModal(false)} className="p-2 hover:bg-secondary rounded-2xl transition-colors">
                                    <X size={20} className="text-muted-foreground/40" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveAsset} className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">Asset Title</label>
                                    <input
                                        name="title" required
                                        defaultValue={editingItem?.title}
                                        className="w-full bg-background border border-border/10 rounded-2xl px-6 py-4 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                                        placeholder="Enter asset title..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">Category</label>
                                        <select
                                            name="channel"
                                            defaultValue={editingItem?.channel || 'wholenix'}
                                            className="w-full bg-background border border-border/10 rounded-2xl px-6 py-4 text-sm font-semibold appearance-none focus:outline-none"
                                        >
                                            {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">Current Status</label>
                                        <select
                                            name="status"
                                            defaultValue={editingItem?.status || 'Idea'}
                                            className="w-full bg-background border border-border/10 rounded-2xl px-6 py-4 text-sm font-semibold appearance-none focus:outline-none"
                                        >
                                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">Priority</label>
                                        <select
                                            name="priority"
                                            defaultValue={editingItem?.priority || 'Medium'}
                                            className="w-full bg-background border border-border/10 rounded-2xl px-6 py-4 text-sm font-semibold appearance-none focus:outline-none"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">Velocity (Hours)</label>
                                        <input
                                            type="number" step="0.5" name="velocity"
                                            defaultValue={editingItem?.velocity}
                                            className="w-full bg-background border border-border/10 rounded-2xl px-6 py-4 text-sm font-semibold focus:outline-none"
                                            placeholder="0.0"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">Start Date</label>
                                        <input
                                            type="date" name="startDate"
                                            defaultValue={editingItem?.startDate}
                                            className="w-full bg-background border border-border/10 rounded-2xl px-6 py-4 text-sm font-semibold focus:outline-none"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">End Date</label>
                                        <input
                                            type="date" name="endDate"
                                            defaultValue={editingItem?.endDate}
                                            className="w-full bg-background border border-border/10 rounded-2xl px-6 py-4 text-sm font-semibold focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">Description</label>
                                    <textarea
                                        name="description"
                                        defaultValue={editingItem?.description}
                                        className="w-full bg-background border border-border/10 rounded-2xl p-4 text-xs font-medium focus:outline-none h-24 resize-none"
                                        placeholder="Asset details..."
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button type="button" variant="outline" className="flex-1 rounded-2xl" onClick={() => setActiveModal(false)}>Cancel</Button>
                                    <Button type="submit" className="flex-1 rounded-2xl shadow-lg shadow-primary/20">Initialize</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
