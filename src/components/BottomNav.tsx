import {
  Activity, Wallet, Clapperboard, BookOpen, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { title: 'Mission', url: '/mission', icon: Eye },
  { title: 'Youtube', url: '/youtube', icon: Clapperboard },
  { title: 'Habits', url: '/habits', icon: Activity },
  { title: 'Finance', url: '/finance', icon: Wallet },
  { title: 'Library', url: '/library', icon: BookOpen },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-xl border-t border-border/40 md:hidden pb-safe">
      {navItems.map((item) => {
        const isActive = location.pathname === item.url;
        return (
          <Link
            key={item.title}
            to={item.url}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all",
              isActive ? "text-primary" : "text-muted-foreground/50 hover:text-foreground"
            )}
          >
            <item.icon
              size={20}
              className={cn(
                "transition-transform duration-300",
                isActive ? "scale-110" : "scale-100"
              )}
              strokeWidth={isActive ? 2.5 : 1.5}
            />
            <span className="text-[10px] font-semibold tracking-wide">
              {item.title}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
