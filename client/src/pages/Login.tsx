import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Heart, Sparkles, Mail } from 'lucide-react';

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLocation('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(167,139,250,0.1),rgba(255,255,255,0))]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

      <div className="w-full max-w-sm space-y-8 relative z-10">
        <div className="text-center space-y-2">
           <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4 text-primary">
             <Heart size={32} fill="currentColor" />
           </div>
           <h1 className="text-3xl font-display font-bold">Bucket Keeper</h1>
           <p className="text-muted-foreground">The Game OS for Couples.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
             <Input 
               type="email" 
               placeholder="Enter your email" 
               className="h-12 bg-white/50 backdrop-blur-sm"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               required
             />
          </div>
          <Button type="submit" className="w-full h-12 text-lg rounded-xl" disabled={loading}>
            {loading ? "Magic happening..." : "Continue with Email"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <Button variant="outline" className="h-12 rounded-xl">Google</Button>
           <Button variant="outline" className="h-12 rounded-xl">Apple</Button>
        </div>
      </div>
    </div>
  );
}
