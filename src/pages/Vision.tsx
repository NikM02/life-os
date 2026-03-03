import React from 'react';
import { useData } from '@/contexts/DataContext';
import { PageHeader } from '@/components/shared';
import { cn } from '@/lib/utils';
import { Target, Compass, Sparkles, Anchor } from 'lucide-react';

export default function Vision() {
  const { vision } = useData();

  const sections = [
    {
      id: 'directives',
      title: 'Current Directive',
      content: vision?.oneYearVision || "Design your existence. Define your trajectory.",
      icon: Compass,
      description: 'The primary azimuth for the current temporal cycle.'
    },
    {
      id: 'intentions',
      title: 'Core Intentions',
      content: vision?.fiveYearVision || "Establishing a legacy of conscious orchestration and biological optimization.",
      icon: Target,
      description: 'Long-horizon strategic alignment.'
    },
    {
      id: 'principles',
      title: 'Fundamental Principles',
      content: vision?.lifePurpose || "To synthesize reality through the lens of clarity, discipline, and aesthetic excellence.",
      icon: Sparkles,
      description: 'The bedrock of all operational decisions.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-32 px-4 animate-fade-in shadow-none">
      <PageHeader
        title="Vision"
        description="The architectural blueprint of your future self. Orchestrate your reality with precision."
      />

      <div className="mt-24 space-y-40">
        {sections.map((section, index) => (
          <section key={section.id} className={cn(
            "flex flex-col md:flex-row gap-12 items-start",
            index % 2 === 1 ? "md:flex-row-reverse" : ""
          )}>
            <div className="w-full md:w-1/3 space-y-4 pt-4">
              <div className="flex items-center gap-4 text-primary/20">
                <section.icon size={24} strokeWidth={1} />
                <div className="h-px flex-1 bg-border/40" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground/80">{section.title}</h2>
              <p className="text-sm font-medium text-muted-foreground/40 leading-relaxed italic">
                {section.description}
              </p>
            </div>

            <div className="w-full md:w-2/3 p-12 rounded-3xl bg-secondary/20 border border-border/10 group hover:border-primary/20 transition-all duration-700">
              <div className="relative">
                <span className="absolute -top-6 -left-6 text-6xl text-primary/5 font-serif select-none pointer-events-none">"</span>
                <p className="text-3xl font-semibold tracking-tight text-foreground leading-relaxed group-hover:text-primary transition-colors">
                  {section.content}
                </p>
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-40 pt-20 border-t border-border/10 text-center space-y-6">
        <div className="inline-flex items-center gap-4 text-primary/10">
          <Anchor size={32} strokeWidth={0.5} />
        </div>
        <p className="text-xl font-medium text-muted-foreground/30 italic max-w-2xl mx-auto">
          "Existence is not a set of circumstances, but a series of choices aligned with a singular vision."
        </p>
      </div>
    </div>
  );
}
