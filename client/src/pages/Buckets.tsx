import { useApp, BucketType } from '@/lib/store';
import { BucketItem } from '@/components/ui/BucketItem';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function Buckets() {
  const { items, activeBucket, setActiveBucket } = useApp();

  const filteredItems = items.filter(item => {
    if (activeBucket === 'partner') return item.bucket === 'partner'; // In real app, only shared ones
    return item.bucket === activeBucket;
  });

  const buckets: { id: BucketType; label: string; icon: string }[] = [
    { id: 'joint', label: 'Us', icon: '💞' },
    { id: 'personal', label: 'Me', icon: '👤' },
    { id: 'partner', label: 'Partner', icon: '👀' },
  ];

  return (
    <div className="p-6 min-h-screen bg-background">
      <h1 className="text-2xl font-display font-bold mb-6">Buckets</h1>

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
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <BucketItem key={item.id} item={item} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
                 <div className="text-4xl grayscale">🪣</div>
                 <p className="text-muted-foreground font-medium">This bucket is empty!</p>
              </div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
