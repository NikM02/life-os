import React, { useState, useEffect } from 'react';
import { PageHeader, Button } from '@/components/shared';
import { Plus, Edit2, Trash2, Check, X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MainTask {
  id: string;
  text: string;
  completed: boolean;
}

export default function Mission() {
  const [tasks, setTasks] = useState<MainTask[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('lifeos-vision-main-tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        setTasks([]);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('lifeos-vision-main-tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const addTask = () => {
    if (tasks.length >= 3) return;
    const newTask: MainTask = {
      id: Date.now().toString(),
      text: 'New Task',
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setEditingId(newTask.id);
    setEditText('New Task');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const startEdit = (task: MainTask) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const saveEdit = () => {
    if (!editText.trim()) return;
    setTasks(tasks.map(t => t.id === editingId ? { ...t, text: editText.trim() } : t));
    setEditingId(null);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto pb-32 px-4 animate-fade-in shadow-none">
      <PageHeader
        title="Mission"
        description="Your 3 Main Tasks"
      >
        {tasks.length < 3 && (
          <Button onClick={addTask} className="rounded-2xl h-10 px-6">
            <Plus size={16} className="mr-2" /> Add Task
          </Button>
        )}
      </PageHeader>

      <div className="mt-16 space-y-4">
        {tasks.map(task => (
          <div key={task.id} className={cn(
            "p-6 rounded-3xl border transition-all duration-300 flex items-center gap-4 group",
            task.completed ? "bg-secondary/5 border-border/10 opacity-70" : "bg-card border-border/20 hover:border-primary/20"
          )}>
            <button 
              onClick={() => toggleTask(task.id)}
              className={cn(
                "w-6 h-6 rounded-md border flex items-center justify-center transition-all flex-shrink-0",
                task.completed ? "bg-primary border-primary text-primary-foreground" : "border-border/30 hover:border-primary/50"
              )}
            >
              {task.completed && <Check size={14} />}
            </button>
            
            <div className="flex-1">
              {editingId === task.id ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit()}
                    className="flex-1 bg-transparent border-b border-primary/20 focus:outline-none focus:border-primary pb-1 text-lg"
                  />
                  <button onClick={saveEdit} className="p-2 text-success hover:bg-success/10 rounded-xl transition-all">
                    <Save size={16} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-2 text-muted-foreground hover:bg-secondary rounded-xl transition-all">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <span className={cn(
                  "text-lg transition-all",
                  task.completed ? "line-through text-muted-foreground" : "text-foreground"
                )}>
                  {task.text}
                </span>
              )}
            </div>

            {editingId !== task.id && (
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(task)} className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-xl transition-all">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => deleteTask(task.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center p-12 rounded-3xl border border-dashed border-border/20 text-muted-foreground">
            <p>No main tasks defined. Add up to 3 tasks to focus on.</p>
          </div>
        )}
      </div>
    </div>
  );
}
