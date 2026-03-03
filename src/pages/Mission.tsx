import React from 'react';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/contexts/DataContext';
import { Save, Edit2, Download, Rocket } from 'lucide-react';
import { exportVisionDataToCSV } from '@/lib/export-utils';

export default function Mission() {
    const { vision, setVision } = useData();
    const [editing, setEditing] = React.useState(false);
    const [draft, setDraft] = React.useState(vision.oneYearVision || '');

    const handleSave = () => {
        setVision({ ...vision, oneYearVision: draft });
        setEditing(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 px-4 py-8">
            <PageHeader
                title="N-OS Mission"
                description="Your core purpose and driving mission for the year."
            >
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportVisionDataToCSV(vision)}
                    className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-xl px-4 h-10 transition-all text-[9px] font-extrabold uppercase tracking-widest text-primary"
                >
                    <Download className="h-4 w-4" />
                    Export Mission
                </Button>
            </PageHeader>

            <div className="glass-card p-8 rounded-3xl border-primary/10 relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            <Rocket className="h-5 w-5" />
                        </div>
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Core Mission statement</h2>
                    </div>

                    {editing ? (
                        <Button onClick={handleSave} size="sm" className="rounded-xl px-6">
                            <Save className="h-4 w-4 mr-2" /> Save Mission
                        </Button>
                    ) : (
                        <Button onClick={() => setEditing(true)} variant="ghost" size="sm" className="rounded-xl opacity-60 hover:opacity-100 px-6">
                            <Edit2 className="h-4 w-4 mr-2" /> Edit Mission
                        </Button>
                    )}
                </div>

                {editing ? (
                    <Textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="What is your mission?"
                        className="min-h-[200px] text-lg font-medium leading-relaxed bg-black/5 border-primary/10 rounded-2xl p-6 focus-visible:ring-primary/20"
                        autoFocus
                    />
                ) : (
                    <div className="min-h-[100px] flex items-center">
                        <p className="text-xl font-medium leading-relaxed text-foreground/90 italic">
                            {vision.oneYearVision || "No mission defined yet. Define your purpose to guide your actions."}
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-60">
                <div className="glass-card p-6 border-dashed border-primary/10 rounded-2xl">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">Why it matters</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">Your mission provides clarity in moments of chaos and a filter for all major decisions.</p>
                </div>
                <div className="glass-card p-6 border-dashed border-primary/10 rounded-2xl">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">Next evolution</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">Update this seasonally to reflect your growth and changing priorities.</p>
                </div>
            </div>
        </div>
    );
}
