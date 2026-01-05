import { useApp } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Coins } from 'lucide-react';

export function CoinDisplay() {
  const { user, partner } = useApp();

  return (
    <div className="flex gap-2">
      <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm border border-amber-200/50">
        <Coins size={14} className="fill-current" />
        <span>{user.jointCoins}</span>
      </div>
      
      <div className="flex items-center gap-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm border border-violet-200/50">
        <div className="w-3.5 h-3.5 rounded-full bg-current opacity-50" /> 
        <span>{user.personalCoins}</span>
      </div>
    </div>
  );
}
