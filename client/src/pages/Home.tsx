import { useApp } from '@/lib/store';
import { TamagotchiAvatar } from '@/components/ui/TamagotchiAvatar';
import { CoinDisplay } from '@/components/ui/CoinDisplay';
import { BucketItem } from '@/components/ui/BucketItem';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Zap, Settings as SettingsIcon, AlertTriangle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'wouter';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"

export default function Home() {
  const { user, partner, items } = useApp();
  const [conflictResolved, setConflictResolved] = useState(false);

  const todaysItems = items
    .filter(i => !i.completed)
    .sort((a, b) => (b.coinsReward - a.coinsReward))
    .slice(0, 3);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">
            Good Morning, {user.name}!
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM do')}
          </p>
        </div>
        <div className="flex items-center gap-2">
           <CoinDisplay />
           <Link href="/settings">
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
               <SettingsIcon size={18} />
             </Button>
           </Link>
        </div>
      </header>

      {/* Hero / Avatar Stage */}
      <section className="relative h-48 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 shadow-inner overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-4 left-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute bottom-4 right-4 w-32 h-32 bg-secondary/5 rounded-full blur-2xl" />

        <div className="flex items-end gap-6 z-10">
          <div className="flex flex-col items-center gap-2">
             <TamagotchiAvatar src={user.avatar} mood={user.mood} size="lg" />
             <span className="text-xs font-medium bg-white/50 dark:bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
               You
             </span>
          </div>
          
          <div className="mb-8">
            <Heart className="text-rose-400 fill-rose-400 animate-pulse" size={24} />
          </div>

          <div className="flex flex-col items-center gap-2">
             <TamagotchiAvatar src={partner.avatar} mood={partner.mood} size="lg" />
             <span className="text-xs font-medium bg-white/50 dark:bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
               {partner.name}
             </span>
          </div>
        </div>

        {/* Vibe Status */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1.5 bg-white/80 dark:bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-white/20">
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-xs font-semibold">Vibe: Good</span>
          </div>
        </div>
      </section>

      {/* AI Conflict Alert (Demo) */}
      <AnimatePresence>
        {!conflictResolved && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Dialog>
              <DialogTrigger asChild>
                <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 p-4 rounded-xl flex items-start gap-3 cursor-pointer tap-active">
                  <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full text-orange-600 dark:text-orange-400">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-orange-800 dark:text-orange-200">Schedule Conflict Detected!</h3>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                      "Date Night" overlaps with "Poker Night". Tap to resolve with AI.
                    </p>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="text-primary" size={18} />
                    AI Conflict Resolution
                  </DialogTitle>
                  <DialogDescription>
                    Gemini noticed a double-booking on Friday evening. Here are some smart compromises based on your calendars.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="bg-muted/50 p-3 rounded-lg border border-muted text-sm space-y-2">
                     <div className="flex justify-between font-medium">
                       <span className="text-muted-foreground">Option A</span>
                       <span className="text-green-600 font-bold">Recommended</span>
                     </div>
                     <p>Move <strong>Date Night</strong> to Saturday at 7:00 PM. Keep Poker Night as is.</p>
                  </div>
                  
                  <div className="bg-muted/30 p-3 rounded-lg border border-muted text-sm opacity-80">
                     <div className="flex justify-between font-medium">
                       <span className="text-muted-foreground">Option B</span>
                     </div>
                     <p>Shorten <strong>Poker Night</strong> to end by 8:00 PM. Start Date Night late.</p>
                  </div>
                </div>

                <DialogFooter className="sm:justify-start gap-2">
                  <Button type="button" onClick={() => setConflictResolved(true)} className="flex-1 bg-primary">
                    Accept Option A
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setConflictResolved(true)} className="flex-1">
                    Dismiss
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Focus Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Zap size={18} className="text-amber-500 fill-amber-500" />
            Top Priorities
          </h2>
          <Button variant="ghost" size="sm" className="text-xs h-8">View All</Button>
        </div>

        <div className="space-y-1">
          {todaysItems.length > 0 ? (
            todaysItems.map(item => (
              <BucketItem key={item.id} item={item} />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm bg-muted/20 rounded-xl border border-dashed border-muted">
              Nothing urgent! Go have fun. 🎉
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions (Mockup) */}
      <section className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 rounded-2xl border-dashed border-primary/30 hover:bg-primary/5 hover:border-primary">
          <span className="text-2xl">🎲</span>
          <span className="text-xs font-semibold">Roll for Date</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 rounded-2xl border-dashed border-secondary/30 hover:bg-secondary/5 hover:border-secondary">
          <span className="text-2xl">💌</span>
          <span className="text-xs font-semibold">Send Love Note</span>
        </Button>
      </section>
    </div>
  );
}
