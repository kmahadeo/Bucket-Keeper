import { Link, useLocation } from 'wouter';
import { Home, ListTodo, ShoppingBag, Archive, Plus, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useApp } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <div className="app-container flex flex-col min-h-screen bg-background text-foreground font-sans overflow-hidden">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg border-t border-border z-50 pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          <NavLink to="/" icon={Home} label="Home" active={isActive('/')} />
          <NavLink to="/buckets" icon={ListTodo} label="Buckets" active={isActive('/buckets')} />
          
          <AddItemFab />

          <NavLink to="/store" icon={ShoppingBag} label="Store" active={isActive('/store')} />
          <NavLink to="/archive" icon={Archive} label="Archive" active={isActive('/archive')} />
        </div>
      </nav>
    </div>
  );
}

function NavLink({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) {
  return (
    <Link href={to}>
      <a className={cn(
        "flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors duration-200 tap-active",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}>
        <Icon size={24} strokeWidth={active ? 2.5 : 2} />
        <span className="text-[10px] font-medium">{label}</span>
      </a>
    </Link>
  );
}

function AddItemFab() {
  const { addItem, activeBucket } = useApp();
  const [title, setTitle] = useState('');
  const [coins, setCoins] = useState('10');
  const [type, setType] = useState('task');
  const [open, setOpen] = useState(false);
  const [syncCalendar, setSyncCalendar] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [reminder, setReminder] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addItem({
      title,
      type: type as any,
      bucket: activeBucket, // Default to current view or joint
      coinsReward: parseInt(coins),
      dueDate: date,
      syncToCalendar: syncCalendar,
      reminders: reminder ? ['10:00 AM'] : undefined
    });
    setTitle('');
    setOpen(false);
    // Reset form
    setType('task');
    setSyncCalendar(false);
    setDate(undefined);
    setReminder(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className="-mt-6 p-1 bg-background rounded-full shadow-lg cursor-pointer tap-active">
          <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-primary/30 shadow-xl text-white hover:scale-105 transition-transform">
            <Plus size={28} strokeWidth={3} />
          </div>
        </div>
      </DrawerTrigger>
      <DrawerContent className="max-w-md mx-auto h-[85vh]">
        <div className="mx-auto w-full max-w-sm h-full flex flex-col">
          <DrawerHeader>
            <DrawerTitle>Add to {activeBucket} Bucket</DrawerTitle>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className="p-4 space-y-6 flex-1 overflow-y-auto">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-base">What needs doing?</Label>
              <Input 
                id="title"
                placeholder="e.g. Plan anniversary dinner..." 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                className="text-lg h-12"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Task ✅</SelectItem>
                    <SelectItem value="event">Event 📅</SelectItem>
                    <SelectItem value="routine">Routine 🔄</SelectItem>
                    <SelectItem value="calendar">Calendar 📆</SelectItem>
                    <SelectItem value="schedule">Schedule 🕒</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                 <Label>Reward</Label>
                 <Select value={coins} onValueChange={setCoins}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 🪙 (Tiny)</SelectItem>
                    <SelectItem value="10">10 🪙 (Small)</SelectItem>
                    <SelectItem value="25">25 🪙 (Medium)</SelectItem>
                    <SelectItem value="50">50 🪙 (Big)</SelectItem>
                    <SelectItem value="100">100 🪙 (Huge)</SelectItem>
                  </SelectContent>
                 </Select>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <Label className="cursor-pointer">Due Date</Label>
                    <div className="text-xs text-muted-foreground">
                      {date ? format(date, "PPP") : "No date set"}
                    </div>
                  </div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">Pick Date</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {date && (
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg text-green-600">
                      <Clock size={18} />
                    </div>
                    <div>
                      <Label htmlFor="sync" className="cursor-pointer">Sync to Calendar</Label>
                      <p className="text-xs text-muted-foreground">Google / Apple / Outlook</p>
                    </div>
                  </div>
                  <Switch id="sync" checked={syncCalendar} onCheckedChange={setSyncCalendar} />
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg text-amber-600">
                      <Clock size={18} />
                    </div>
                    <div>
                      <Label htmlFor="remind" className="cursor-pointer">Set Reminder</Label>
                      <p className="text-xs text-muted-foreground">Push notifications</p>
                    </div>
                  </div>
                  <Switch id="remind" checked={reminder} onCheckedChange={setReminder} />
              </div>
            </div>

            <Button type="submit" className="w-full text-lg h-12 rounded-xl mt-auto">
              Add Item
            </Button>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
