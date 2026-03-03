import React, { useState, useMemo } from 'react';
import {
    BrainCircuit, Calendar, ChevronLeft, ChevronRight,
    Star, Smile, Edit2, Save, Trash2, Clock, Search,
    Filter, Send, BookOpen
} from 'lucide-react';
import { PageHeader, StatCard, Button } from '@/components/shared';
import { useData } from '@/contexts/DataContext';
import { format, subDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { DailyReflection } from '@/types/lifeos';

export default function DailyReflections() {
    const { reflections, setReflections } = useData();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [entry, setEntry] = useState('');
    const [mood, setMood] = useState(5);

    const todayEntry = useMemo(() => {
        return reflections.find(r => isSameDay(new Date(r.date), selectedDate));
    }, [reflections, selectedDate]);

    const stats = useMemo(() => {
        const total = reflections.length;
        const avgMood = total > 0 ? (reflections.reduce((sum, r) => sum + r.mood, 0) / total).toFixed(1) : 0;
        const currentStreak = 0; // Simplified for now
        return { total, avgMood, currentStreak };
    }, [reflections]);

    const handleSave = () => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const existingIndex = reflections.findIndex(r => r.date === dateStr);

        const newReflection = {
            id: todayEntry?.id || Math.random().toString(36).substr(2, 9),
            date: dateStr,
            content: entry,
            mood,
            createdAt: todayEntry?.createdAt || new Date().toISOString()
        };

        if (existingIndex >= 0) {
            setReflections(reflections.map((r, i) => i === existingIndex ? newReflection : r));
        } else {
            setReflections([newReflection, ...reflections]);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-32 px-4 animate-fade-in shadow-none">
            <PageHeader
                title="Journals"
                description="The neural observatory. Synthesize consciousness and deconstruct temporal experience."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <StatCard label="Life Logs" value={stats.total} icon={<BookOpen />} />
                <StatCard label="Clarity Index" value={stats.avgMood} icon={<Smile />} />
                <StatCard label="Rhythm Streak" value={`${stats.currentStreak}d`} icon={<BrainCircuit />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-8 space-y-12">
                    <div className="p-10 rounded-3xl bg-secondary/10 border border-border/5 space-y-10 group">
                        <div className="flex items-center justify-between border-b border-border/10 pb-8 transition-colors group-hover:border-primary/20">
                            <div className="space-y-1">
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30">Temporal Key</span>
                                <h3 className="text-xl font-semibold tracking-tight">{format(selectedDate, 'MMMM d, yyyy')}</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2.5 rounded-xl border border-border/40 hover:border-primary/40 hover:text-primary transition-all"><ChevronLeft size={16} /></button>
                                <button onClick={() => setSelectedDate(new Date())} className="text-[10px] font-semibold uppercase tracking-widest px-4 py-2 border border-border/40 rounded-xl hover:border-primary/40 hover:text-primary transition-all">Present</button>
                                <button onClick={() => setSelectedDate(subDays(selectedDate, -1))} className="p-2.5 rounded-xl border border-border/40 hover:border-primary/40 hover:text-primary transition-all"><ChevronRight size={16} /></button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30 ml-1">Synthesis</label>
                            <textarea
                                className="w-full bg-transparent border-none text-lg font-semibold tracking-tight text-foreground/80 leading-relaxed focus:outline-none min-h-[300px] resize-none placeholder:text-muted-foreground/10"
                                placeholder="Architect your thoughts... What was salvaged? What was deconstructed?"
                                value={entry || todayEntry?.content || ''}
                                onChange={(e) => setEntry(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between pt-10 border-t border-border/10">
                            <div className="flex items-center gap-8">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30">Mood Balance</span>
                                    <div className="flex items-center gap-3">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(m => (
                                            <button
                                                key={m}
                                                onClick={() => setMood(m)}
                                                className={cn(
                                                    "w-6 h-6 rounded-full text-[9px] font-bold transition-all",
                                                    (mood === m || todayEntry?.mood === m) ? "bg-primary text-primary-foreground scale-110" : "bg-secondary text-muted-foreground/40 hover:bg-primary/20 hover:text-primary"
                                                )}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <Button onClick={handleSave} className="px-8 rounded-2xl group">
                                <Save size={14} className="mr-3 transition-transform group-hover:scale-110" /> Sync Fragment
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-12">
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold tracking-tight opacity-40">Archive</h3>
                        <div className="space-y-6">
                            {reflections.slice(0, 5).map(r => (
                                <div key={r.id} className="group cursor-pointer space-y-2" onClick={() => setSelectedDate(new Date(r.date))}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-semibold text-muted-foreground/30 uppercase tracking-widest">{format(new Date(r.date), 'MMM d')}</span>
                                        <span className="text-[10px] font-bold text-primary group-hover:underline transition-all opacity-40 group-hover:opacity-100">Review</span>
                                    </div>
                                    <p className="text-xs font-medium text-foreground/60 leading-relaxed line-clamp-2 italic">
                                        {r.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full text-[10px] opacity-30 hover:opacity-100 italic">Access Full Archive</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
