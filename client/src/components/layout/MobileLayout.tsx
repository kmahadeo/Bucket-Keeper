import { Link, useLocation } from 'wouter';
import { Home, ListTodo, ShoppingBag, Archive, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useApp } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addItem({
      title,
      type: 'task',
      bucket: activeBucket, // Default to current view or joint
      coinsReward: parseInt(coins),
    });
    setTitle('');
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className="-mt-6 p-1 bg-background rounded-full shadow-lg cursor-pointer tap-active">
          <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-primary/30 shadow-xl text-white">
            <Plus size={28} strokeWidth={3} />
          </div>
        </div>
      </DrawerTrigger>
      <DrawerContent className="max-w-md mx-auto">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Add to Bucket</DrawerTitle>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">What needs doing?</label>
              <Input 
                placeholder="e.g. Plan anniversary dinner..." 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                className="text-lg"
              />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                 <label className="text-sm font-medium">Coins Reward</label>
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
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Type</label>
                <div className="flex h-10 items-center px-3 border rounded-md text-sm text-muted-foreground bg-muted/50">
                  Task
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full text-lg h-12 rounded-xl mt-4">
              Add to {activeBucket} bucket
            </Button>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
