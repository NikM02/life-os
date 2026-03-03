import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { VisionData } from '@/types/lifeos';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader, Button } from '@/components/shared';
import { Target, Compass, Sparkles, Layout, Save, Heart, Briefcase, GraduationCap, Coins, Users, Zap, Smile } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/DataContext';

export default function Vision() {
  const { vision, setVision } = useData();

  const updateVision = (field: string, value: any) => {
    setVision({ ...vision, [field]: value });
  };

  const updateCore = (field: string, value: string) => {
    setVision({ ...vision, coreSections: { ...vision.coreSections, [field]: value } });
  };

  const addPrinciple = (p: string) => {
    if (!p.trim()) return;
    setVision({ ...vision, principles: [...vision.principles, p] });
  };

  return (
    <div className="max-w-4xl mx-auto pb-32 px-4 animate-fade-in">
      <PageHeader title="Directives" description="Define the core logic of your existence." />

      <Tabs defaultValue="philosophy" className="space-y-12">
        <TabsList className="bg-transparent p-0 h-auto border-b border-border/5 w-full justify-start gap-8 rounded-none pb-4">
          {['philosophy', 'horizon', 'domains'].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="bg-transparent border-none p-0 h-auto text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="philosophy" className="space-y-16 animate-slide-up outline-none">
          <div className="space-y-12">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 mb-8 flex items-center gap-3">
                <Compass size={12} /> Principles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vision.principles.map((p, i) => (
                  <div key={i} className="p-4 border border-border/10 rounded-xl bg-secondary/5 text-[11px] font-medium leading-relaxed uppercase tracking-wider">
                    {p}
                  </div>
                ))}
                <Input
                  className="bg-transparent border-dashed border-border/20 h-14 rounded-xl px-4 text-[10px] font-bold uppercase tracking-widest placeholder:text-muted-foreground/20 focus-visible:ring-0"
                  placeholder="Insert principle..."
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      addPrinciple(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="horizon" className="space-y-16 animate-slide-up outline-none">
          <div className="grid grid-cols-1 gap-12">
            {[
              { label: 'Long Range Vision (3Y)', value: vision.threeYearVision, field: 'threeYearVision' },
              { label: 'Immediate Directive (1Y)', value: vision.oneYearVision, field: 'oneYearVision' }
            ].map((v, i) => (
              <div key={i} className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 italic">{v.label}</h3>
                <Textarea
                  value={v.value}
                  onChange={e => updateVision(v.field, e.target.value)}
                  className="bg-transparent border-none text-xl md:text-2xl font-black tracking-tight leading-tight p-0 h-32 focus-visible:ring-0 placeholder:text-muted-foreground/10"
                  placeholder="Define trajectory..."
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="domains" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up outline-none">
          {[
            { id: 'health', icon: Heart, label: 'Biologicals' },
            { id: 'financial', icon: Coins, label: 'Capital' },
            { id: 'career', icon: Briefcase, label: 'Output' },
            { id: 'personalGrowth', icon: GraduationCap, label: 'Internal' },
            { id: 'socialImpact', icon: Users, label: 'External' },
            { id: 'joyExperience', icon: Smile, label: 'States' }
          ].map((domain) => (
            <div key={domain.id} className="space-y-4">
              <div className="flex items-center gap-3 opacity-20">
                <domain.icon size={14} />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">{domain.label}</span>
              </div>
              <Textarea
                className="bg-secondary/5 border-border/10 rounded-2xl p-4 text-[10px] uppercase font-bold tracking-widest leading-relaxed h-32 focus-visible:ring-0 placeholder:text-muted-foreground/10"
                placeholder="Declare..."
                value={(vision.coreSections as any)[domain.id]}
                onChange={e => updateCore(domain.id, e.target.value)}
              />
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
