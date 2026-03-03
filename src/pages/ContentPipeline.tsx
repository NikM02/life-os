import React, { useState, useMemo } from 'react';
import {
    Video as VideoIcon, Plus, Layout, List, Calendar, Search, Filter,
    Youtube, Instagram, Twitter, MessageSquare, ArrowRight,
    Clock, CheckCircle2, MoreVertical, Layers, Compass, Download
} from 'lucide-react';
import { PageHeader, StatCard, Button, CategoryBadge } from '@/components/shared';
import { useData } from '@/contexts/DataContext';
import { ContentItem, ContentStatus, ContentPipeline as PipelineData } from '@/types/lifeos';
import { cn } from '@/lib/utils';
import { exportContentDataToCSV } from '@/lib/export-utils';

const CHANNELS = ['Channel Alpha', 'Channel Beta', 'Channel Gamma'];
const STATUSES: ContentStatus[] = ['Brainstorming', 'Scripting', 'Production', 'Editing', 'Published'];

export default function ContentPipeline() {
    const { content, setContent } = useData();
    const [view, setView] = useState<'board' | 'list'>('board');
    const [searchQuery, setSearchQuery] = useState('');

    const stats = useMemo(() => {
        const total = content.items.length;
        const published = content.items.filter(i => i.status === 'Published').length;
        const inProduction = content.items.filter(i => i.status === 'Production' || i.status === 'Editing').length;
        return { total, published, inProduction };
    }, [content.items]);

    const filteredItems = useMemo(() => {
        return content.items.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.channel.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [content.items, searchQuery]);

    return (
        <div className="max-w-7xl mx-auto pb-32 px-4 animate-fade-in shadow-none">
            <PageHeader
                title="Content"
                description="The content manufacturing engine. Orchestrate narratives and optimize reach."
            >
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => exportContentDataToCSV(content)} className="opacity-40 hover:opacity-100">
                        <Download size={14} className="mr-2" /> Export
                    </Button>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter narrative..."
                            className="bg-secondary/20 border border-border/10 rounded-2xl pl-12 pr-6 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm" className="h-10 px-6 rounded-2xl">
                        <Plus size={16} className="mr-2" /> New Asset
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <StatCard label="Total Assets" value={stats.total} icon={<Layers />} />
                <StatCard label="Manufacturing" value={stats.inProduction} icon={<Compass className="text-primary" />} />
                <StatCard label="Deployed" value={stats.published} icon={<CheckCircle2 className="text-success" />} />
            </div>

            <div className="flex items-center justify-between mb-12">
                <div className="flex gap-4">
                    {['All Channels', ...CHANNELS].map(channel => (
                        <button key={channel} className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/30 hover:text-primary transition-all">
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

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
                {STATUSES.map(status => (
                    <div key={status} className="space-y-6">
                        <div className="flex items-center justify-between opacity-60 px-2">
                            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30">{status}</h3>
                            <span className="text-[10px] font-bold opacity-20">{filteredItems.filter(i => i.status === status).length}</span>
                        </div>
                        <div className="space-y-4">
                            {filteredItems.filter(i => i.status === status).map(item => (
                                <div key={item.id} className="p-6 rounded-3xl bg-secondary/20 border border-border/5 hover:border-primary/20 transition-all duration-500 group">
                                    <div className="space-y-4">
                                        <span className="text-[9px] font-semibold text-muted-foreground/30 uppercase tracking-widest">{item.channel}</span>
                                        <h4 className="text-sm font-semibold tracking-tight text-foreground/80 leading-relaxed group-hover:text-primary transition-colors">{item.title}</h4>
                                        <div className="flex items-center justify-between pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[9px] font-medium text-muted-foreground/30 italic">{item.publishDate || 'TBD'}</span>
                                            <MoreVertical size={14} className="text-muted-foreground/20" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full text-[9px] opacity-10 hover:opacity-100 border border-dashed border-border/10 rounded-3xl py-4 h-auto">
                                Manifest Asset
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
