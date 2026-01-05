import { useApp } from '@/lib/store';
import { TamagotchiAvatar } from '@/components/ui/TamagotchiAvatar';
import { CoinDisplay } from '@/components/ui/CoinDisplay';
import { BucketItem } from '@/components/ui/BucketItem';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Zap, Settings as SettingsIcon, AlertTriangle, Loader2, Calendar as CalendarIcon, Wand2, Dices, Send, CalendarDays, ClipboardCheck } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'wouter';
import { useState } from 'react';
import * as api from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer"
import { Mood } from '@/lib/store';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { getUpcomingHolidays } from '@/lib/holidays';

export default function Home() {
  const { user, partner, items, updateMood } = useApp();
  const { toast } = useToast();
  const [conflictResolved, setConflictResolved] = useState(false);
  
  // AI State - Using Real Context from Backend
  const [loading, setLoading] = useState(false);
  const [dailyPlan, setDailyPlan] = useState<api.DailyPlan | null>(null);
  const [conflictData, setConflictData] = useState<api.ConflictResolution | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiLoaded, setAiLoaded] = useState(false);

  // Roll for Date State
  const [rollResult, setRollResult] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  // Love Note State
  const [loveNote, setLoveNote] = useState('');
  const [isSendingNote, setIsSendingNote] = useState(false);

  // Holidays
  const upcomingHolidays = getUpcomingHolidays(45); // 45 days ahead

  const todaysItems = items
    .filter(i => !i.completed)
    .sort((a, b) => {
      // Sort by Priority High first, then reward
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return b.coinsReward - a.coinsReward;
    })
    .slice(0, 3);

  const loadAIInsights = async () => {
    if (aiLoaded) return;
    setLoading(true);
    setError(null);
    try {
      const [plan, conflict] = await Promise.all([
        api.getDailyPlan(user.id),
        api.getConflictResolution(user.id)
      ]);
      setDailyPlan(plan);
      setConflictData(conflict);
      setAiLoaded(true);
    } catch (e) {
      setError("Failed to load AI insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRollDate = () => {
    setIsRolling(true);
    setRollResult(null);
    
    // Simulate rolling delay
    setTimeout(() => {
      const ideas = [
        "Sushi Making Night 🍣",
        "Sunset Picnic at the Park 🧺",
        "Board Game War 🎲",
        "Late Night Drive & Milkshakes 🚗",
        "Build a Blanket Fort 🏰",
        "Stargazing in the Backyard ✨"
      ];
      const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
      setRollResult(randomIdea);
      setIsRolling(false);
    }, 1500);
  };

  const handleSendLoveNote = () => {
    if (!loveNote.trim()) return;
    setIsSendingNote(true);
    
    // Simulate network delay
    setTimeout(() => {
      setIsSendingNote(false);
      setLoveNote('');
      toast({
        title: "Note Sent! 💌",
        description: `Your love note has been sent to ${partner.name}.`,
      });
    }, 1000);
  };

  const moods: { id: Mood; label: string; icon: string }[] = [
    { id: 'happy', label: 'Happy', icon: '😊' },
    { id: 'energized', label: 'Energized', icon: '⚡' },
    { id: 'calm', label: 'Calm', icon: '😌' },
    { id: 'tired', label: 'Tired', icon: '😴' },
    { id: 'stressed', label: 'Stressed', icon: '😫' },
    { id: 'anxious', label: 'Anxious', icon: '😰' },
  ];

  return (
    <div className="p-6 space-y-8 pb-32">
      {/* Header */}
      <header className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-display font-bold text-foreground">
            Hi, {user.name}
          </h1>
           <CoinDisplay />
        </div>
        
        <Link href="/settings">
             <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-muted/50">
               <SettingsIcon size={20} />
             </Button>
        </Link>
      </header>

      {/* DAY AT A GLANCE (New Feature) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
           <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Today's Snapshot</h2>
           <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{format(new Date(), 'MMM d, yyyy')}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {/* ME Column */}
           <div className="bg-card/50 border rounded-xl p-3">
             <h3 className="text-xs font-bold mb-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"/> Me</h3>
             <div className="space-y-1">
               {items.filter(i => (i.bucket === 'personal' || i.assigneeId === user.id) && !i.completed).slice(0, 2).map(item => (
                 <BucketItem key={item.id} item={item} compact />
               ))}
               {items.filter(i => (i.bucket === 'personal' || i.assigneeId === user.id) && !i.completed).length === 0 && (
                 <p className="text-[10px] text-muted-foreground italic py-2 text-center">All clear! 🎉</p>
               )}
             </div>
           </div>

           {/* US Column */}
           <div className="bg-card/50 border rounded-xl p-3">
             <h3 className="text-xs font-bold mb-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400"/> Us</h3>
             <div className="space-y-1">
               {items.filter(i => i.bucket === 'joint' && !i.completed).slice(0, 2).map(item => (
                 <BucketItem key={item.id} item={item} compact />
               ))}
               {items.filter(i => i.bucket === 'joint' && !i.completed).length === 0 && (
                 <p className="text-[10px] text-muted-foreground italic py-2 text-center">Nothing scheduled.</p>
               )}
             </div>
           </div>

           {/* PARTNER Column */}
           <div className="bg-card/50 border rounded-xl p-3 opacity-80">
             <h3 className="text-xs font-bold mb-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400"/> {partner.name}</h3>
             <div className="space-y-1">
               {items.filter(i => (i.bucket === 'partner' || i.assigneeId === partner.id) && !i.completed).slice(0, 2).map(item => (
                 <BucketItem key={item.id} item={item} compact />
               ))}
               {items.filter(i => (i.bucket === 'partner' || i.assigneeId === partner.id) && !i.completed).length === 0 && (
                 <p className="text-[10px] text-muted-foreground italic py-2 text-center">Chilling...</p>
               )}
             </div>
           </div>
        </div>
        
        {/* AI Insight for the day */}
        <div className="flex gap-3 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
           <Sparkles size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
           <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-snug">
             <strong>AI Insight:</strong> Looks like a busy day for {user.name}. Margaux, maybe you can pick up the groceries from the "Us" list?
           </p>
        </div>
      </section>

      {/* Hero / Avatar Stage */}
      <section className="relative h-72 rounded-3xl bg-gradient-to-br from-violet-50/50 to-fuchsia-50/50 dark:from-violet-950/20 dark:to-fuchsia-950/20 flex flex-col items-center justify-start pt-8 border border-white/40 dark:border-white/5 shadow-xl backdrop-blur-sm overflow-hidden">
        
        {/* Dynamic AI Background Texture */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        </div>

        {/* Avatars - Positioned Higher */}
        <div className="flex items-center gap-8 z-10 mb-6">
          <div className="flex flex-col items-center">
             <TamagotchiAvatar src={user.avatar} mood={user.mood} size="lg" />
             <span className="text-xs font-bold mt-3 text-muted-foreground bg-white/50 dark:bg-black/50 px-3 py-1 rounded-full backdrop-blur-md shadow-sm">
               You
             </span>
          </div>
          
          <div className="flex flex-col items-center justify-center mb-8">
             <motion.div 
               animate={{ scale: [1, 1.2, 1] }} 
               transition={{ duration: 2, repeat: Infinity }}
             >
               <Heart className="text-rose-400 fill-rose-400 drop-shadow-lg" size={32} />
             </motion.div>
          </div>

          <div className="flex flex-col items-center">
             <TamagotchiAvatar src={partner.avatar} mood={partner.mood} size="lg" isPartner />
             <span className="text-xs font-bold mt-3 text-muted-foreground bg-white/50 dark:bg-black/50 px-3 py-1 rounded-full backdrop-blur-md shadow-sm">
               {partner.name}
             </span>
          </div>
        </div>

        {/* Action Bar (Bottom of Card) - Better Ergonomics */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-3 z-20">
           <Drawer>
             <DrawerTrigger asChild>
                <Button variant="secondary" size="sm" className="h-9 px-4 text-xs font-semibold bg-white/80 dark:bg-black/40 backdrop-blur-md shadow-sm border border-white/20 rounded-full hover:bg-white/90 transition-all">
                  <Sparkles size={14} className="mr-1.5 text-amber-500" />
                  Vibe Check
                </Button>
             </DrawerTrigger>
             <DrawerContent>
               <div className="mx-auto w-full max-w-sm p-6">
                 <DrawerHeader>
                   <DrawerTitle className="text-center text-xl">How are you feeling?</DrawerTitle>
                 </DrawerHeader>
                 <div className="grid grid-cols-3 gap-4 mt-4">
                   {moods.map((m) => (
                     <button
                       key={m.id}
                       onClick={() => updateMood(m.id)}
                       className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${user.mood === m.id ? 'border-primary bg-primary/10' : 'border-transparent bg-muted/30 hover:bg-muted'}`}
                     >
                       <span className="text-3xl mb-2">{m.icon}</span>
                       <span className="text-xs font-medium">{m.label}</span>
                     </button>
                   ))}
                 </div>
               </div>
             </DrawerContent>
           </Drawer>

           <Dialog onOpenChange={(open) => {
             if (open && !aiLoaded) loadAIInsights();
           }}>
             <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="h-9 px-4 text-xs font-semibold bg-white/80 dark:bg-black/40 backdrop-blur-md shadow-sm border border-white/20 rounded-full text-indigo-600 dark:text-indigo-300 hover:bg-white/90 transition-all">
                  <Wand2 size={14} className="mr-1.5" />
                  AI Plan
                </Button>
             </DialogTrigger>
             <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
               <DialogHeader>
                 <DialogTitle>Your AI Daily Plan</DialogTitle>
                 <DialogDescription>Personalized insights based on your real tasks and patterns.</DialogDescription>
               </DialogHeader>
               <div className="space-y-4 py-2">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                       <Loader2 className="animate-spin text-primary" size={32} />
                       <span className="text-xs font-medium animate-pulse">Analyzing your data...</span>
                    </div>
                  ) : error ? (
                    <div className="text-destructive text-sm text-center bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                      {error}
                      <Button variant="ghost" size="sm" className="mt-2" onClick={loadAIInsights}>Try Again</Button>
                    </div>
                  ) : dailyPlan ? (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-xl border border-primary/20">
                        <p className="text-sm font-medium">{dailyPlan.greeting}</p>
                      </div>
                      
                      {dailyPlan.priorityTasks.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Focus Today</h4>
                          <ul className="space-y-1">
                            {dailyPlan.priorityTasks.map((task, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-primary">•</span>
                                {task}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                        <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1">Insight</h4>
                        <p className="text-sm text-amber-900 dark:text-amber-100">{dailyPlan.insight}</p>
                      </div>
                      
                      <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-900 dark:text-green-100">{dailyPlan.encouragement}</p>
                      </div>
                      
                      {dailyPlan.conflictWarning && (
                        <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                          <h4 className="text-xs font-bold text-orange-700 dark:text-orange-300 mb-1">Heads Up</h4>
                          <p className="text-sm text-orange-900 dark:text-orange-100">{dailyPlan.conflictWarning}</p>
                        </div>
                      )}
                      
                      {dailyPlan.rewardSuggestion && (
                        <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                          <h4 className="text-xs font-bold text-purple-700 dark:text-purple-300 mb-1">Reward Alert</h4>
                          <p className="text-sm text-purple-900 dark:text-purple-100">{dailyPlan.rewardSuggestion}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">Tap to load your personalized AI plan</p>
                    </div>
                  )}
               </div>
             </DialogContent>
           </Dialog>
        </div>
      </section>

      {/* Holiday Alert */}
      <AnimatePresence>
        {upcomingHolidays.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 p-4 rounded-2xl flex items-center gap-3 overflow-hidden"
          >
            <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
              <CalendarDays size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-100">Upcoming Holiday</h3>
              <p className="text-xs text-indigo-700 dark:text-indigo-300">
                {upcomingHolidays[0].name} is coming up! AI suggests planning ahead.
              </p>
            </div>
            <Button size="sm" variant="ghost" className="text-indigo-600">Plan</Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Check-in CTA (New) */}
      <Link href="/check-in">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 p-4 rounded-2xl flex items-center justify-between cursor-pointer tap-active shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
             <div className="bg-green-100 dark:bg-green-900 p-2.5 rounded-full text-green-600 dark:text-green-400">
               <ClipboardCheck size={24} />
             </div>
             <div>
               <h3 className="font-bold text-green-900 dark:text-green-100">Weekly Check-in</h3>
               <p className="text-xs text-green-700 dark:text-green-300">Review goals & high-priority items</p>
             </div>
          </div>
          <Button size="sm" className="bg-green-600 text-white hover:bg-green-700 rounded-lg">
            Start
          </Button>
        </div>
      </Link>

      {/* AI Conflict Alert - Based on Real Data */}
      <AnimatePresence>
        {!conflictResolved && conflictData?.hasConflict && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Dialog onOpenChange={(open) => {
              if (open && !aiLoaded) loadAIInsights();
            }}>
              <DialogTrigger asChild>
                <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 p-4 rounded-2xl flex items-start gap-3 cursor-pointer tap-active relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <AlertTriangle size={64} />
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900 p-2.5 rounded-xl text-orange-600 dark:text-orange-400 shadow-sm z-10">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="flex-1 z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-md">Action Required</span>
                    </div>
                    <h3 className="text-base font-bold text-orange-950 dark:text-orange-100 leading-tight">Attention Needed</h3>
                    <p className="text-xs text-orange-800 dark:text-orange-200 mt-1 line-clamp-2">
                      {conflictData.conflictDescription}
                    </p>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Wand2 className="text-primary" size={18} />
                    AI Resolution
                  </DialogTitle>
                  <DialogDescription>
                    Based on your actual tasks and schedule
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2 min-h-[150px] flex flex-col justify-center">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                       <Loader2 className="animate-spin text-primary" size={32} />
                       <span className="text-xs font-medium animate-pulse">Analyzing your data...</span>
                    </div>
                  ) : error ? (
                    <div className="text-destructive text-sm text-center bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                      {error}
                      <Button variant="ghost" size="sm" className="mt-2" onClick={loadAIInsights}>Try Again</Button>
                    </div>
                  ) : conflictData ? (
                    <div className="grid gap-3">
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/50 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                         <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Option A</span>
                           <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Recommended</span>
                         </div>
                         <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 leading-relaxed">{conflictData.optionA}</p>
                      </div>
                      
                      <div className="bg-muted/30 p-4 rounded-xl border border-muted text-sm opacity-80 animate-in fade-in slide-in-from-bottom-3 delay-100">
                         <div className="flex justify-between font-medium mb-2">
                           <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Option B</span>
                         </div>
                         <p className="text-muted-foreground leading-relaxed">{conflictData.optionB}</p>
                      </div>
                      
                      {conflictData.balanceTip && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800 animate-in fade-in slide-in-from-bottom-4 delay-150">
                          <p className="text-xs text-blue-800 dark:text-blue-200">{conflictData.balanceTip}</p>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                <DialogFooter className="sm:justify-start gap-2">
                  <Button type="button" onClick={() => setConflictResolved(true)} className="flex-1 bg-primary text-white shadow-md hover:shadow-lg transition-all" disabled={loading || !!error}>
                    Got It
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setConflictResolved(true)} className="flex-1">
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

        <div className="space-y-2">
          {todaysItems.length > 0 ? (
            todaysItems.map(item => (
              <BucketItem key={item.id} item={item} />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm bg-muted/20 rounded-2xl border border-dashed border-muted flex flex-col items-center gap-2">
              <span className="text-2xl">🎉</span>
              <span>Nothing urgent! Go have fun.</span>
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions (Mockup) */}
      <section className="grid grid-cols-2 gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-auto py-5 flex flex-col gap-2 rounded-2xl border-dashed border-primary/30 hover:bg-primary/5 hover:border-primary hover:shadow-md transition-all group">
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300">🎲</span>
              <span className="text-xs font-bold text-primary">Roll for Date</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center">Tonight's Date Plan</DialogTitle>
            </DialogHeader>
            <div className="py-8 flex flex-col items-center justify-center">
              {isRolling ? (
                 <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                 >
                   <Dices size={48} className="text-primary" />
                 </motion.div>
              ) : rollResult ? (
                 <motion.div 
                   initial={{ scale: 0.5, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   className="text-center space-y-4"
                 >
                   <div className="text-5xl">✨</div>
                   <h3 className="text-xl font-bold font-display text-foreground">{rollResult}</h3>
                 </motion.div>
              ) : (
                <div className="text-center text-muted-foreground">
                   <Dices size={48} className="mx-auto mb-4 opacity-50" />
                   <p>Tap the button below to let fate decide!</p>
                </div>
              )}
            </div>
            <DialogFooter className="sm:justify-center">
              <Button onClick={handleRollDate} disabled={isRolling} className="w-full">
                {rollResult ? 'Roll Again' : 'Roll the Dice'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" className="h-auto py-5 flex flex-col gap-2 rounded-2xl border-dashed border-secondary/30 hover:bg-secondary/5 hover:border-secondary hover:shadow-md transition-all group">
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300">💌</span>
              <span className="text-xs font-bold text-secondary">Send Love Note</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent>
             <div className="mx-auto w-full max-w-sm p-6 space-y-4">
               <DrawerHeader className="p-0 mb-4">
                 <DrawerTitle>Send a Love Note</DrawerTitle>
               </DrawerHeader>
               
               <div className="space-y-2">
                 <Label>Your Message</Label>
                 <Textarea 
                   placeholder="Thinking of you..." 
                   value={loveNote}
                   onChange={(e) => setLoveNote(e.target.value)}
                   className="min-h-[120px] resize-none text-base"
                 />
               </div>

               <Button onClick={handleSendLoveNote} disabled={isSendingNote || !loveNote.trim()} className="w-full h-12 text-lg">
                 {isSendingNote ? <Loader2 className="animate-spin" /> : <Send className="mr-2" size={18} />}
                 Send to {partner.name}
               </Button>
             </div>
          </DrawerContent>
        </Drawer>
      </section>
    </div>
  );
}
