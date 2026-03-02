import React, { useState, useMemo } from 'react';
import {
    Plus, Search, Book, Video, Globe, FileText, MoreHorizontal,
    Heart, ExternalLink, Trash2, Edit2, CheckCircle2,
    Clock, PlayCircle, Star, BookOpen, Layers
} from 'lucide-react';
import { PageHeader, StatCard, Button } from '@/components/shared';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { KnowledgeEntry, KnowledgeCategory, KnowledgeStatus } from '@/types/lifeos';
import { format } from 'date-fns';

const CATEGORIES: KnowledgeCategory[] = ['Books', 'Course', 'Article', 'Video', 'Others'];
const STATUSES: KnowledgeStatus[] = ['Not Started', 'Half Done', 'Completed'];

const CATEGORY_ICONS = {
    Books: <Book className="h-6 w-6" />,
    Course: <Layers className="h-6 w-6" />,
    Article: <FileText className="h-6 w-6" />,
    Video: <Video className="h-6 w-6" />,
    Others: <Globe className="h-6 w-6" />
};

const CATEGORY_COLORS = {
    Books: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Course: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    Article: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    Video: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    Others: "bg-amber-500/10 text-amber-500 border-amber-500/20"
};

const STATUS_ICONS = {
    'Not Started': <Clock className="h-4 w-4" />,
    'Half Done': <PlayCircle className="h-4 w-4" />,
    'Completed': <CheckCircle2 className="h-4 w-4" />
};

import { useData } from '@/contexts/DataContext';

