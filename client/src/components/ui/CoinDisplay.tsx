import { useApp } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Coins, PiggyBank } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function CoinDisplay() {
  const { user, partner } = useApp();

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 px-4 py-2 rounded-2xl text-sm font-bold shadow-sm border border-amber-200/50 hover:bg-amber-200/50 transition-colors tap-active">
            <div className="bg-amber-400 rounded-full p-1 text-white shadow-inner">
               <PiggyBank size={14} className="fill-current" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] opacity-70 uppercase tracking-wider">Joint</span>
              <span>{user.jointCoins}</span>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-60">
          <div className="space-y-2">
            <h4 className="font-medium text-sm border-b pb-2 mb-2">Joint Wallet</h4>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Your Contribution</span>
              <span className="font-bold text-amber-600">60%</span>
            </div>
             <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Partner Contribution</span>
              <span className="font-bold text-amber-600">40%</span>
            </div>
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded mt-2">
              Earned from Joint Tasks like "Date Night" and "Groceries".
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-900 dark:text-violet-100 px-4 py-2 rounded-2xl text-sm font-bold shadow-sm border border-violet-200/50 hover:bg-violet-200/50 transition-colors tap-active">
            <div className="bg-violet-400 rounded-full p-1 text-white shadow-inner">
               <Coins size={14} className="fill-current" />
            </div>
             <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] opacity-70 uppercase tracking-wider">Personal</span>
              <span>{user.personalCoins}</span>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-60">
           <div className="space-y-2">
            <h4 className="font-medium text-sm border-b pb-2 mb-2">Personal Stash</h4>
             <div className="text-xs text-muted-foreground bg-muted p-2 rounded mt-2">
              Spend these on "Treat Yourself" rewards or gifts for your partner.
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
