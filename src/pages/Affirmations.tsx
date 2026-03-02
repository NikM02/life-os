import React, { useState, useEffect } from 'react';
import { Quote, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const QUOTES = [
  {
    text: "The best way to predict the future is to create it.",
    author: "Peter Drucker"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "Your time is limited, so don't waste it living someone else's life.",
    author: "Steve Jobs"
  },
  {
    text: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt"
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius"
  },
  {
    text: "Discipline is the bridge between goals and accomplishment.",
    author: "Jim Rohn"
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    text: "What you get by achieving your goals is not as important as what you become by achieving your goals.",
    author: "Henry David Thoreau"
  }
];

export default function Affirmations() {
  const [quote, setQuote] = useState(QUOTES[0]);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        const nextQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        setQuote(nextQuote);
        setFade(true);
      }, 500);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 animate-fade-in relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className={cn(
        "max-w-4xl w-full transition-all duration-700 transform text-center",
        fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <div className="flex justify-center mb-10">
          <div className="p-4 rounded-full bg-primary/5 border border-primary/10">
            <Quote className="h-8 w-8 text-primary shadow-glow shadow-primary/20" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] mb-10 text-foreground drop-shadow-sm">
          {quote.text}
        </h1>

        <div className="flex flex-col items-center gap-6">
          <div className="h-px w-24 bg-primary/20" />
          <span className="text-sm font-black uppercase tracking-[0.4em] text-muted-foreground/60">
            — {quote.author}
          </span>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-20 hover:opacity-100 transition-opacity cursor-default">
        <Sparkles className="h-4 w-4 animate-float" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Synchronized</span>
      </div>
    </div>
  );
}
