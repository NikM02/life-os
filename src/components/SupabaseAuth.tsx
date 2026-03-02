import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/shared';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Lock, Mail, Loader2 } from 'lucide-react';

export default function SupabaseAuth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <div className="glass-card p-10 w-full max-w-md rounded-3xl border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transform scale-150 rotate-12">
                    <ShieldCheck className="h-24 w-24" />
                </div>

                <div className="relative z-10 text-center space-y-8">
                    <div className="flex justify-center">
                        <div className="p-4 rounded-full bg-primary/5 border border-primary/10">
                            <Lock className="h-8 w-8 text-primary shadow-glow shadow-primary/20" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-black tracking-tighter uppercase italic">Secure Access</h2>
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">Synchronizing your life OS to the cloud</p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4 text-left pt-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Intelligence ID (Email)</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                                <Input
                                    type="email"
                                    placeholder="name@domain.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-secondary/30 border-none rounded-xl pl-10 h-12"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Access Protocol (Password)</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-secondary/30 border-none rounded-xl pl-10 h-12"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 rounded-xl text-xs font-black uppercase tracking-widest mt-6"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isSignUp ? 'Initialize Profile' : 'Gain Access')}
                        </Button>
                    </form>

                    <div className="pt-4">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-primary transition-colors underline underline-offset-4"
                        >
                            {isSignUp ? 'Already have a protocol? Sign In' : 'New System? Create Profile'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
