import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Mood } from '@/lib/store';

interface AvatarProps {
  src: string;
  mood: Mood | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function TamagotchiAvatar({ src, mood, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const moodColors: Record<string, string> = {
    happy: 'ring-green-400',
    energized: 'ring-yellow-400',
    calm: 'ring-blue-300',
    tired: 'ring-slate-400',
    stressed: 'ring-red-400',
    anxious: 'ring-orange-400',
    sad: 'ring-indigo-400',
    irritated: 'ring-rose-500',
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <motion.div
        className={cn(
          "rounded-full p-1 bg-background relative z-10 ring-offset-2 ring-offset-background transition-all duration-300",
          sizeClasses[size],
          mood && "ring-2",
          mood && moodColors[mood]
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img 
          src={src} 
          alt="Avatar" 
          className="w-full h-full object-cover rounded-full bg-secondary/10"
        />
      </motion.div>
      
      {mood && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 shadow-sm z-20"
        >
          <div className={cn("w-4 h-4 rounded-full border border-background", moodColors[mood].replace('ring-', 'bg-'))} />
        </motion.div>
      )}
    </div>
  );
}
