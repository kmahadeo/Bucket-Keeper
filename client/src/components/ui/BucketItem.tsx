import { motion } from 'framer-motion';
import { Check, Clock, Calendar, Repeat, User as UserIcon, AlertTriangle, AlertCircle } from 'lucide-react';
import { BucketItem as BucketItemType, useApp } from '@/lib/store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface BucketItemProps {
  item: BucketItemType;
}

export function BucketItem({ item }: BucketItemProps) {
  const { toggleItem, user, partner } = useApp();

  const assignee = item.assigneeId === user.id ? user : (item.assigneeId === partner.id ? partner : null);

  const priorityColor = item.priority === 'high' 
    ? 'border-l-red-500' 
    : item.priority === 'medium' 
      ? 'border-l-amber-500' 
      : 'border-l-transparent';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-all hover:shadow-md",
        item.completed && "opacity-60 bg-muted/30",
        item.priority && `border-l-4 ${priorityColor}`
      )}
    >
      <div 
        className="p-4 flex items-start gap-4 cursor-pointer" 
        onClick={() => toggleItem(item.id)}
      >
        {/* Checkbox */}
        <div className={cn(
          "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors mt-0.5",
          item.completed 
            ? "bg-primary border-primary text-primary-foreground" 
            : "border-muted-foreground/30 group-hover:border-primary/50"
        )}>
          {item.completed && <Check size={14} strokeWidth={3} />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
             <h3 className={cn(
               "font-medium leading-tight truncate pr-2",
               item.completed && "line-through text-muted-foreground"
             )}>
               {item.title}
             </h3>
             {item.conflictPotential && !item.completed && (
               <AlertCircle size={14} className="text-orange-500 flex-shrink-0" />
             )}
          </div>
          
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {/* Coins */}
            <span className="inline-flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-md border border-amber-200/50">
              +{item.coinsReward} 🪙
            </span>

            {/* Date */}
            {item.dueDate && (
              <span className={cn(
                "inline-flex items-center text-[10px] text-muted-foreground",
                item.dueDate < new Date() && !item.completed && "text-destructive font-medium"
              )}>
                <Calendar size={10} className="mr-1" />
                {format(new Date(item.dueDate), 'MMM d')}
              </span>
            )}

            {/* Recurring */}
            {item.frequency && (
              <span className="inline-flex items-center text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-md">
                <Repeat size={10} className="mr-1" />
                {item.frequency}
              </span>
            )}

             {/* Assignee */}
             {assignee && (
               <span className="inline-flex items-center text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full pl-0.5">
                 <img src={assignee.avatar} alt={assignee.name} className="w-3 h-3 rounded-full mr-1" />
                 {assignee.name}
               </span>
             )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