export default function Library() {
    const { library: entries, setLibrary: setEntries } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [isLikedOnly, setIsLikedOnly] = useState(false);
    const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
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

    const handleSave = (entry: KnowledgeEntry) => {
        if (editingEntry) {
            setEntries(entries.map(e => e.id === editingEntry.id ? entry : e));
        } else {
            setEntries([...entries, entry]);
        }
        setIsModalOpen(false);
        setEditingEntry(null);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to remove this from your library?')) {
            setEntries(entries.filter(e => e.id !== id));
        }
    };

    const toggleLike = (id: string) => {
        setEntries(entries.map(e => e.id === id ? { ...e, isLiked: !e.isLiked } : e));
    };

    return (
        <div className="animate-fade-in pb-10 px-8">
            <PageHeader
                title="Knowledge Library"
                description="Your personal second brain for books, courses, and digital assets."
            >
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search brain..."
                            className="bg-secondary/40 border border-border/5 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => { setEditingEntry(null); setIsModalOpen(true); }}
                        variant="primary"
                    >
                        <Plus className="h-4 w-4" /> Add Knowledge
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 mt-6">
                <StatCard label="Brain Storage" value={stats.total} icon={<BookOpen className="h-4 w-4" />} />
                <StatCard label="In Deep Dive" value={stats.learning} icon={<PlayCircle className="h-4 w-4" />} />
                <StatCard label="Mastered" value={stats.completed} icon={<CheckCircle2 className="h-4 w-4" />} />
                <StatCard label="Treasured" value={stats.liked} icon={<Star className="h-4 w-4" />} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-2 p-1.5 bg-secondary/20 rounded-xl">
                    {['All', ...CATEGORIES].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                                "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                selectedCategory === cat ? "bg-background shadow-soft text-primary" : "text-muted-foreground/40 hover:text-muted-foreground"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setIsLikedOnly(!isLikedOnly)}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        isLikedOnly ? "bg-primary/10 border-primary/20 text-primary" : "bg-secondary/20 border-transparent text-muted-foreground/40"
                    )}
                >
                    <Heart className={cn("h-3.5 w-3.5", isLikedOnly && "fill-current")} />
                    Treasured Only
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEntries.map(entry => (
                    <KnowledgeCard
                        key={entry.id}
                        entry={entry}
                        onEdit={(e) => { setEditingEntry(e); setIsModalOpen(true); }}
                        onDelete={handleDelete}
                        onToggleLike={toggleLike}
                    />
                ))}
                {filteredEntries.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                        <div className="p-6 rounded-3xl bg-secondary/20 mb-4 opacity-20">
                            <BookOpen className="h-12 w-12" />
                        </div>
                        <h3 className="text-sm font-black text-muted-foreground/40 uppercase tracking-[0.2em]">No knowledge found</h3>
                        <p className="text-[10px] text-muted-foreground/20 font-bold mt-2 uppercase tracking-widest leading-relaxed">Expand your horizons by adding some learning assets.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <KnowledgeModal
                    entry={editingEntry}
                    onClose={() => { setIsModalOpen(false); setEditingEntry(null); }}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

function KnowledgeCard({
    entry, onEdit, onDelete, onToggleLike
}: {
    entry: KnowledgeEntry;
    onEdit: (e: KnowledgeEntry) => void;
    onDelete: (id: string) => void;
    onToggleLike: (id: string) => void;
}) {
    return (
        <div className="glass-card-vibrant p-7 group relative flex flex-col h-full border border-border/5 hover:border-primary/20 transition-all duration-500 overflow-hidden">
            {/* Background Accent */}
            <div className={cn(
                "absolute -right-8 -top-8 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity",
                CATEGORY_COLORS[entry.category].split(' ')[1]
            )} />

            <div className="flex items-start justify-between mb-6">
                <div className={cn(
                    "px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-widest flex items-center gap-2",
                    CATEGORY_COLORS[entry.category]
                )}>
                    {CATEGORY_ICONS[entry.category]}
                    {entry.category}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
                    <button
                        onClick={() => onToggleLike(entry.id)}
                        className={cn(
                            "p-2.5 rounded-xl transition-all",
                            entry.isLiked ? "bg-primary/10 text-primary" : "hover:bg-secondary text-muted-foreground/40 hover:text-primary"
                        )}
                    >
                        <Heart className={cn("h-4 w-4", entry.isLiked && "fill-current")} />
                    </button>
                    <button
                        onClick={() => onEdit(entry)}
                        className="p-2.5 rounded-xl hover:bg-secondary text-muted-foreground/40 hover:text-primary transition-all"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onDelete(entry.id)}
                        className="p-2.5 rounded-xl hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive transition-all"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1">
                <h3 className="text-lg font-black tracking-tight leading-tight mb-3 group-hover:text-primary transition-colors">
                    {entry.name}
                </h3>
                <p className="text-xs text-muted-foreground/60 leading-relaxed font-medium line-clamp-3">
                    {entry.description}
                </p>
            </div>

            <div className="mt-8 pt-6 border-t border-border/5 flex items-center justify-between">
                <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter",
                    entry.status === 'Completed' ? "bg-success/10 text-success border border-success/10" :
                        entry.status === 'Half Done' ? "bg-warning/10 text-warning border border-warning/10" :
                            "bg-muted/10 text-muted-foreground/40 border border-border/10"
                )}>
                    {STATUS_ICONS[entry.status]}
                    {entry.status}
                </div>
                {entry.link && (
                    <a
                        href={entry.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-glow shadow-primary/20"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                )}
            </div>
        </div>
    );
}

function KnowledgeModal({
    entry, onClose, onSave
}: {
    entry?: KnowledgeEntry | null;
    onClose: () => void;
    onSave: (entry: KnowledgeEntry) => void;
}) {
    const [name, setName] = useState(entry?.name || '');
    const [description, setDescription] = useState(entry?.description || '');
    const [category, setCategory] = useState<KnowledgeCategory>(entry?.category || 'Books');
    const [status, setStatus] = useState<KnowledgeStatus>(entry?.status || 'Not Started');
    const [link, setLink] = useState(entry?.link || '');
    const [isLiked, setIsLiked] = useState(entry?.isLiked || false);

    const handleSubmit = () => {
        onSave({
            id: entry?.id || crypto.randomUUID(),
            name,
            description,
            category,
            status,
            link,
            isLiked,
            createdAt: entry?.createdAt || new Date().toISOString()
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
            <div className="glass-card-vibrant w-full max-w-xl p-10 shadow-3xl animate-scale-in">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-4 rounded-3xl bg-primary shadow-glow shadow-primary/20">
                        <BookOpen className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black tracking-tighter">{entry ? 'Update Wisdom' : 'Add New Knowledge'}</h3>
                        <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest mt-1">Expanding your second brain</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Resource Name</label>
                        <input
                            autoFocus
                            className="w-full bg-secondary/50 border border-border/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/20"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Atomic Habits, Next.js Masterclass..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Category</label>
                            <select
                                className="w-full bg-secondary/50 border border-border/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none appearance-none"
                                value={category}
                                onChange={e => setCategory(e.target.value as any)}
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Knowledge Gain</label>
                            <select
                                className="w-full bg-secondary/50 border border-border/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none appearance-none"
                                value={status}
                                onChange={e => setStatus(e.target.value as any)}
                            >
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Resource Link (Optional)</label>
                        <input
                            className="w-full bg-secondary/50 border border-border/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/20"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Deep Description</label>
                        <textarea
                            className="w-full bg-secondary/50 border border-border/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none h-32 transition-all resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What are the key takeaways or goals for this resource?"
                        />
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button
                            onClick={() => setIsLiked(!isLiked)}
                            className={cn(
                                "p-4 rounded-2xl transition-all border shrink-0",
                                isLiked ? "bg-primary/10 border-primary/20 text-primary shadow-glow shadow-primary/10" : "bg-secondary/50 border-border/10 text-muted-foreground/40"
                            )}
                        >
                            <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
                        </button>
                        <div className="flex gap-4 flex-1">
                            <Button variant="outline" className="flex-1 rounded-2xl py-4" onClick={onClose}>Discard</Button>
                            <Button
                                variant="primary"
                                className="flex-1 rounded-2xl py-4"
                                disabled={!name}
                                onClick={handleSubmit}
                            >
                                {entry ? 'Apply Changes' : 'Store Knowledge'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
