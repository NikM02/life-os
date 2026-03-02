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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black select-none">
      <div className={cn(
        "flex flex-col items-center transition-all duration-700",
        loading ? "scale-95 opacity-0 blur-xl" : "scale-100 opacity-100"
      )}>
        <div className="flex gap-3 sm:gap-4 mb-8">
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={cn(
                "w-10 h-14 sm:w-12 sm:h-16 text-center text-3xl font-light bg-transparent border-b-2 border-white/20 focus:outline-none focus:border-white transition-all text-white",
                digit && "border-white"
              )}
              autoFocus={i === 0}
            />
          ))}
        </div>

        <div className="h-6 flex items-center justify-center">
          {loading ? (
            <div className="text-[10px] font-light uppercase tracking-[0.3em] text-white/40 animate-pulse">
              Syncing...
            </div>
          ) : error && (
            <div className="text-destructive text-[10px] font-black uppercase tracking-[0.2em]">
              Invalid Hash
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
