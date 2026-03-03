import React, { useState, useEffect, useRef } from 'react';
import { Book, Lock, ChevronRight, Sparkles, Key } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0a] select-none overflow-hidden font-serif">
      {/* Premium Background Grain & Depth */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className={cn(
        "flex flex-col items-center transition-all duration-1000 ease-in-out relative z-10",
        loading ? "scale-110 opacity-0 blur-2xl" : "scale-100 opacity-100 animate-in fade-in zoom-in duration-1000"
      )}>
        <div className="mb-16 flex flex-col items-center gap-6">
          <div className="h-16 w-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl relative group overflow-hidden transition-all duration-700 hover:border-white/20">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Book className="h-7 w-7 text-white/80 group-hover:text-white transition-colors" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <h1 className="text-3xl font-medium tracking-tight text-white/90 font-serif">Digital Volume I</h1>
            <span className="text-[10px] font-medium text-white/20 uppercase tracking-[0.3em]">Identity Verification Required</span>
          </div>
        </div>

        <div className="flex gap-4 sm:gap-6 mb-16 h-20 items-center">
          {pin.map((digit, i) => (
            <div
              key={i}
              className="relative animate-in fade-in slide-in-from-bottom-12 duration-1000"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={cn(
                "w-12 h-16 sm:w-14 sm:h-18 rounded-2xl border border-dotted border-white/20 bg-transparent flex items-center justify-center transition-all duration-700 relative overflow-hidden",
                digit ? "border-white/40" : "border-white/10",
                inputRefs.current[i] === document.activeElement && "border-white/60",
                error && "animate-shake border-destructive/50"
              )}>
                <input
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  spellCheck={false}
                  autoComplete="off"
                  className="absolute inset-0 w-full h-full text-center text-3xl font-light bg-transparent focus:outline-none caret-transparent text-transparent z-10 cursor-default"
                  autoFocus={i === 0}
                />

                {/* Vertical Roller - High Visibility */}
                <div className="flex flex-col items-center justify-center h-full pointer-events-none">
                  <div
                    className="flex flex-col items-center transition-transform duration-[1200ms] cubic-bezier(0.2, 1, 0.4, 1)"
                    style={{
                      transform: digit
                        ? `translateY(calc(-${parseInt(digit)} * 3rem))`
                        : 'translateY(0)'
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <span
                        key={num}
                        className={cn(
                          "h-12 w-full text-3xl font-light flex items-center justify-center transition-colors duration-500",
                          digit === String(num) ? "text-white opacity-100" : "text-white/5 opacity-5"
                        )}
                      >
                        {num}
                      </span>
                    ))}
                    {!digit && (
                      <span className="h-12 text-white/10 flex items-center justify-center opacity-30">•</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-8 flex items-center justify-center">
          {loading ? (
            <div className="text-[11px] font-medium tracking-widest text-white/60 flex items-center gap-3">
              <Sparkles className="h-3 w-3 animate-pulse" />
              <span>Unlocking Vault...</span>
            </div>
          ) : error ? (
            <div className="text-destructive/80 text-[11px] font-bold uppercase tracking-[0.2em] animate-pulse">
              Invalid Sequence
            </div>
          ) : (
            <div className="text-[9px] font-medium uppercase tracking-[0.4em] text-white/15 flex items-center gap-3">
              <Key size={10} className="opacity-50" />
              <span>Sequence Access Required</span>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Book Corners */}
      <div className="absolute top-10 left-10 w-20 h-20 border-t border-l border-white/5 rounded-tl-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-20 h-20 border-t border-r border-white/5 rounded-tr-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-20 h-20 border-b border-l border-white/5 rounded-bl-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-20 h-20 border-b border-r border-white/5 rounded-br-3xl pointer-events-none" />
    </div>
  );
};
