import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Calendar, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';
import { useState } from 'react';
import { useTheme } from '@/components/theme-provider';
import { useApp } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { apiKey, setApiKey } = useApp();
  const { toast } = useToast();
  
  const [localKey, setLocalKey] = useState(apiKey);
  
  const handleSave = () => {
    setApiKey(localKey);
    toast({
      title: "Settings Saved",
      description: "Your preferences and API key have been updated.",
    });
  };

  return (
    <div className="p-6 bg-background min-h-screen text-foreground pb-24">
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

        {/* Calendar Sync */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider border-b pb-2">Integrations</h2>
          <Link href="/calendar-sync">
            <div className="bg-card p-4 rounded-xl border flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="font-medium">Calendar Sync</h3>
                  <p className="text-xs text-muted-foreground">Google, iCloud, Outlook</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">Configure</Button>
            </div>
          </Link>
        </section>

        {/* AI Configuration */}
        <section className="space-y-4">
           <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider border-b pb-2">AI Assistant</h2>
           
           <div className="flex items-center justify-between">
             <div className="space-y-0.5">
               <Label>Enable Gemini AI</Label>
               <p className="text-xs text-muted-foreground">Smart suggestions & conflict detection</p>
             </div>
             <Switch checked={!!apiKey} onCheckedChange={() => {}} disabled />
           </div>

           <div className="space-y-2">
             <Label>Gemini API Key</Label>
             <Input 
               type="password" 
               placeholder="AIzaSy..." 
               value={localKey}
               onChange={(e) => setLocalKey(e.target.value)}
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
             <Switch 
               checked={theme === 'dark'}
               onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
             />
           </div>

           <div className="flex items-center justify-between">
             <div className="space-y-0.5">
               <Label>Daily Reminders</Label>
             </div>
             <Switch defaultChecked />
           </div>
        </section>

        <div className="pt-4">
          <Button onClick={handleSave} className="w-full h-12 text-lg rounded-xl">
            <Save className="mr-2" size={18} />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
