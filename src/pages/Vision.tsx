import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { PageHeader, Button } from '@/components/shared';
import { cn } from '@/lib/utils';
import { Target, Compass, Sparkles, Anchor, Edit2, Trash2, Plus, Download, Save, X } from 'lucide-react';
import { VisionPillar, VisionObjective } from '@/types/lifeos';
import { exportVisionDataToCSV } from '@/lib/export-utils';

export default function Vision() {
  const { vision, setVision } = useData();
  const [editingPillar, setEditingPillar] = useState<VisionPillar | null>(null);
  const [editingObjective, setEditingObjective] = useState<VisionObjective | null>(null);
  const [isEditingVisions, setIsEditingVisions] = useState(false);
  const [isEditingAreas, setIsEditingAreas] = useState(false);

  // Pillar CRUD
  const savePillar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPillar) return;
    const newPillars = vision.pillars.map(p => p.id === editingPillar.id ? editingPillar : p);
    setVision({ ...vision, pillars: newPillars });
    setEditingPillar(null);
  };

  // Objective CRUD
  const saveObjective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingObjective) return;
    const newObjectives = vision.objectives.map(o => o.id === editingObjective.id ? editingObjective : o);
    setVision({ ...vision, objectives: newObjectives });
    setEditingObjective(null);
  };

  // Areas CRUD
  const saveAreas = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    setVision({
      ...vision,
      areas: {
        health: formData.get('health') as string,
        career: formData.get('career') as string,
        family: formData.get('family') as string,
        personal: formData.get('personal') as string,
        finance: formData.get('finance') as string,
        relationship: formData.get('relationship') as string,
      }
    });
    setIsEditingAreas(false);
  };

  // Text Vision CRUD
  const saveTextVisions = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    setVision({
      ...vision,
      threeYearVision: formData.get('threeYearVision') as string,
      oneYearVision: formData.get('oneYearVision') as string,
    });
    setIsEditingVisions(false);
  };

  return (
    <div className="max-w-6xl mx-auto pb-32 px-4 animate-fade-in shadow-none">
      <PageHeader
        title="Vision"
        description="The architectural blueprint of your future self. Orchestrate your reality with precision."
      >
        <Button variant="ghost" size="sm" onClick={() => exportVisionDataToCSV(vision)} className="opacity-40 hover:opacity-100">
          <Download size={14} className="mr-2" /> Export CSV
        </Button>
      </PageHeader>

      <div className="mt-24 space-y-32">
        {/* Core Pillars Section */}
        <section className="space-y-12">
          <div className="flex items-center gap-4 text-primary/20">
            <Compass size={24} strokeWidth={1} />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground/80">3 Core Pillars</h2>
            <div className="h-px flex-1 bg-border/40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {vision.pillars.map((pillar) => (
              <div key={pillar.id} className="p-8 rounded-3xl bg-secondary/10 border border-border/5 hover:border-primary/20 transition-all duration-500 group relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => setEditingPillar(pillar)} className="p-2 hover:bg-background rounded-xl text-muted-foreground/20 hover:text-primary transition-all">
                    <Edit2 size={14} />
                  </button>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground/80">{pillar.title}</h3>
                  <p className="text-xs text-muted-foreground/40 leading-relaxed italic line-clamp-4">
                    {pillar.description || 'Define this core pillar of your existence...'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Vision Statements Section */}
        <section className="space-y-12">
          <div className="flex items-center gap-4 text-primary/20">
            <Sparkles size={24} strokeWidth={1} />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground/80">Temporal Horizons</h2>
            <div className="h-px flex-1 bg-border/40" />
            <Button variant="ghost" size="sm" onClick={() => setIsEditingVisions(!isEditingVisions)} className="opacity-40 hover:opacity-100">
              {isEditingVisions ? <X size={14} /> : <Edit2 size={14} />}
            </Button>
          </div>
          {isEditingVisions ? (
            <form onSubmit={saveTextVisions} className="space-y-8">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-4">3-Year Vision</label>
                  <textarea name="threeYearVision" defaultValue={vision.threeYearVision} className="w-full bg-secondary/10 border border-border/5 rounded-3xl p-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 min-h-[120px]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-4">1-Year Sub-Vision</label>
                  <textarea name="oneYearVision" defaultValue={vision.oneYearVision} className="w-full bg-secondary/10 border border-border/5 rounded-3xl p-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 min-h-[120px]" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" className="rounded-2xl px-8 h-12">
                  <Save size={16} className="mr-2" /> Sync Horizons
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="p-10 rounded-3xl bg-secondary/20 border border-border/10 group hover:border-primary/20 transition-all">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/30 block mb-6">3-Year Trajectory</span>
                <p className="text-xl font-medium text-foreground/80 leading-relaxed italic">
                  "{vision.threeYearVision || "Where do you see your reality in 1000 days?"}"
                </p>
              </div>
              <div className="p-10 rounded-3xl bg-secondary/20 border border-border/10 group hover:border-primary/20 transition-all">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/30 block mb-6">1-Year Azimuth</span>
                <p className="text-xl font-medium text-foreground/80 leading-relaxed italic">
                  "{vision.oneYearVision || "What is the primary focus for the next 365 days?"}"
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Core Objectives Section */}
        <section className="space-y-12">
          <div className="flex items-center gap-4 text-primary/20">
            <Target size={24} strokeWidth={1} />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground/80">5 Core Objectives</h2>
            <div className="h-px flex-1 bg-border/40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {vision.objectives.map((obj) => (
              <div key={obj.id} className="p-6 rounded-3xl bg-secondary/5 border border-border/10 hover:border-primary/20 transition-all group relative">
                <button onClick={() => setEditingObjective(obj)} className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 text-muted-foreground/30 hover:text-primary transition-all">
                  <Edit2 size={12} />
                </button>
                <div className="space-y-2 text-center">
                  <span className="text-[9px] font-bold text-primary/20 uppercase tracking-tighter">OBJ {obj.id}</span>
                  <h4 className="text-xs font-semibold tracking-tight text-foreground/60">{obj.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6 Core Areas Section */}
        <section className="space-y-12">
          <div className="flex items-center gap-4 text-primary/20">
            <Anchor size={24} strokeWidth={1} />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground/80">6 Operational Domains</h2>
            <div className="h-px flex-1 bg-border/40" />
            <Button variant="ghost" size="sm" onClick={() => setIsEditingAreas(!isEditingAreas)} className="opacity-40 hover:opacity-100">
              {isEditingAreas ? <X size={14} /> : <Edit2 size={14} />}
            </Button>
          </div>
          {isEditingAreas ? (
            <form onSubmit={saveAreas} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(vision.areas).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-4">{key}</label>
                  <input name={key} defaultValue={value} className="w-full bg-secondary/10 border border-border/5 rounded-2xl px-6 py-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20" placeholder={`Vision for ${key}...`} />
                </div>
              ))}
              <div className="md:col-span-3 flex justify-end mt-4">
                <Button type="submit" size="sm" className="rounded-2xl px-8 h-12">
                  <Save size={16} className="mr-2" /> Domain Sync
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
              {Object.entries(vision.areas).map(([key, value]) => (
                <div key={key} className="space-y-4 group">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40 group-hover:text-foreground/80 transition-colors">{key}</h3>
                  </div>
                  <p className="text-sm text-foreground/60 leading-relaxed italic pl-4 border-l border-border/5 group-hover:border-primary/20 transition-all">
                    {value || `Establish operational intent for ${key}...`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Edit Pillar Modal */}
      {editingPillar && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-background border border-border/10 rounded-[40px] p-10 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold tracking-tight">Modify Core Pillar</h3>
              <button onClick={() => setEditingPillar(null)} className="p-2 hover:bg-secondary/10 rounded-full transition-all text-muted-foreground/30"><X size={20} /></button>
            </div>
            <form onSubmit={savePillar} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-4">Title</label>
                <input value={editingPillar.title} onChange={e => setEditingPillar({ ...editingPillar, title: e.target.value })} className="w-full bg-secondary/10 border border-border/5 rounded-2xl px-6 py-4 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-4">Description</label>
                <textarea value={editingPillar.description} onChange={e => setEditingPillar({ ...editingPillar, description: e.target.value })} className="w-full bg-secondary/10 border border-border/5 rounded-3xl p-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 min-h-[150px]" />
              </div>
              <Button type="submit" className="w-full rounded-2xl py-6 h-auto text-sm font-semibold group">
                <Save className="mr-2 group-hover:scale-110 transition-transform" size={18} /> Update Pillar
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Objective Modal */}
      {editingObjective && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-background border border-border/10 rounded-[40px] p-10 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold tracking-tight">Modify Objective</h3>
              <button onClick={() => setEditingObjective(null)} className="p-2 hover:bg-secondary/10 rounded-full transition-all text-muted-foreground/30"><X size={20} /></button>
            </div>
            <form onSubmit={saveObjective} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 ml-4">Objective Title</label>
                <input value={editingObjective.title} onChange={e => setEditingObjective({ ...editingObjective, title: e.target.value })} className="w-full bg-secondary/10 border border-border/5 rounded-2xl px-6 py-4 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20" />
              </div>
              <Button type="submit" className="w-full rounded-2xl py-6 h-auto text-sm font-semibold group">
                <Save className="mr-2 group-hover:scale-110 transition-transform" size={18} /> Sync Objective
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
