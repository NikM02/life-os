import React, { useState, useMemo } from 'react';
import {
    Plus, Search, Book, Video, Globe, FileText,
    Heart, ExternalLink, Trash2, Edit2, CheckCircle2,
    Clock, PlayCircle, Star, BookOpen, Layers, Download, Gem, Calendar
} from 'lucide-react';
import { PageHeader, StatCard, Button } from '@/components/shared';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';
import { KnowledgeEntry, KnowledgeCategory, KnowledgeStatus } from '@/types/lifeos';
import { exportLibraryDataToCSV } from '@/lib/export-utils';

const CATEGORIES: KnowledgeCategory[] = ['Books', 'Course', 'Article', 'Video', 'Others'];
const STATUSES: KnowledgeStatus[] = ['Not Started', 'Half Done', 'Completed'];

const CATEGORY_ICONS = {
    Books: <Book size={16} />,
    Course: <Layers size={16} />,
    Article: <FileText size={16} />,
    Video: <Video size={16} />,
    Others: <Globe size={16} />
};

export default function Library() {
    const { library: entries, setLibrary: setEntries } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [isLikedOnly, setIsLikedOnly] = useState(false);
    const [editingEntry, setEditingEntry] = useState<Partial<KnowledgeEntry> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredEntries = useMemo(() => {
        return entries.filter(entry => {
            const matchesSearch = entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                entry.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || entry.category === selectedCategory;
            const matchesLiked = !isLikedOnly || entry.isLiked;
            return matchesSearch && matchesCategory && matchesLiked;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [entries, searchQuery, selectedCategory, isLikedOnly]);

    const stats = useMemo(() => {
        const total = entries.length;
        const completed = entries.filter(e => e.status === 'Completed').length;
        const learning = entries.filter(e => e.status === 'Half Done').length;
        const liked = entries.filter(e => e.isLiked).length;
        return { total, completed, learning, liked };
    }, [entries]);

    const handleSave = () => {
        if (!editingEntry?.name) return;

        if (editingEntry.id) {
            setEntries(entries.map(e => e.id === editingEntry.id ? editingEntry as KnowledgeEntry : e));
        } else {
            const newEntry: KnowledgeEntry = {
                id: crypto.randomUUID(),
                name: editingEntry.name,
                description: editingEntry.description || '',
                category: editingEntry.category || 'Others',
                status: editingEntry.status || 'Not Started',
                link: editingEntry.link || '',
                deadline: editingEntry.deadline || '',
                isLiked: false,
                createdAt: new Date().toISOString(),
                linkedIds: []
            };
            setEntries([...entries, newEntry]);
        }
        setIsModalOpen(false);
        setEditingEntry(null);
    };

    const handleDelete = (id: string) => {
        setEntries(entries.filter(e => e.id !== id));
    };

    const toggleLike = (id: string) => {
        setEntries(entries.map(e => e.id === id ? { ...e, isLiked: !e.isLiked } : e));
    };

    return (
        <div className="max-w-7xl mx-auto pb-32 px-4 animate-fade-in shadow-none">
            <PageHeader title="Library">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => exportLibraryDataToCSV(entries)} className="opacity-40 hover:opacity-100">
                        <Download size={14} className="mr-2" /> Export
                    </Button>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search wisdom..."
                            className="bg-secondary/20 border border-border/10 rounded-2xl pl-12 pr-6 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => { setEditingEntry({}); setIsModalOpen(true); }} variant="outline" size="sm" className="h-10 px-6 rounded-2xl">
                        <Plus size={16} className="mr-2" /> Add Knowledge
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
                <StatCard label="Total Resources" value={stats.total} icon={<BookOpen />} />
                <StatCard label="Deep Diving" value={stats.learning} icon={<PlayCircle />} />
                <StatCard label="Mastered" value={stats.completed} icon={<CheckCircle2 />} />
                <StatCard label="Treasured" value={stats.liked} icon={<Star />} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-2 p-1.5 bg-secondary/20 rounded-2xl">
                    {['All', ...CATEGORIES].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                                "px-6 py-2 rounded-xl text-[11px] font-semibold transition-all",
                                selectedCategory === cat ? "bg-background shadow-sm text-primary" : "text-muted-foreground/40 hover:text-muted-foreground"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setIsLikedOnly(!isLikedOnly)}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-semibold transition-all border",
                        isLikedOnly ? "bg-primary/5 border-primary/20 text-primary" : "bg-transparent border-transparent text-muted-foreground/40 hover:text-primary"
                    )}
                >
                    <Heart size={14} className={cn(isLikedOnly && "fill-current")} />
                    Treasured Only
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredEntries.map(entry => (
                    <div key={entry.id} className="p-8 rounded-3xl bg-background border border-border/40 group hover:border-primary/20 transition-all duration-500 flex flex-col h-full relative">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center gap-3 py-1.5 px-3 rounded-xl bg-secondary/20 text-muted-foreground/40 text-[10px] font-semibold uppercase tracking-wider">
                                {CATEGORY_ICONS[entry.category]}
                                {entry.category}
                            </div>
                            <div className="flex items-center gap-2 transition-opacity">
                                <button onClick={() => toggleLike(entry.id)} className={cn("p-2 rounded-lg transition-colors", entry.isLiked ? "text-primary" : "text-muted-foreground/20 hover:text-primary")}><Heart size={14} className={cn(entry.isLiked && "fill-current")} /></button>
                                <button onClick={() => { setEditingEntry(entry); setIsModalOpen(true); }} className="p-2 rounded-lg text-muted-foreground/20 hover:text-primary transition-colors"><Edit2 size={14} /></button>
                                <button onClick={() => handleDelete(entry.id)} className="p-2 rounded-lg text-muted-foreground/10 hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-semibold tracking-tight text-foreground/90 leading-tight group-hover:text-primary transition-colors">{entry.name}</h3>
                                {entry.isLiked && <Gem size={16} className="text-primary animate-pulse" />}
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-border/5 flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <div className={cn(
                                    "text-[10px] font-semibold uppercase tracking-widest",
                                    entry.status === 'Completed' ? "text-success" :
                                        entry.status === 'Half Done' ? "text-warning" : "text-muted-foreground/20"
                                )}>
                                    {entry.status}
                                </div>
                                {entry.deadline && (
                                    <div className="flex items-center gap-1.5 text-[9px] font-medium text-muted-foreground/30">
                                        <Calendar size={10} />
                                        {entry.deadline}
                                    </div>
                                )}
                            </div>
                            {entry.link && (
                                <a href={entry.link} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                                    <ExternalLink size={14} />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm animate-fade-in shadow-none">
                    <div className="bg-background border border-border/10 w-full max-w-lg p-10 rounded-3xl shadow-3xl animate-scale-in">
                        <h3 className="text-2xl font-semibold tracking-tight mb-8">Architect Knowledge</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30 ml-1">Asset Identity (Title)</label>
                                <input
                                    className="w-full bg-secondary/5 border border-border/20 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                                    value={editingEntry?.name || ''}
                                    onChange={(e) => setEditingEntry(prev => ({ ...prev!, name: e.target.value }))}
                                    placeholder="Declare identifier..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30 ml-1">Context (Description)</label>
                                <textarea
                                    className="w-full bg-secondary/5 border border-border/20 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all min-h-[100px] resize-none"
                                    value={editingEntry?.description || ''}
                                    onChange={(e) => setEditingEntry(prev => ({ ...prev!, description: e.target.value }))}
                                    placeholder="Synthesize information..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30 ml-1">Status</label>
                                    <select
                                        className="w-full bg-secondary/5 border border-border/20 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all appearance-none"
                                        value={editingEntry?.status || 'Not Started'}
                                        onChange={(e) => setEditingEntry(prev => ({ ...prev!, status: e.target.value as KnowledgeStatus }))}
                                    >
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30 ml-1">Type (Category)</label>
                                    <select
                                        className="w-full bg-secondary/5 border border-border/20 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all appearance-none"
                                        value={editingEntry?.category || 'Others'}
                                        onChange={(e) => setEditingEntry(prev => ({ ...prev!, category: e.target.value as KnowledgeCategory }))}
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30 ml-1">Source Link</label>
                                    <input
                                        type="url"
                                        className="w-full bg-secondary/5 border border-border/20 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                                        value={editingEntry?.link || ''}
                                        onChange={(e) => setEditingEntry(prev => ({ ...prev!, link: e.target.value }))}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30 ml-1">Deadline</label>
                                    <input
                                        type="date"
                                        className="w-full bg-secondary/5 border border-border/20 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                                        value={editingEntry?.deadline || ''}
                                        onChange={(e) => setEditingEntry(prev => ({ ...prev!, deadline: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <Button variant="ghost" className="flex-1" onClick={() => { setIsModalOpen(false); setEditingEntry(null); }}>Discard</Button>
                                <Button className="flex-1" onClick={handleSave}>Sync Brain</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
