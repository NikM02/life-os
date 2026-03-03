import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { DailyReflection } from '@/types/lifeos';
import { PageHeader, Button } from '@/components/shared';
import {
    MessageSquare, Plus, Save, Trash2,
    Edit2, ChevronLeft, ChevronRight,
    Sparkles, Calendar, BookOpen, CheckCircle2,
    Brain, Zap, History, Target
} from 'lucide-react';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { exportReflectionsDataToCSV } from '@/lib/export-utils';
import { Download } from 'lucide-react';

export default function DailyReflectionsPage() {
    const { reflections, setReflections } = useData();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState('');

    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const activeReflection = reflections.find(r => r.date === dateStr);
    const isToday = isSameDay(currentDate, new Date());

    const handleSave = () => {
        const id = activeReflection?.id || crypto.randomUUID();
        const newReflection = { id, date: dateStr, text: draft };

        if (activeReflection) {
            setReflections(reflections.map(r => r.id === id ? newReflection : r));
        } else {
            setReflections([...reflections, newReflection]);
        }
        setIsEditing(false);
    };

    const startEditing = () => {
        setDraft(activeReflection?.text || '');
        setIsEditing(true);
    };

    const deleteReflection = (id: string) => {
        setReflections(reflections.filter(r => r.id !== id));
        setIsEditing(false);
    };

    return (
        <div className="max-w-4xl mx-auto pb-32 px-4 animate-fade-in">
            <PageHeader
                title="Neural Journals"
                description="Synthesize your consciousness. Capture high-fidelity insights and evolve the protocol."
            >
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportReflectionsDataToCSV(reflections)}
                        className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-xl px-4 h-10 transition-all text-[9px] font-extrabold uppercase tracking-widest text-primary"
                    >
                        <Download className="h-4 w-4" />
                        Export Data
                    </Button>
                    <div className="flex items-center gap-4 bg-secondary/30 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
                        <Button variant="ghost" size="icon" onClick={() => setCurrentDate(prev => subDays(prev, 1))} className="h-9 w-9 rounded-xl hover:bg-white/10 transition-all">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex flex-col items-center min-w-[140px]">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{isToday ? 'Live Sync' : 'Archive Data'}</span>
                                {activeReflection && <CheckCircle2 className="h-3 w-3 text-primary" />}
                            </div>
                            <span className="text-sm font-black tracking-tighter">{format(currentDate, 'MMMM d, yyyy')}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setCurrentDate(prev => addDays(prev, 1))} className="h-9 w-9 rounded-xl hover:bg-white/10 transition-all" disabled={isToday}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </PageHeader>

            <div className="mt-16 space-y-8">
                {!isEditing && !activeReflection ? (
                    <div className="glass-card p-24 rounded-[3rem] text-center border-dashed border-white/5 opacity-40 hover:opacity-100 transition-all duration-700 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-50 group-hover:scale-100 transition-transform duration-1000" />
                        <div className="relative z-10">
                            <Brain className="h-16 w-16 text-primary/20 mx-auto mb-8 group-hover:scale-110 group-hover:text-primary/40 transition-all duration-700" />
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Neural Void Detected</h2>
                            <p className="text-sm text-muted-foreground mb-10 max-w-xs mx-auto font-medium leading-relaxed">No data captured for this temporal coordinate. Initialize high-fidelity reflection protocol.</p>
                            <Button variant="primary" onClick={startEditing} className="rounded-2xl px-12 h-16 text-sm font-black uppercase tracking-widest shadow-glow shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                <Plus className="h-5 w-5 mr-3" /> Initiate Logging
                            </Button>
                        </div>
                    </div>
                ) : isEditing ? (
                    <div className="glass-card p-10 sm:p-14 rounded-[3rem] border-primary/20 bg-primary/[0.02] shadow-2xl animate-scale-in relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none transform scale-150 rotate-12">
                            <Zap className="h-32 w-32 text-primary" />
                        </div>

                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-4 rounded-2xl bg-primary/10 text-primary shadow-glow shadow-primary/10">
                                    <Sparkles className="h-6 w-6 animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">Active Intelligence Stream</h3>
                                    <p className="text-[10px] uppercase font-bold text-primary/40 tracking-widest">Protocol Version 4.0</p>
                                </div>
                            </div>
                            <Button variant="ghost" className="rounded-xl px-6 h-10 border border-white/5 hover:bg-white/5 font-bold text-[10px] uppercase tracking-widest" onClick={() => setIsEditing(false)}>
                                Cancel
                            </Button>
                        </div>

                        <Textarea
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            placeholder="Synthesize insights. What did you learn? What patterns did you observe? What is the core objective for the next cycle?..."
                            className="min-h-[450px] bg-transparent border-none text-2xl font-medium leading-relaxed resize-none focus-visible:ring-0 p-0 placeholder:text-muted-foreground/10 text-foreground/90 selection:bg-primary/20"
                            autoFocus
                        />

                        <div className="mt-12 pt-12 border-t border-white/5 flex flex-col sm:flex-row gap-4 relative z-10">
                            <Button variant="primary" className="flex-1 h-16 rounded-[1.5rem] font-black uppercase tracking-widest shadow-glow shadow-primary/20 hover:scale-[1.02] transition-all" onClick={handleSave}>
                                <Save className="h-5 w-5 mr-3" /> Persist Neural Entry
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="glass-card p-10 sm:p-16 rounded-[3rem] border-white/5 hover:border-primary/20 transition-all duration-700 relative overflow-hidden group shadow-2xl">
                        {/* Status indicators */}
                        <div className="absolute top-8 right-8 flex items-center gap-3 relative z-20">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Captured</span>
                            </div>
                        </div>

                        <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none transform scale-150 rotate-12 group-hover:opacity-[0.06] group-hover:scale-[1.7] transition-all duration-1000">
                            <MessageSquare className="h-48 w-48" />
                        </div>

                        <div className="flex items-center justify-between mb-12 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-4 rounded-2xl bg-secondary/40 text-muted-foreground/40 transition-transform duration-500 group-hover:scale-110">
                                    <History className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/40">Persistence Log</h3>
                                    <p className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-widest">Entry ID: {activeReflection.id.substring(0, 8)}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                <Button variant="ghost" size="icon" onClick={startEditing} className="h-11 w-11 rounded-2xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground">
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => deleteReflection(activeReflection.id)} className="h-11 w-11 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive/20">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <p className="text-2xl font-medium leading-relaxed text-foreground/80 whitespace-pre-wrap italic">
                                {activeReflection.text}
                            </p>
                        </div>

                        <div className="mt-16 pt-10 border-t border-white/5 flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest mb-1">Complexity</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className={cn("h-1 w-4 rounded-full", i <= 3 ? "bg-primary/40" : "bg-white/5")} />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest mb-1">Integrity</span>
                                    <span className="text-[10px] font-black text-primary/60 uppercase">High Fidelity</span>
                                </div>
                            </div>
                            <Sparkles className="h-5 w-5 text-primary/20" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
