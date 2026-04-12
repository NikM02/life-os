import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Pencil } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { format, getDaysInMonth } from 'date-fns';
import { cn } from '@/lib/utils';

const DEFAULT_HABITS = [
  'Exercise',
  'Read',
  'Meditate',
  'No Junk Food',
  'Sleep 8h',
  'Cold Shower',
];

type CompletedMap = Record<string, boolean>; // key: "habitIndex-yyyy-MM-dd"

export default function Habits() {
  const [habits, setHabits] = useLocalStorage<string[]>('lifeos-habit-names', DEFAULT_HABITS);
  const [completed, setCompleted] = useLocalStorage<CompletedMap>('lifeos-habit-checks', {});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const daysInMonth = getDaysInMonth(new Date(viewYear, viewMonth, 1));
  const monthLabel = format(new Date(viewYear, viewMonth, 1), 'MMMM yyyy');

  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const key = (habitIdx: number, day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return `${habitIdx}-${dateStr}`;
  };

  const toggle = (habitIdx: number, day: number) => {
    const k = key(habitIdx, day);
    setCompleted({ ...completed, [k]: !completed[k] });
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const startEdit = (i: number) => {
    setEditingIndex(i);
    setEditValue(habits[i]);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const updated = [...habits];
      updated[editingIndex] = editValue.trim();
      setHabits(updated);
    }
    setEditingIndex(null);
  };

  // Count completions for each habit this month
  const monthScore = (habitIdx: number) => {
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      if (completed[key(habitIdx, d)]) count++;
    }
    return count;
  };

  return (
    <div className="max-w-full mx-auto pb-32 px-2 md:px-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Habit Tracker</h1>
          <p className="text-xs text-muted-foreground/50 mt-1">Track 6 habits across any month</p>
        </div>
        {/* Month navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl border border-border/40 hover:bg-secondary/60 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold w-32 text-center">{monthLabel}</span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl border border-border/40 hover:bg-secondary/60 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-2xl border border-border/30 bg-background">
        <table className="w-full text-xs border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-border/20">
              {/* Habit name column */}
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground/60 w-40 min-w-[140px] sticky left-0 bg-background z-10 border-r border-border/20">
                Habit
              </th>
              {dayNumbers.map(d => {
                const isToday =
                  d === today.getDate() &&
                  viewMonth === today.getMonth() &&
                  viewYear === today.getFullYear();
                return (
                  <th
                    key={d}
                    className={cn(
                      'text-center font-semibold py-3 w-8',
                      isToday ? 'text-primary' : 'text-muted-foreground/30'
                    )}
                  >
                    {d}
                  </th>
                );
              })}
              <th className="text-center px-3 py-3 font-semibold text-muted-foreground/40 w-16">
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit, hi) => (
              <tr key={hi} className="border-b border-border/10 hover:bg-secondary/10 transition-colors group">
                {/* Habit name */}
                <td className="sticky left-0 bg-background z-10 border-r border-border/20 px-4 py-2">
                  {editingIndex === hi ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={e => e.key === 'Enter' && saveEdit()}
                      className="w-full text-xs font-semibold bg-transparent border-b border-primary/40 focus:outline-none py-0.5"
                    />
                  ) : (
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-medium text-foreground/80 text-xs leading-tight">{habit}</span>
                      <button
                        onClick={() => startEdit(hi)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground/30 hover:text-primary transition-all p-0.5 rounded"
                      >
                        <Pencil size={11} />
                      </button>
                    </div>
                  )}
                </td>

                {/* Day checkboxes */}
                {dayNumbers.map(d => {
                  const k = key(hi, d);
                  const done = !!completed[k];
                  const isToday =
                    d === today.getDate() &&
                    viewMonth === today.getMonth() &&
                    viewYear === today.getFullYear();
                  return (
                    <td key={d} className="text-center py-2">
                      <button
                        onClick={() => toggle(hi, d)}
                        className={cn(
                          'w-6 h-6 mx-auto rounded-md border flex items-center justify-center transition-all duration-200',
                          done
                            ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                            : isToday
                            ? 'border-primary/40 hover:bg-primary/10 text-transparent hover:text-primary/20'
                            : 'border-border/20 hover:border-primary/30 text-transparent hover:text-primary/10'
                        )}
                      >
                        <Check size={12} strokeWidth={2.5} />
                      </button>
                    </td>
                  );
                })}

                {/* Score */}
                <td className="text-center py-2 px-3">
                  <span className={cn(
                    'text-xs font-bold font-mono',
                    monthScore(hi) > 0 ? 'text-primary' : 'text-muted-foreground/20'
                  )}>
                    {monthScore(hi)}/{daysInMonth}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <p className="text-[10px] text-muted-foreground/30 mt-4 text-center">
        Click any cell to mark as done · Click the pencil icon to rename a habit
      </p>
    </div>
  );
}
