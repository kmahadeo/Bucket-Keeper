import { motion } from 'framer-motion';
import { Check, Clock, Calendar, Repeat, User as UserIcon, AlertTriangle, AlertCircle, Briefcase, Zap, Home, ShoppingCart } from 'lucide-react';
import { BucketItem as BucketItemType, useApp } from '@/lib/store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface BucketItemProps {
  item: BucketItemType;
  compact?: boolean;
}

export function BucketItem({ item, compact }: BucketItemProps) {
  const { toggleItem, user, partner } = useApp();

  const assignee = item.assigneeId === user.id ? user : (item.assigneeId === partner.id ? partner : null);

  const priorityColor = item.priority === 'high' 
    ? 'border-l-red-500' 
    : item.priority === 'medium' 
      ? 'border-l-amber-500' 
      : 'border-l-transparent';

  // --- Type Config (Color Coding) ---
  const typeConfig = {
    task: { color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20", icon: Briefcase, label: "Task" },
    chore: { color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20", icon: Home, label: "Chore" },
    habit: { color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20", icon: Zap, label: "Habit" },
    event: { color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20", icon: Calendar, label: "Event" },
    calendar: { color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20", icon: Calendar, label: "Cal" }, // Map to Event visually
    schedule: { color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20", icon: Clock, label: "Sched" },
    routine: { color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20", icon: Repeat, label: "Routine" }, // Map to Habit visually
  };

  const config = typeConfig[item.type as keyof typeof typeConfig] || typeConfig.task;
  const TypeIcon = config.icon;

  if (compact) {
    return (
      <motion.div 
        layout
        className={cn(
          "flex items-center gap-3 p-3 bg-card border rounded-lg shadow-sm mb-2",
          item.completed && "opacity-50"
        )}
      >
         <div className={cn("w-1.5 h-8 rounded-full", item.priority === 'high' ? 'bg-red-500' : (item.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-300'))} />
         <div className="flex-1 min-w-0">
           <h4 className={cn("text-sm font-medium truncate", item.completed && "line-through")}>{item.title}</h4>
           <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
             <span className={cn("px-1.5 py-0.5 rounded-md font-medium", config.color)}>{config.label}</span>
             {item.dueDate && <span>{format(new Date(item.dueDate), 'h:mm a')}</span>}
           </div>
         </div>
         <button onClick={() => toggleItem(item.id)} className={cn("w-5 h-5 rounded-full border flex items-center justify-center", item.completed ? "bg-primary border-primary text-white" : "border-muted-foreground")}>
           {item.completed && <Check size={12} />}
         </button>
      </motion.div>
    )
  }

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
          <div className="flex flex-wrap items-center gap-2 mt-2">
            
            {/* Type Badge (Color Coded) */}
            <span className={cn(
              "inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md",
              config.color
            )}>
              <TypeIcon size={10} className="mr-1" />
              {config.label}
            </span>

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
