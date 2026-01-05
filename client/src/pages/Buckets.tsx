import { useApp, BucketType } from '@/lib/store';
import { BucketItem } from '@/components/ui/BucketItem';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Calendar as CalendarIcon, List as ListIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

export default function Buckets() {
  const { items, activeBucket, setActiveBucket } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [date, setDate] = useState<Date | undefined>(new Date());

  const filteredItems = items.filter(item => {
    if (activeBucket === 'partner') return item.bucket === 'partner';
    return item.bucket === activeBucket;
  });

  const buckets: { id: BucketType; label: string; icon: string }[] = [
    { id: 'joint', label: 'Us', icon: '💞' },
    { id: 'personal', label: 'Me', icon: '👤' },
    { id: 'partner', label: 'Partner', icon: '👀' },
  ];

  return (
    <div className="p-6 min-h-screen bg-background">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-bold">Buckets</h1>
        <div className="flex bg-muted/50 p-1 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0 rounded-md", viewMode === 'list' && "bg-background shadow-sm")}
            onClick={() => setViewMode('list')}
          >
            <ListIcon size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0 rounded-md", viewMode === 'calendar' && "bg-background shadow-sm")}
            onClick={() => setViewMode('calendar')}
          >
            <CalendarIcon size={16} />
          </Button>
        </div>
      </div>

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
    </div>
  );
}
