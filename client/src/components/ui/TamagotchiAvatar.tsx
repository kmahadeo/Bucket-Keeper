import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Mood } from '@/lib/store';
import { Smile, Zap, Coffee, CloudRain, Flame, AlertCircle } from 'lucide-react';

interface AvatarProps {
  src: string;
  mood: Mood | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isPartner?: boolean;
}

export function TamagotchiAvatar({ src, mood, size = 'md', className, isPartner }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  };

  const moodConfig: Record<string, { color: string; icon: any; label: string }> = {
    happy: { color: 'bg-green-100 text-green-600 border-green-200', icon: Smile, label: 'Happy' },
    energized: { color: 'bg-yellow-100 text-yellow-600 border-yellow-200', icon: Zap, label: 'Energized' },
    calm: { color: 'bg-blue-100 text-blue-600 border-blue-200', icon: Coffee, label: 'Calm' },
    tired: { color: 'bg-slate-100 text-slate-600 border-slate-200', icon: CloudRain, label: 'Tired' },
    stressed: { color: 'bg-red-100 text-red-600 border-red-200', icon: Flame, label: 'Stressed' },
    anxious: { color: 'bg-orange-100 text-orange-600 border-orange-200', icon: AlertCircle, label: 'Anxious' },
  };

  const currentMood = mood ? moodConfig[mood] : null;
  const MoodIcon = currentMood?.icon;

  return (
    <div className={cn("relative flex flex-col items-center gap-3", className)}>
      {/* Dynamic Halo/Aura */}
      <div className="relative">
        {mood && (
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "absolute inset-0 rounded-full blur-xl",
              currentMood?.color.split(' ')[0].replace('bg-', 'bg-') // Extract bg color for glow
            )}
          />
        )}

        {/* The Avatar Itself */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: isPartner ? 1 : 0 
          }}
          className={cn(
            "relative z-10 rounded-full p-1.5 bg-background shadow-xl ring-4 ring-offset-4 ring-offset-background transition-all duration-300",
            sizeClasses[size],
            currentMood ? currentMood.color.split(' ')[2].replace('border-', 'ring-') : 'ring-muted'
          )}
        >
          <img 
            src={src} 
            alt="Avatar" 
            className="w-full h-full object-cover rounded-full bg-secondary/10"
          />
        </motion.div>

        {/* Mood Bubble (Floating, not overlaying face) */}
        {currentMood && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "absolute -top-2 -right-2 z-20 rounded-full p-2 shadow-lg border-2 border-white dark:border-zinc-900 flex items-center justify-center",
              currentMood.color
            )}
          >
            <MoodIcon size={16} strokeWidth={3} />
          </motion.div>
        )}
      </div>
      
      {/* Label (Outside) */}
      <div className="text-center space-y-0.5">
         <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
           {mood || "Neutral"}
         </span>
      </div>
    </div>
  );
}
