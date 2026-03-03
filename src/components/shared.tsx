import React, { ReactNode, ButtonHTMLAttributes, cloneElement, ReactElement } from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({ title, description, children, className }: { title: string; description?: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16 animate-fade-in pt-10", className)}>
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground/90 leading-tight">{title}</h1>
        {description && <p className="text-sm font-medium text-muted-foreground/50 max-w-xl leading-relaxed">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
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
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/10',
    outline: 'border border-border/60 hover:border-primary/40 hover:bg-secondary/50',
    ghost: 'hover:bg-secondary/50 text-muted-foreground hover:text-primary',
    glass: 'bg-background/20 backdrop-blur-md border border-white/10 hover:bg-background/30'
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs font-semibold',
    md: 'px-6 py-2.5 text-[13px] font-semibold',
    lg: 'px-8 py-3.5 text-[15px] font-bold',
    icon: 'p-2.5'
  };

  return (
    <button
      className={cn(
        "rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:grayscale",
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
    <div className={cn("p-8 rounded-3xl bg-secondary/30 border border-border/10 group hover:border-primary/20 transition-all duration-500", className)}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/40">{label}</span>
        {icon && <div className="p-2 rounded-xl bg-background/50 text-muted-foreground/30 group-hover:text-primary transition-colors">{cloneElement(icon as ReactElement, { size: 16 })}</div>}
      </div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {sub && <div className="text-[10px] font-medium text-muted-foreground/30">{sub}</div>}
      </div>
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
    <span className={cn("text-[9px] font-bold uppercase tracking-wider opacity-60", colors[category], className)}>
      {category}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="px-3 py-1 rounded-xl border border-border/40 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
      {status}
    </span>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 bg-secondary/20 rounded-full overflow-hidden", className)}>
      <div
        className="h-full bg-primary/80 transition-all duration-1000 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function EmptyState({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/20 rounded-3xl group">
      <h3 className="text-xl font-semibold tracking-tight mb-2 text-foreground/40 group-hover:text-foreground/60 transition-colors">{title}</h3>
      <p className="text-sm font-medium text-muted-foreground/30 mb-8 max-w-xs leading-relaxed">{description}</p>
      {children}
    </div>
  );
}
