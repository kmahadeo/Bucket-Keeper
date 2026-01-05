import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, RefreshCw, Check, X, Loader2, CalendarDays } from 'lucide-react';
import { Link } from 'wouter';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/lib/store';
import { getCalendarStatus, getCalendarEvents, syncItemToCalendar, type CalendarEvent } from '@/lib/api';
import { format } from 'date-fns';

export default function CalendarSync() {
  const { toast } = useToast();
  const { items } = useApp();
  const [connected, setConnected] = useState<boolean | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const itemsWithDueDate = items.filter(i => i.dueDate && !i.completed);

  useEffect(() => {
    checkConnectionAndLoadEvents();
  }, []);

  const checkConnectionAndLoadEvents = async () => {
    setLoading(true);
    try {
      const status = await getCalendarStatus();
      setConnected(status.connected);
      
      if (status.connected) {
        const calendarEvents = await getCalendarEvents();
        setEvents(calendarEvents);
      }
    } catch (error) {
      console.error("Error checking calendar:", error);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncItem = async (item: typeof items[0]) => {
    if (!item.dueDate) return;
    
    setSyncing(true);
    try {
      await syncItemToCalendar({
        itemId: item.id,
        title: item.title,
        dueDate: item.dueDate.toISOString(),
        description: `Priority: ${item.priority} | Type: ${item.type}`
      });
      
      toast({
        title: "Synced to Calendar",
        description: `"${item.title}" has been added to your Google Calendar.`
      });
      
      await checkConnectionAndLoadEvents();
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Could not sync item to calendar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    let successCount = 0;
    
    for (const item of itemsWithDueDate) {
      try {
        await syncItemToCalendar({
          itemId: item.id,
          title: item.title,
          dueDate: item.dueDate!.toISOString(),
          description: `Priority: ${item.priority} | Type: ${item.type}`
        });
        successCount++;
      } catch (error) {
        console.error("Failed to sync item:", item.title);
      }
    }
    
    toast({
      title: "Bulk Sync Complete",
      description: `${successCount} of ${itemsWithDueDate.length} items synced to Google Calendar.`
    });
    
    await checkConnectionAndLoadEvents();
    setSyncing(false);
  };

  if (loading) {
    return (
      <div className="p-6 bg-background min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-screen pb-24">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="-ml-2" data-testid="button-back">
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-2xl font-display font-bold">Calendar Sync</h1>
      </div>

      <div className="space-y-6">
        {/* Connection Status */}
        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
          connected 
            ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900' 
            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900'
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            connected ? 'bg-green-100 dark:bg-green-900' : 'bg-amber-100 dark:bg-amber-900'
          }`}>
            {connected ? (
              <Check className="text-green-600 dark:text-green-400" size={20} />
            ) : (
              <X className="text-amber-600 dark:text-amber-400" size={20} />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm" data-testid="text-connection-status">
              {connected ? 'Google Calendar Connected' : 'Not Connected'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {connected 
                ? 'Your calendar is synced and ready to use' 
                : 'Connect your Google account to enable sync'}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={checkConnectionAndLoadEvents}
            data-testid="button-refresh-status"
          >
            <RefreshCw size={16} />
          </Button>
        </div>

        {connected ? (
          <>
            {/* Sync Actions */}
            <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-2xl border border-blue-100 dark:border-blue-900 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
                <Calendar size={24} />
              </div>
              <h2 className="font-bold text-lg">Sync Your Bucket Items</h2>
              <p className="text-sm text-muted-foreground">
                Push your tasks with due dates to Google Calendar so you never miss a deadline.
              </p>
              
              {itemsWithDueDate.length > 0 && (
                <Button 
                  onClick={handleSyncAll} 
                  disabled={syncing}
                  className="w-full"
                  data-testid="button-sync-all"
                >
                  {syncing ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Syncing...
                    </>
                  ) : (
                    <>Sync All ({itemsWithDueDate.length} items)</>
                  )}
                </Button>
              )}
            </div>

            {/* Items to Sync */}
            {itemsWithDueDate.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Items with Due Dates
                </h3>
                {itemsWithDueDate.map(item => (
                  <div 
                    key={item.id} 
                    className="bg-card border rounded-xl p-3 flex items-center justify-between gap-3"
                    data-testid={`item-sync-${item.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.dueDate && format(item.dueDate, 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleSyncItem(item)}
                      disabled={syncing}
                      data-testid={`button-sync-item-${item.id}`}
                    >
                      <CalendarDays size={14} className="mr-1" />
                      Sync
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Calendar Events */}
            {events.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Upcoming Google Calendar Events
                </h3>
                <div className="space-y-2">
                  {events.slice(0, 10).map(event => (
                    <div 
                      key={event.id} 
                      className="bg-card border rounded-xl p-3"
                      data-testid={`event-${event.id}`}
                    >
                      <p className="font-medium text-sm">{event.summary}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.start.dateTime 
                          ? format(new Date(event.start.dateTime), 'MMM d, h:mm a')
                          : event.start.date 
                            ? format(new Date(event.start.date), 'MMM d, yyyy')
                            : 'No date'
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-muted/30 p-8 rounded-2xl border border-dashed text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center opacity-50">
              <Calendar size={32} />
            </div>
            <h3 className="font-bold">Connect Your Google Account</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              The Google Calendar connection has been set up. Click refresh to check the connection status.
            </p>
            <Button onClick={checkConnectionAndLoadEvents} data-testid="button-check-connection">
              <RefreshCw size={16} className="mr-2" />
              Check Connection
            </Button>
          </div>
        )}

        {/* iCloud Note */}
        <div className="pt-4 border-t">
          <div className="bg-muted/30 p-4 rounded-xl text-center">
            <p className="text-xs text-muted-foreground">
              iCloud Calendar sync is not available for web apps due to Apple's restrictions. 
              Use Google Calendar for the best experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
