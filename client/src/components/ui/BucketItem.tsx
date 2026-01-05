import { motion } from 'framer-motion';
import { BucketItem as BucketItemType, useApp } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Check, Clock, Coins, Calendar, Repeat } from 'lucide-react';
import { format } from 'date-fns';

export function BucketItem({ item }: { item: BucketItemType }) {
  const { toggleItem, deleteItem } = useApp();

  const isOverdue = item.dueDate && new Date() > item.dueDate && !item.completed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative flex items-center p-4 bg-card rounded-2xl border border-border/50 shadow-sm transition-all hover:shadow-md mb-3",
        item.completed && "opacity-60 bg-muted/30"
      )}
    >
      {/* Checkbox / Action */}
      <button
        onClick={() => toggleItem(item.id)}
        className={cn(
          "flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors duration-200 tap-active",
          item.completed 
            ? "bg-primary border-primary text-primary-foreground" 
            : "border-muted-foreground/30 hover:border-primary"
        )}
      >
        {item.completed && <Check size={14} strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "font-medium text-base truncate pr-2 transition-all",
          item.completed && "line-through text-muted-foreground"
        )}>
          {item.title}
        </h3>
        
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 font-medium text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md">
            <Coins size={10} />
            <span>{item.coinsReward}</span>
          </div>

          {item.dueDate && (
            <div className={cn(
              "flex items-center gap-1",
              isOverdue && "text-destructive font-medium"
            )}>
              <Calendar size={10} />
              <span>{format(new Date(item.dueDate), 'MMM d')}</span>
            </div>
          )}

          {item.type === 'routine' && (
             <div className="flex items-center gap-1">
               <Repeat size={10} />
               <span>Daily</span>
             </div>
          )}
        </div>
      </div>

      {/* Delete (Visible on hover/long press logic typically, just keeping it clean for now) */}
      <button 
        onClick={() => deleteItem(item.id)}
        className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-opacity"
      >
        <span className="sr-only">Delete</span>
        <div className="w-1.5 h-1.5 rounded-full bg-current" />
      </button>
    </motion.div>
  );
}
