import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/shared';

export default function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        const performLogout = async () => {
            await supabase.auth.signOut();
            setTimeout(() => {
                navigate('/');
            }, 2000);
        };
        performLogout();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="glass-card p-12 w-full max-w-md rounded-[3rem] border-destructive/10 text-center space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transform scale-150 rotate-12">
                    <ShieldAlert className="h-32 w-32 text-destructive" />
                </div>

                <div className="flex justify-center">
                    <div className="p-5 rounded-full bg-destructive/10 border border-destructive/20 animate-pulse">
                        <ShieldAlert className="h-10 w-10 text-destructive shadow-glow shadow-destructive/20" />
                    </div>
                </div>

                <div className="space-y-3 relative z-10">
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic text-foreground">Session Terminated</h2>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.3em] leading-relaxed">
                        Security protocols executed. <br />Redirecting to access terminal...
                    </p>
                </div>

                <div className="flex justify-center pt-4 relative z-10">
                    <Loader2 className="h-6 w-6 text-primary animate-spin opacity-40" />
                </div>

                <div className="pt-8 relative z-10">
                    <Button
                        onClick={() => navigate('/')}
                        variant="primary"
                        className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-glow shadow-primary/20"
                    >
                        <LogIn className="h-4 w-4 mr-2" />
                        Manual Access
                    </Button>
                </div>
            </div>
        </div>
    );
}
