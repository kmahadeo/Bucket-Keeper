import { useApp } from '@/lib/store';
import { format } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';

export default function Archive() {
  const { items } = useApp();
  const completedItems = items.filter(i => i.completed).sort((a, b) => {
    return new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime();
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-display font-bold mb-2">Memory Archive</h1>
      <p className="text-muted-foreground mb-8 text-sm">Everything you've accomplished together.</p>

      <div className="relative border-l-2 border-muted ml-3 space-y-8">
        {completedItems.map((item, i) => (
          <div key={item.id} className="relative pl-8">
            <div className="absolute -left-[9px] top-1 bg-background">
               <CheckCircle2 className="text-green-500 bg-background" size={16} />
            </div>
            
            <div className="bg-white/50 dark:bg-zinc-800/50 p-4 rounded-xl border border-white/20 shadow-sm backdrop-blur-sm">
              <span className="text-xs text-muted-foreground font-mono mb-1 block">
                {format(new Date(item.completedAt!), 'MMMM d, yyyy')}
              </span>
              <h3 className="font-medium text-foreground">{item.title}</h3>
              <div className="flex gap-2 mt-2">
                 <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">
                   {item.bucket} bucket
                 </span>
                 <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-sm">
                   +{item.coinsReward} 🪙
                 </span>
              </div>
            </div>
          </div>
        ))}

        {completedItems.length === 0 && (
          <div className="pl-8 py-4 text-muted-foreground text-sm">
            No memories yet. Go complete some bucket items!
          </div>
        )}
      </div>
    </div>
  );
}
