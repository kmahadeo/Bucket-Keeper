import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/lib/store';

export default function CalendarSync() {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const handleSync = (provider: string) => {
    setSyncing(true);
    // Simulation of sync
    setTimeout(() => {
      setSyncing(false);
      toast({
        title: "Sync Required",
        description: `To connect with ${provider}, we need to enable backend services.`,
      });
      // In a real scenario, this would trigger the suggestion tool
    }, 1500);
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="-ml-2">
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-2xl font-display font-bold">Calendar Sync</h1>
      </div>

      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-2xl border border-blue-100 dark:border-blue-900 text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
             <Calendar size={24} />
          </div>
          <h2 className="font-bold text-lg">Bi-directional Sync</h2>
          <p className="text-sm text-muted-foreground">
            Import events from Google/Apple Calendar and push your Bucket items back to your schedule.
          </p>
        </div>

        <div className="space-y-3">
           <SyncButton 
             label="Google Calendar" 
             icon="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg"
             onClick={() => handleSync('Google')}
             loading={syncing}
           />
           <SyncButton 
             label="iCloud Calendar" 
             icon="https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg" // Placeholder icon
             onClick={() => handleSync('Apple')}
             loading={syncing}
           />
        </div>

        <div className="pt-8 border-t">
           <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Export Options</h3>
           <Button variant="outline" className="w-full justify-start h-12 rounded-xl">
             Download .ics File (Static)
           </Button>
        </div>
      </div>
    </div>
  );
}

function SyncButton({ label, icon, onClick, loading }: { label: string, icon: string, onClick: () => void, loading: boolean }) {
  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors tap-active"
    >
      <div className="flex items-center gap-3">
        <img src={icon} alt="" className="w-6 h-6" />
        <span className="font-medium">{label}</span>
      </div>
      {loading ? <RefreshCw className="animate-spin text-muted-foreground" size={18} /> : <div className="text-primary font-semibold text-sm">Connect</div>}
    </button>
  );
}
