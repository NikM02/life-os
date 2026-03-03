import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { PageHeader, Button } from '@/components/shared';
import {
    Save, Trash2, Edit2, ChevronLeft, ChevronRight,
    Sparkles, Calendar, CheckCircle2, History, Download
} from 'lucide-react';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { exportReflectionsDataToCSV } from '@/lib/export-utils';

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
        <div className="max-w-4xl mx-auto pb-32 px-4 animate-fade-in shadow-none">
            <PageHeader title="Journals" description="Archive consciousness and synthesize cognitive patterns.">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => exportReflectionsDataToCSV(reflections)} className="opacity-40 hover:opacity-100">
                        <Download size={14} className="mr-2" /> Export
                    </Button>
                    <div className="flex items-center gap-4 bg-secondary/5 px-3 py-1.5 rounded-xl border border-border/10">
                        <button onClick={() => setCurrentDate(prev => subDays(prev, 1))} className="opacity-30 hover:opacity-100 transition-opacity"><ChevronLeft size={14} /></button>
                        <div className="flex flex-col items-center min-w-[120px]">
                            <span className="text-[10px] font-black uppercase tracking-tighter italic">{format(currentDate, 'MMMM d, yyyy')}</span>
                        </div>
                        <button onClick={() => setCurrentDate(prev => addDays(prev, 1))} disabled={isToday} className="disabled:opacity-5 opacity-30 hover:opacity-100 transition-opacity"><ChevronRight size={14} /></button>
                    </div>
                </div>
            </PageHeader>

            <div className="mt-20">
                {!isEditing && !activeReflection ? (
                    <div className="border border-dashed border-border/10 rounded-3xl py-32 text-center opacity-40 hover:opacity-100 transition-all duration-700">
                        <div className="space-y-8">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] italic">Temporal Void</h2>
                            <Button variant="outline" onClick={startEditing} className="h-10 px-8 rounded-xl border-border/10 text-[9px]">
                                INIT LOGGING
                            </Button>
                        </div>
                    </div>
                ) : isEditing ? (
                    <div className="space-y-12 animate-slide-up">
                        <div className="flex items-center justify-between opacity-30">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] italic">Active Uplink</h3>
                            <button onClick={() => setIsEditing(false)} className="text-[8px] font-black uppercase tracking-widest hover:text-foreground">Abort</button>
                        </div>

                        <Textarea
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            placeholder="Synthesize reality..."
                            className="min-h-[500px] bg-transparent border-none text-2xl font-black italic tracking-tight leading-relaxed resize-none focus-visible:ring-0 p-0 placeholder:text-muted-foreground/5 shadow-none"
                            autoFocus
                        />

                        <div className="pt-12 border-t border-border/5">
                            <Button variant="primary" className="w-full h-14 rounded-2xl" onClick={handleSave}>
                                <Save size={16} className="mr-3" /> Commit to Archive
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-16 animate-slide-up">
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-4 opacity-30">
                                <History size={14} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">Persisted entry</span>
                            </div>
                            <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={startEditing} className="text-muted-foreground/30 hover:text-foreground transition-all"><Edit2 size={12} /></button>
                                <button onClick={() => deleteReflection(activeReflection.id)} className="text-destructive/20 hover:text-destructive transition-all"><Trash2 size={12} /></button>
                            </div>
                        </div>

                        <div className="relative">
                            <p className="text-2xl font-black italic tracking-tight leading-relaxed opacity-80 whitespace-pre-wrap">
                                {activeReflection.text}
                            </p>
                        </div>

                        <div className="pt-12 border-t border-border/5 flex items-center justify-between opacity-30">
                            <div className="flex gap-8">
                                <div className="space-y-2">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Integrity</span>
                                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">High Fidelity</div>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Coordinates</span>
                                    <div className="text-[9px] font-black uppercase tracking-[0.2em]">{activeReflection.id.substring(0, 8)}</div>
                                </div>
                            </div>
                            <Sparkles size={14} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
