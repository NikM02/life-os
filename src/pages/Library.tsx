import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Book, Video, Globe, FileText,
  Heart, ExternalLink, Trash2, CheckCircle2,
  PlayCircle, Layers, X, BookOpen
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';
import { KnowledgeEntry, KnowledgeCategory, KnowledgeStatus } from '@/types/lifeos';

const CATEGORIES: KnowledgeCategory[] = ['Books', 'Course', 'Article', 'Video', 'Others'];
const STATUSES: KnowledgeStatus[] = ['Not Started', 'Half Done', 'Completed'];

const CATEGORY_ICONS: Record<KnowledgeCategory, React.ReactNode> = {
  Books: <Book size={14} />,
  Course: <Layers size={14} />,
  Article: <FileText size={14} />,
  Video: <Video size={14} />,
  Others: <Globe size={14} />,
};

const STATUS_COLORS: Record<KnowledgeStatus, string> = {
  'Not Started': 'text-muted-foreground/30 bg-secondary/30',
  'Half Done': 'text-amber-600 bg-amber-50',
  'Completed': 'text-green-600 bg-green-50',
};

export default function Library() {
  const { library: entries, setLibrary: setEntries } = useData();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<Partial<KnowledgeEntry> | null>(null);

  const filtered = useMemo(() =>
    entries
      .filter(e => {
        const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = filterCat === 'All' || e.category === filterCat;
        const matchStatus = filterStatus === 'All' || e.status === filterStatus;
        return matchSearch && matchCat && matchStatus;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [entries, search, filterCat, filterStatus]
  );

  const counts = useMemo(() => ({
    total: entries.length,
    completed: entries.filter(e => e.status === 'Completed').length,
    inProgress: entries.filter(e => e.status === 'Half Done').length,
  }), [entries]);

  const openAdd = () => {
    setEditEntry({ category: 'Books', status: 'Not Started' });
    setShowForm(true);
  };

  const openEdit = (entry: KnowledgeEntry) => {
    setEditEntry({ ...entry });
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEntry?.name?.trim()) return;
    if (editEntry.id) {
      setEntries(entries.map(en => en.id === editEntry.id ? editEntry as KnowledgeEntry : en));
    } else {
      const newEntry: KnowledgeEntry = {
        id: crypto.randomUUID(),
        name: editEntry.name!,
        description: editEntry.description || '',
        category: editEntry.category || 'Others',
        status: editEntry.status || 'Not Started',
        link: editEntry.link || '',
        deadline: editEntry.deadline || '',
        isLiked: false,
        createdAt: new Date().toISOString(),
        linkedIds: [],
      };
      setEntries([...entries, newEntry]);
    }
    setShowForm(false);
    setEditEntry(null);
  };

  const toggleLike = (id: string) =>
    setEntries(entries.map(e => e.id === id ? { ...e, isLiked: !e.isLiked } : e));

  const cycleStatus = (id: string) => {
    setEntries(entries.map(e => {
      if (e.id !== id) return e;
      const idx = STATUSES.indexOf(e.status);
      return { ...e, status: STATUSES[(idx + 1) % STATUSES.length] };
    }));
  };

  const deleteEntry = (id: string) =>
    setEntries(entries.filter(e => e.id !== id));

  return (
    <div className="max-w-5xl mx-auto pb-32 px-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
          <p className="text-xs text-muted-foreground/50 mt-1">Track what you're learning</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-sm"
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total', value: counts.total, icon: <BookOpen size={14} /> },
          { label: 'In Progress', value: counts.inProgress, icon: <PlayCircle size={14} /> },
          { label: 'Completed', value: counts.completed, icon: <CheckCircle2 size={14} /> },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl bg-background border border-border/30 flex items-center gap-3">
            <span className="text-muted-foreground/40">{s.icon}</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{s.label}</p>
              <p className="text-lg font-bold tracking-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-secondary/20 border border-border/20 rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1 p-1 bg-secondary/20 rounded-xl border border-border/20">
          {['All', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
                filterCat === cat ? "bg-background shadow-sm text-primary" : "text-muted-foreground/40 hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 p-1 bg-secondary/20 rounded-xl border border-border/20">
          {['All', ...STATUSES].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap",
                filterStatus === s ? "bg-background shadow-sm text-primary" : "text-muted-foreground/40 hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Entry List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground/30">
          <BookOpen size={32} className="mx-auto mb-3 opacity-20" />
          <p className="text-xs font-medium">No entries found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(entry => (
            <div
              key={entry.id}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-border/20 bg-background hover:border-border/40 transition-all group"
            >
              {/* Category icon */}
              <span className="text-muted-foreground/30 flex-shrink-0">
                {CATEGORY_ICONS[entry.category]}
              </span>

              {/* Name & meta */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground/80 truncate">{entry.name}</p>
                {entry.description && (
                  <p className="text-[10px] text-muted-foreground/40 truncate mt-0.5">{entry.description}</p>
                )}
              </div>

              {/* Status badge — click to cycle */}
              <button
                onClick={() => cycleStatus(entry.id)}
                className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all whitespace-nowrap flex-shrink-0",
                  STATUS_COLORS[entry.status]
                )}
              >
                {entry.status}
              </button>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => toggleLike(entry.id)}
                  className={cn("p-1.5 rounded-lg transition-colors", entry.isLiked ? "text-red-400" : "text-muted-foreground/20 hover:text-red-400")}
                >
                  <Heart size={13} className={cn(entry.isLiked && "fill-current")} />
                </button>
                {entry.link && (
                  <a
                    href={entry.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-muted-foreground/20 hover:text-primary transition-colors"
                  >
                    <ExternalLink size={13} />
                  </a>
                )}
                <button
                  onClick={() => openEdit(entry)}
                  className="p-1.5 rounded-lg text-muted-foreground/20 hover:text-primary transition-colors text-[10px] font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="p-1.5 rounded-lg text-muted-foreground/20 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && editEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-background border border-border/30 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold">{editEntry.id ? 'Edit Entry' : 'Add to Library'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-secondary/60 transition-all">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <input
                autoFocus
                required
                type="text"
                placeholder="Title"
                value={editEntry.name || ''}
                onChange={e => setEditEntry(p => ({ ...p!, name: e.target.value }))}
                className="w-full bg-secondary/20 border border-border/20 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={editEntry.description || ''}
                onChange={e => setEditEntry(p => ({ ...p!, description: e.target.value }))}
                className="w-full bg-secondary/20 border border-border/20 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={editEntry.category || 'Books'}
                  onChange={e => setEditEntry(p => ({ ...p!, category: e.target.value as KnowledgeCategory }))}
                  className="w-full bg-secondary/20 border border-border/20 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={editEntry.status || 'Not Started'}
                  onChange={e => setEditEntry(p => ({ ...p!, status: e.target.value as KnowledgeStatus }))}
                  className="w-full bg-secondary/20 border border-border/20 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <input
                type="url"
                placeholder="Link (optional)"
                value={editEntry.link || ''}
                onChange={e => setEditEntry(p => ({ ...p!, link: e.target.value }))}
                className="w-full bg-secondary/20 border border-border/20 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-border/30 text-muted-foreground/60 hover:bg-secondary/40 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
