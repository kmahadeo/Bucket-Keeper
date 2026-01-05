import { useApp, BucketType, User } from '@/lib/store';
import { BucketItem } from '@/components/ui/BucketItem';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Calendar as CalendarIcon, List as ListIcon, LayoutGrid, Sparkles } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function Buckets() {
  const { items, activeBucket, setActiveBucket, user, partner } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'household'>('list');
  const [date, setDate] = useState<Date | undefined>(new Date());

  const filteredItems = items.filter(item => {
    if (viewMode === 'household') return true; // Show all relevant for household view
    if (activeBucket === 'partner') return item.bucket === 'partner';
    return item.bucket === activeBucket;
  });

  const buckets: { id: BucketType; label: string; icon: string }[] = [
    { id: 'joint', label: 'Us', icon: '💞' },
    { id: 'personal', label: 'Me', icon: '👤' },
    { id: 'partner', label: 'Partner', icon: '👀' },
  ];

  return (
    <div className="p-6 min-h-screen bg-background pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold">Buckets</h1>
        <div className="flex bg-muted/50 p-1 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0 rounded-md", viewMode === 'list' && "bg-background shadow-sm")}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <ListIcon size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0 rounded-md", viewMode === 'calendar' && "bg-background shadow-sm")}
            onClick={() => setViewMode('calendar')}
            title="Calendar View"
          >
            <CalendarIcon size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0 rounded-md", viewMode === 'household' && "bg-background shadow-sm")}
            onClick={() => {
              setViewMode('household');
              setActiveBucket('joint'); // Default to joint context for household
            }}
            title="Household & Habits"
          >
            <LayoutGrid size={16} />
          </Button>
        </div>
      </div>

      {viewMode !== 'household' && (
        <Tabs 
          defaultValue="joint" 
          value={activeBucket} 
          onValueChange={(v) => setActiveBucket(v as BucketType)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1 h-12 rounded-xl">
            {buckets.map(b => (
              <TabsTrigger 
                key={b.id} 
                value={b.id}
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-xs font-medium"
              >
                <span className="mr-1.5 text-base">{b.icon}</span>
                {b.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeBucket} className="space-y-4 outline-none">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {viewMode === 'list' ? (
                filteredItems.length > 0 ? (
                  filteredItems.map(item => (
                    <BucketItem key={item.id} item={item} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
                     <div className="text-4xl grayscale">🪣</div>
                     <p className="text-muted-foreground font-medium">This bucket is empty!</p>
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <div className="bg-card border rounded-2xl p-4 shadow-sm">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border-0"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm text-muted-foreground">Events on this day</h3>
                    {filteredItems.filter(i => i.dueDate && date && i.dueDate.toDateString() === date.toDateString()).length > 0 ? (
                      filteredItems.filter(i => i.dueDate && date && i.dueDate.toDateString() === date.toDateString()).map(item => (
                        <BucketItem key={item.id} item={item} />
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground italic p-4 text-center border border-dashed rounded-xl">
                        No events planned.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      )}

      {viewMode === 'household' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          {/* AI Banner */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900 flex gap-3 items-start">
            <Sparkles className="text-indigo-500 mt-1 flex-shrink-0" size={18} />
            <div>
               <h3 className="font-bold text-sm text-indigo-900 dark:text-indigo-100">AI Insight</h3>
               <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed mt-1">
                 Margaux has done 80% of the laundry this month. Maybe Kaushik can take the next load?
               </p>
            </div>
          </div>

          {/* User Columns */}
          <div className="grid grid-cols-2 gap-4">
             <UserColumn user={user} items={items} />
             <UserColumn user={partner} items={items} />
          </div>

          {/* Unassigned / Shared */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Unassigned / Joint</h3>
            {items.filter(i => (i.type === 'chore' || i.type === 'habit') && !i.assigneeId).length > 0 ? (
               items.filter(i => (i.type === 'chore' || i.type === 'habit') && !i.assigneeId).map(item => (
                 <BucketItem key={item.id} item={item} />
               ))
            ) : (
              <div className="text-center py-4 bg-muted/20 rounded-xl border border-dashed text-xs text-muted-foreground">
                All chores assigned! 🧹
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function UserColumn({ user, items }: { user: User, items: any[] }) {
  const userItems = items.filter(i => (i.type === 'chore' || i.type === 'habit') && i.assigneeId === user.id);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Avatar className="w-8 h-8 border-2 border-background shadow-sm">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <h3 className="font-bold text-sm truncate">{user.name}</h3>
          <p className="text-[10px] text-muted-foreground truncate">{userItems.length} routines</p>
        </div>
      </div>
      
      <div className="space-y-2 min-h-[100px]">
        {userItems.length > 0 ? (
          userItems.map(item => (
            <div key={item.id} className="bg-card border rounded-lg p-2.5 shadow-sm text-sm flex flex-col gap-1">
              <span className="font-medium truncate">{item.title}</span>
              {item.frequency && (
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md self-start">
                  {item.frequency}
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center bg-muted/10 rounded-xl border border-dashed text-xs text-muted-foreground p-4 text-center">
            No routines yet
          </div>
        )}
      </div>
    </div>
  );
}
