import React, { useState, useEffect, useRef } from 'react';
import { Shield, Lock, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onSuccess: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onSuccess }) => {
  const [pin, setPin] = useState(['', '', '', '', '', '', '']);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const CORRECT_PIN = '1670651';

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    if (value && index < 6) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    if (pin.every(digit => digit !== '')) {
      const enteredPin = pin.join('');
      if (enteredPin === CORRECT_PIN) {
        setLoading(true);
        setTimeout(() => {
          onSuccess();
        }, 1200);
      } else {
        setError(true);
        setTimeout(() => {
          setPin(['', '', '', '', '', '', '']);
          setError(false);
          inputRefs.current[0]?.focus();
        }, 800);
      }
    }
  }, [pin, onSuccess]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black select-none overflow-hidden">
      {/* Background Micro-animations */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <div className={cn(
        "flex flex-col items-center transition-all duration-1000 ease-in-out relative z-10",
        loading ? "scale-110 opacity-0 blur-2xl" : "scale-100 opacity-100 animate-in fade-in zoom-in duration-700"
      )}>
        <div className="mb-12 flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center animate-bounce shadow-2xl shadow-white/5">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col items-center text-center">
            <h1 className="text-xl font-black tracking-[0.4em] text-white uppercase italic">N-OS</h1>
            <span className="text-[7px] font-bold text-white/20 uppercase tracking-[0.5em] mt-1">Intelligence Protocol</span>
          </div>
        </div>

        <div className="flex gap-3 sm:gap-4 mb-8">
          {pin.map((digit, i) => (
            <div
              key={i}
              className="relative group animate-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <input
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={cn(
                  "w-10 h-14 sm:w-12 sm:h-16 text-center text-3xl font-light bg-transparent border-b-2 border-white/10 focus:outline-none focus:border-white transition-all text-white",
                  digit && "border-white",
                  error && "border-destructive text-destructive animate-shake"
                )}
                autoFocus={i === 0}
              />
              {digit && !error && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary animate-in fade-in scale-x-100 duration-300" />
              )}
            </div>
          ))}
        </div>

        <div className="h-6 flex items-center justify-center">
          {loading ? (
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 flex items-center gap-3">
              <Sparkles className="h-3 w-3 animate-spin" />
              <span>Calibrating...</span>
            </div>
          ) : error ? (
            <div className="text-destructive text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
              Hash Mismatch
            </div>
          ) : (
            <div className="text-[8px] font-bold uppercase tracking-[0.4em] text-white/20">
              Input Security Token
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
