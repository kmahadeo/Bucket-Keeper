import { Link, useLocation } from 'wouter';
import { Home, ListTodo, ShoppingBag, Archive, Plus, Calendar, Clock, AlertTriangle, User, Repeat } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
  const { addItem, activeBucket, user, partner } = useApp();
  const [title, setTitle] = useState('');
  const [coins, setCoins] = useState('10');
  const [type, setType] = useState('task');
  const [open, setOpen] = useState(false);
  const [syncCalendar, setSyncCalendar] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [reminder, setReminder] = useState(false);
  const [priority, setPriority] = useState('medium');
  const [frequency, setFrequency] = useState('once');
  const [assignee, setAssignee] = useState<string>('unassigned');

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
      reminders: reminder ? ['10:00 AM'] : undefined,
      priority: priority as any,
      frequency: frequency === 'once' ? undefined : frequency as any,
      assigneeId: assignee === 'unassigned' ? undefined : assignee,
    });
    
    // Reset and Close
    setTitle('');
    setOpen(false);
    setType('task');
    setSyncCalendar(false);
    setDate(undefined);
    setReminder(false);
    setPriority('medium');
    setFrequency('once');
    setAssignee('unassigned');
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
      <DrawerContent className="max-w-md mx-auto h-[90vh]">
        <div className="mx-auto w-full max-w-sm h-full flex flex-col">
          <DrawerHeader>
            <DrawerTitle>Add to {activeBucket} Bucket</DrawerTitle>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className="p-4 space-y-6 flex-1 overflow-y-auto pb-8">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-base">What needs doing?</Label>
              <Input 
                id="title"
                placeholder="e.g. Wash the car..." 
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
                    <SelectItem value="chore">Chore 🧹</SelectItem>
                    <SelectItem value="habit">Habit 🔄</SelectItem>
                    <SelectItem value="event">Event 📅</SelectItem>
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

            {/* Expanded Options */}
            <div className="space-y-4 pt-2">
              
              {/* Assignee */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assignee</Label>
                <div className="flex gap-2">
                   <div 
                     className={cn(
                       "flex-1 p-2 rounded-lg border flex flex-col items-center gap-1 cursor-pointer transition-all",
                       assignee === user.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                     )}
                     onClick={() => setAssignee(user.id)}
                   >
                     <Avatar className="w-8 h-8"><AvatarImage src={user.avatar} /></Avatar>
                     <span className="text-[10px] font-medium">Me</span>
                   </div>
                   <div 
                     className={cn(
                       "flex-1 p-2 rounded-lg border flex flex-col items-center gap-1 cursor-pointer transition-all",
                       assignee === partner.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                     )}
                     onClick={() => setAssignee(partner.id)}
                   >
                     <Avatar className="w-8 h-8"><AvatarImage src={partner.avatar} /></Avatar>
                     <span className="text-[10px] font-medium">{partner.name}</span>
                   </div>
                   <div 
                     className={cn(
                       "flex-1 p-2 rounded-lg border flex flex-col items-center gap-1 cursor-pointer transition-all",
                       assignee === 'unassigned' ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                     )}
                     onClick={() => setAssignee('unassigned')}
                   >
                     <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><User size={16} /></div>
                     <span className="text-[10px] font-medium">Anyone</span>
                   </div>
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Priority</Label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map((p) => (
                    <div 
                      key={p}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-lg border text-center text-xs font-medium capitalize cursor-pointer transition-all",
                        priority === p 
                          ? p === 'high' ? "bg-red-100 border-red-200 text-red-700" : p === 'medium' ? "bg-amber-100 border-amber-200 text-amber-700" : "bg-blue-100 border-blue-200 text-blue-700"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => setPriority(p)}
                    >
                      {p === 'high' && <AlertTriangle size={12} className="inline mr-1" />}
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="daily">Daily ☀️</SelectItem>
                    <SelectItem value="weekly">Weekly 📅</SelectItem>
                    <SelectItem value="monthly">Monthly 🗓️</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date & Extras */}
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
            </div>

            <Button type="submit" className="w-full text-lg h-12 rounded-xl mt-auto shadow-lg shadow-primary/20">
              Add Item
            </Button>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
