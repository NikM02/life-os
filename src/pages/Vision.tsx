import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { VisionData } from '@/types/lifeos';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Save, Edit2, Download, Shield, Zap, Target, Star, Heart,
  Users, Briefcase, Wallet, Sprout, Compass, Globe, Sparkles,
  Command, Cpu, Network, Workflow, Microscope
} from 'lucide-react';
import { exportVisionDataToCSV } from '@/lib/export-utils';
import { cn } from '@/lib/utils';

const defaultVision: VisionData = {
  principles: ['', '', ''],
  threeYearVision: '',
  oneYearVision: '',
  quarterlyGoals: { q1: '', q2: '', q3: '', q4: '' },
  coreSections: {
    health: '',
    family: '',
    career: '',
    financial: '',
    personalGrowth: '',
    spirituality: '',
    socialImpact: '',
    joyExperience: '',
  },
};

const Section = ({ title, icon: Icon, path, value, placeholder, isFullWidth = false, themeColor = "primary", editing, startEdit, save, draft, setDraft }: any) => (
  <div className={cn(
    "relative group glass-card p-6 border-white/5 hover:border-primary/20 transition-all duration-500 overflow-hidden rounded-3xl",
    isFullWidth ? "md:col-span-2" : ""
  )}>
    <div className="flex items-center justify-between mb-6 relative z-10">
      <div className="flex items-center gap-4">
        <div className={cn(
          "p-2.5 rounded-xl transition-all duration-300",
          themeColor === "primary" ? "bg-primary/10 text-primary" : "bg-secondary/40 text-muted-foreground/40"
        )}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{title}</h3>
      </div>

      {editing === path ? (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => save(path)}
          className="h-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-4 transition-all"
        >
          <Save className="h-3.5 w-3.5 mr-2" /> Save
        </Button>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => startEdit(path, value)}
          className="h-8 rounded-xl opacity-0 group-hover:opacity-100 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all px-4"
        >
          <Edit2 className="h-3.5 w-3.5 mr-2" /> Edit
        </Button>
      )}
    </div>

    <div className="relative z-10">
      {editing === path ? (
        <Textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={placeholder}
          className="min-h-[120px] bg-black/20 border-white/10 text-sm font-medium leading-relaxed resize-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40 p-4 transition-all"
          autoFocus
        />
      ) : (
        <div className="min-h-[40px] flex items-center">
          <p className={cn(
            "text-sm font-medium leading-relaxed whitespace-pre-wrap",
            value ? "text-foreground/90" : "italic text-muted-foreground/30 font-normal"
          )}>
            {value || placeholder}
          </p>
        </div>
      )}
    </div>
  </div>
);

