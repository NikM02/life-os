import React, { ReactNode, ButtonHTMLAttributes, cloneElement, ReactElement } from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 animate-fade-in pt-4">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm font-medium text-muted-foreground mt-2 max-w-2xl leading-relaxed">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export function Button({
  className, variant = 'primary', size = 'md', children, ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-primary-foreground shadow-md hover:shadow-glow-sm hover:translate-y-[-1px] active:translate-y-[0px]',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/10',
    outline: 'border border-border bg-transparent hover:bg-secondary/80 text-foreground',
    ghost: 'hover:bg-secondary/80 text-muted-foreground hover:text-foreground',
    glass: 'glass-card bg-card/40 border-white/5 text-foreground hover:bg-card/80 hover:text-foreground dark:hover:bg-card/60'
  };

  const sizes = {
    sm: 'px-4 py-2 text-[10px]',
    md: 'px-6 py-3 text-xs',
    lg: 'px-8 py-4 text-sm',
    icon: 'p-3'
  };

  return (
    <button
      className={cn(
        "rounded-md font-bold uppercase tracking-[0.1em] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function StatCard({ label, value, sub, icon, className }: {
  label: string; value: string | number; sub?: string; icon?: ReactNode; className?: string;
}) {
  return (
    <div className={cn("glass-card p-8 animate-slide-up group overflow-hidden relative rounded-md", className)}>
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity transform scale-[3] rotate-12">
        {icon}
      </div>
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3.5 rounded-lg bg-primary/5 text-primary transition-transform group-hover:scale-110">
          {cloneElement(icon as ReactElement, { className: 'h-6 w-6' })}
        </div>
        <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em] font-black">{label}</span>
      </div>
      <div className="text-4xl font-black tracking-tighter">{value}</div>
      {sub && <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-3 flex items-center gap-2">{sub}</div>}
    </div>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    Wealth: 'bg-primary/5 text-primary border-primary/10',
    Health: 'bg-success/5 text-success border-success/10',
    Skills: 'bg-warning/5 text-warning border-warning/10',
    Relationships: 'bg-destructive/5 text-destructive border-destructive/10',
    Spiritual: 'bg-accent/5 text-accent border-accent/10',
    Lifestyle: 'bg-secondary/50 text-secondary-foreground border-border/10',
    Books: 'bg-indigo-500/5 text-indigo-500 border-indigo-500/10',
    Finance: 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10',
    Networking: 'bg-violet-500/5 text-violet-500 border-violet-500/10',
  };
  return (
    <span className={cn("px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.1em] border backdrop-blur-sm", colors[category] || 'bg-secondary text-secondary-foreground')}>
      {category}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Not Started': 'bg-muted/50 text-muted-foreground border-border/10',
    'In Progress': 'bg-primary/5 text-primary border-primary/10',
    'Completed': 'bg-success/5 text-success border-success/10',
  };
  return (
    <span className={cn("px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.1em] border", colors[status] || 'bg-muted text-muted-foreground')}>
      {status}
    </span>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 bg-secondary/30 rounded-full overflow-hidden border border-white/5", className)}>
      <div
        className="h-full bg-primary rounded-full shadow-glow shadow-primary/20 transition-all duration-1000 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function EmptyState({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in glass-card border-dashed">
      <h3 className="text-2xl font-black tracking-tight mb-3">{title}</h3>
      <p className="text-sm font-medium text-muted-foreground/60 mb-8 max-w-sm leading-relaxed">{description}</p>
      {children}
    </div>
  );
}
