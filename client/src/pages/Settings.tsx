import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Calendar, LogOut, Trash2, Shield, User, Bell } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import { useTheme } from '@/components/theme-provider';
import { useApp } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { apiKey, setApiKey, user } = useApp();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [localKey, setLocalKey] = useState(apiKey);
  
  const handleSave = () => {
    setApiKey(localKey);
    toast({
      title: "Settings Saved",
      description: "Your preferences and API key have been updated.",
    });
  };

  const handleLogout = () => {
    toast({ title: "Logged Out", description: "Come back soon!" });
    setLocation('/login'); // Hypothetical route
  };

  const handleDeleteAccount = () => {
    toast({ title: "Account Deleted", description: "We're sad to see you go.", variant: "destructive" });
    setLocation('/login');
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
        {/* Account Section */}
        <section className="space-y-4">
           <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider border-b pb-2">Account</h2>
           <div className="flex items-center gap-4 p-4 bg-card border rounded-xl">
             <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
               {user.name[0]}
             </div>
             <div>
               <h3 className="font-bold">{user.name}</h3>
               <p className="text-xs text-muted-foreground">kaushik@example.com</p>
             </div>
             <Button variant="ghost" size="sm" className="ml-auto">Edit</Button>
           </div>
        </section>

        {/* Pairing */}
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

        {/* Integrations */}
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
               <Label>Push Notifications</Label>
               <p className="text-xs text-muted-foreground">Reminders & Love Notes</p>
             </div>
             <Switch defaultChecked />
           </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-4 pt-4">
           <Button variant="outline" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
             <LogOut className="mr-2" size={16} /> Log Out
           </Button>

           <AlertDialog>
             <AlertDialogTrigger asChild>
               <Button variant="ghost" className="w-full text-destructive/70 hover:text-destructive text-xs">
                 <Trash2 className="mr-2" size={14} /> Delete Account & Data
               </Button>
             </AlertDialogTrigger>
             <AlertDialogContent>
               <AlertDialogHeader>
                 <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                 <AlertDialogDescription>
                   This action cannot be undone. This will permanently delete your account, earned coins, and memories.
                 </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                 <AlertDialogCancel>Cancel</AlertDialogCancel>
                 <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                   Delete Account
                 </AlertDialogAction>
               </AlertDialogFooter>
             </AlertDialogContent>
           </AlertDialog>
        </section>

        <div className="sticky bottom-4">
          <Button onClick={handleSave} className="w-full h-12 text-lg rounded-xl shadow-lg">
            <Save className="mr-2" size={18} />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