export default function Vision() {
  const { vision: storedVision, setVision } = useData();

  const vision = {
    ...defaultVision,
    ...storedVision,
    principles: Array.isArray(storedVision?.principles) && storedVision.principles.length >= 3
      ? storedVision.principles
      : defaultVision.principles,
    quarterlyGoals: { ...defaultVision.quarterlyGoals, ...storedVision?.quarterlyGoals },
    coreSections: { ...defaultVision.coreSections, ...storedVision?.coreSections },
  };

  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const startEdit = (key: string, currentValue: string) => {
    setEditing(key);
    setDraft(currentValue);
  };

  const save = (path: string) => {
    const newVision = { ...vision };
    if (path.startsWith('principles.')) {
      const index = parseInt(path.split('.')[1]);
      newVision.principles[index] = draft;
    } else if (path.startsWith('quarterlyGoals.')) {
      const key = path.split('.')[1] as keyof VisionData['quarterlyGoals'];
      newVision.quarterlyGoals[key] = draft;
    } else if (path.startsWith('coreSections.')) {
      const key = path.split('.')[1] as keyof VisionData['coreSections'];
      newVision.coreSections[key] = draft;
    } else {
      (newVision as any)[path] = draft;
    }
    setVision(newVision);
    setEditing(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-32 px-4 animate-fade-in">
      <PageHeader
        title="N-OS Strategic Vision"
        description="Core guidance and future roadmap."
      >
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportVisionDataToCSV(vision)}
            className="flex items-center gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-xl px-4 h-10 transition-all text-[9px] font-extrabold uppercase tracking-widest text-primary z-50 pointer-events-auto"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="inline">Export Vision</span>
          </Button>
        </div>
      </PageHeader>

      <section className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Guiding Principles</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {vision.principles.map((p, i) => (
            <Section
              key={`principle-${i}`}
              title={`Principle ${i + 1}`}
              icon={[Shield, Zap, Target][i]}
              path={`principles.${i}`}
              value={p}
              placeholder="Enter a guiding principle..."
              themeColor="primary"
              editing={editing}
              startEdit={startEdit}
              save={save}
              draft={draft}
              setDraft={setDraft}
            />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Vision & Timeline</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Section
            title="3-Year Vision"
            icon={Microscope}
            path="threeYearVision"
            value={vision.threeYearVision}
            placeholder="Where will you be in 3 years?"
            isFullWidth
            editing={editing}
            startEdit={startEdit}
            save={save}
            draft={draft}
            setDraft={setDraft}
          />
          <Section
            title="1-Year Vision"
            icon={Workflow}
            path="oneYearVision"
            value={vision.oneYearVision}
            placeholder="Vision for the next 12 months..."
            isFullWidth
            editing={editing}
            startEdit={startEdit}
            save={save}
            draft={draft}
            setDraft={setDraft}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:col-span-2">
            <Section title="Q1: Jan - Mar" icon={Zap} path="quarterlyGoals.q1" value={vision.quarterlyGoals.q1} placeholder="System focus for Q1..." editing={editing} startEdit={startEdit} save={save} draft={draft} setDraft={setDraft} />
            <Section title="Q2: Apr - Jun" icon={Zap} path="quarterlyGoals.q2" value={vision.quarterlyGoals.q2} placeholder="System focus for Q2..." editing={editing} startEdit={startEdit} save={save} draft={draft} setDraft={setDraft} />
            <Section title="Q3: Jul - Sep" icon={Zap} path="quarterlyGoals.q3" value={vision.quarterlyGoals.q3} placeholder="System focus for Q3..." editing={editing} startEdit={startEdit} save={save} draft={draft} setDraft={setDraft} />
            <Section title="Q4: Oct - Dec" icon={Zap} path="quarterlyGoals.q4" value={vision.quarterlyGoals.q4} placeholder="System focus for Q4..." editing={editing} startEdit={startEdit} save={save} draft={draft} setDraft={setDraft} />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Life Areas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Section title="Health" icon={Heart} path="coreSections.health" value={vision.coreSections.health} placeholder="Physical vitality..." editing={editing} startEdit={startEdit} save={save} draft={draft} setDraft={setDraft} />
          <Section title="Family" icon={Users} path="coreSections.family" value={vision.coreSections.family} placeholder="Connections..." editing={editing} startEdit={startEdit} save={save} draft={draft} setDraft={setDraft} />
          <Section title="Career" icon={Briefcase} path="coreSections.career" value={vision.coreSections.career} placeholder="Impact..." editing={editing} startEdit={startEdit} save={save} draft={draft} setDraft={setDraft} />
          <Section title="Financial" icon={Wallet} path="coreSections.financial" value={vision.coreSections.financial} placeholder="Abundance..." editing={editing} startEdit={startEdit} save={save} draft={draft} setDraft={setDraft} />
          <Section title="Personal" icon={Sprout} path="coreSections.personalGrowth" value={vision.coreSections.personalGrowth} placeholder="Evolution..." editing={editing} startEdit={startEdit} save={save} draft={draft} setDraft={setDraft} />
          <Section title="Spirit" icon={Globe} path="coreSections.spirituality" value={vision.coreSections.spirituality} placeholder="Purpose..." editing={editing} startEdit={startEdit} save={save} draft={draft} setDraft={setDraft} />
          <Section title="Social" icon={Users} path="coreSections.socialImpact" value={vision.coreSections.socialImpact} placeholder="Contribution..." editing={editing} startEdit={startEdit} save={save} draft={draft} setDraft={setDraft} />
          <Section title="Joy" icon={Sparkles} path="coreSections.joyExperience" value={vision.coreSections.joyExperience} placeholder="Adventure..." editing={editing} startEdit={startEdit} save={save} draft={draft} setDraft={setDraft} />
        </div>
      </section>
    </div>
  );
}
