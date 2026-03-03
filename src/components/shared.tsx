import React, { ReactNode, ButtonHTMLAttributes, cloneElement, ReactElement } from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 animate-fade-in pt-6 border-b border-border/5 pb-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground uppercase italic">{title}</h1>
        {description && <p className="text-[10px] font-medium text-muted-foreground/50 mt-1 max-w-2xl leading-relaxed uppercase tracking-widest">{description}</p>}
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
    primary: 'bg-foreground text-background hover:opacity-90',
    secondary: 'bg-secondary/40 text-secondary-foreground hover:bg-secondary/60 border border-border/10',
    outline: 'border border-border/20 bg-transparent hover:bg-secondary/20 text-foreground',
    ghost: 'hover:bg-secondary/20 text-muted-foreground hover:text-foreground',
    glass: 'bg-white/5 border border-white/5 text-foreground hover:bg-white/10'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[9px]',
    md: 'px-5 py-2.5 text-[10px]',
    lg: 'px-6 py-3 text-xs',
    icon: 'p-2'
  };

  return (
    <button
      className={cn(
        "rounded-xl font-black uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2",
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
    <div className={cn("bg-secondary/5 p-6 border border-border/10 rounded-2xl group transition-all hover:bg-secondary/10", className)}>
      <div className="flex items-center gap-2 mb-4">
        {icon && <div className="text-muted-foreground/30">{cloneElement(icon as ReactElement, { size: 14 })}</div>}
        <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="text-2xl font-black tracking-tighter">{value}</div>
      {sub && <div className="text-[7px] font-bold uppercase tracking-widest text-muted-foreground/20 mt-2">{sub}</div>}
    </div>
  );
}

export function CategoryBadge({ category, className }: { category: string; className?: string }) {
  const colors: Record<string, string> = {
    Wealth: 'text-primary',
    Health: 'text-success',
    Skills: 'text-warning',
    Relationships: 'text-destructive',
    Spiritual: 'text-accent',
    Lifestyle: 'text-muted-foreground',
    Books: 'text-indigo-400',
    Finance: 'text-emerald-400',
    Networking: 'text-violet-400',
  };
  return (
    <span className={cn("text-[7px] font-black uppercase tracking-widest opacity-60", colors[category], className)}>
      {category}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="px-2 py-0.5 rounded border border-border/20 text-[7px] font-bold uppercase tracking-widest text-muted-foreground/40">
      {status}
    </span>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1 bg-secondary/20 rounded-full overflow-hidden", className)}>
      <div
        className="h-full bg-primary/60 transition-all duration-1000 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function EmptyState({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/20 rounded-3xl">
      <h3 className="text-lg font-black tracking-tight mb-2 uppercase opacity-40">{title}</h3>
      <p className="text-[10px] font-medium text-muted-foreground/30 mb-6 max-w-xs leading-relaxed uppercase tracking-widest">{description}</p>
      {children}
    </div>
  );
}
