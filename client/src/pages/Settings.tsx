import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'wouter';
import { useState } from 'react';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  
  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="-ml-2">
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-2xl font-display font-bold">Settings</h1>
      </div>

      <div className="space-y-8">
        {/* Profile / Pairing */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider border-b pb-2">Pairing</h2>
          <div className="bg-card p-4 rounded-xl border space-y-4">
            <div>
               <Label>Your Pairing Code</Label>
               <div className="mt-1.5 flex gap-2">
                 <div className="bg-muted px-4 py-2 rounded-md font-mono text-lg tracking-widest flex-1 text-center select-all">
                   K-9284
                 </div>
                 <Button variant="outline">Copy</Button>
               </div>
               <p className="text-xs text-muted-foreground mt-2">Share this code with your partner to link buckets.</p>
            </div>
          </div>
        </section>

        {/* AI Configuration */}
        <section className="space-y-4">
           <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider border-b pb-2">AI Assistant</h2>
           
           <div className="flex items-center justify-between">
             <div className="space-y-0.5">
               <Label>Enable Gemini AI</Label>
               <p className="text-xs text-muted-foreground">Smart suggestions & conflict detection</p>
             </div>
             <Switch />
           </div>

           <div className="space-y-2">
             <Label>Gemini API Key</Label>
             <Input 
               type="password" 
               placeholder="AIzaSy..." 
               value={apiKey}
               onChange={(e) => setApiKey(e.target.value)}
             />
             <p className="text-xs text-muted-foreground">
               Your key is stored locally on your device.
             </p>
           </div>
        </section>

        {/* Preferences */}
        <section className="space-y-4">
           <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider border-b pb-2">Preferences</h2>
           
           <div className="flex items-center justify-between">
             <div className="space-y-0.5">
               <Label>Dark Mode</Label>
             </div>
             <Switch />
           </div>

           <div className="flex items-center justify-between">
             <div className="space-y-0.5">
               <Label>Daily Reminders</Label>
             </div>
             <Switch defaultChecked />
           </div>
        </section>

        <div className="pt-4">
          <Button className="w-full h-12 text-lg rounded-xl">
            <Save className="mr-2" size={18} />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
