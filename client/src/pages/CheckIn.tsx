import { useState, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, CheckCircle2, AlertTriangle, ArrowRight, MessageSquare, Clock, ThumbsUp, Sparkles, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CheckIn() {
  const { user, items } = useApp();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'intro' | 'timer' | 'agenda' | 'parking' | 'summary'>('intro');
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  // Conflict / High Priority Items
  const discussionItems = items.filter(i => i.conflictPotential || i.priority === 'high');
  const [parkingLot, setParkingLot] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setStep('timer');
    setIsTimerRunning(true);
  };

  const handleSkipTimer = () => {
    setStep('agenda');
    setIsTimerRunning(false); // Pause timer if skipping logic requires
  };

  const addToParking = () => {
    if (newItem.trim()) {
      setParkingLot([...parkingLot, newItem]);
      setNewItem('');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 pb-24 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-bold">Relationship Check-in</h1>
        <Button variant="ghost" size="icon" onClick={() => setLocation('/')}>
          <X size={20} />
        </Button>
      </div>

      {/* Steps */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* INTRO STEP */}
          {step === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center justify-center text-center space-y-6 flex-1"
            >
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                <Sparkles size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Weekly Sync</h2>
                <p className="text-muted-foreground">
                  Time to align on goals, clear the air, and appreciate each other.
                </p>
              </div>
              
              <div className="w-full bg-card border rounded-xl p-4 text-left space-y-3">
                 <div className="flex items-center gap-3">
                   <Clock className="text-blue-500" size={20} />
                   <span className="text-sm font-medium">15 Minute Timer</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <AlertTriangle className="text-orange-500" size={20} />
                   <span className="text-sm font-medium">Review {discussionItems.length} High-Priority Items</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <MessageSquare className="text-green-500" size={20} />
                   <span className="text-sm font-medium">Open Floor & Appreciation</span>
                 </div>
              </div>

              <Button size="lg" className="w-full rounded-xl h-14 text-lg mt-auto" onClick={handleStart}>
                Start Check-in
              </Button>
            </motion.div>
          )}

          {/* TIMER STEP */}
          {step === 'timer' && (
            <motion.div 
              key="timer"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center justify-center flex-1 space-y-8"
            >
              <div className="relative">
                 <div className="w-64 h-64 rounded-full border-8 border-muted flex items-center justify-center">
                    <span className="text-6xl font-mono font-bold tabular-nums">
                      {formatTime(timeLeft)}
                    </span>
                 </div>
                 <svg className="absolute top-0 left-0 w-64 h-64 -rotate-90 pointer-events-none">
                   <circle
                     cx="128"
                     cy="128"
                     r="124"
                     stroke="currentColor"
                     strokeWidth="8"
                     fill="transparent"
                     className="text-primary transition-all duration-1000"
                     strokeDasharray={779}
                     strokeDashoffset={779 - (779 * timeLeft) / (15 * 60)}
                   />
                 </svg>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold">Focus Mode</h3>
                <p className="text-muted-foreground text-sm">Put phones away (except this one!)</p>
              </div>

              <div className="flex gap-4 w-full">
                <Button variant="outline" className="flex-1 h-12" onClick={() => setIsTimerRunning(!isTimerRunning)}>
                  {isTimerRunning ? 'Pause' : 'Resume'}
                </Button>
                <Button className="flex-1 h-12" onClick={() => setStep('agenda')}>
                  Start Agenda
                </Button>
              </div>
            </motion.div>
          )}

          {/* AGENDA STEP */}
          {step === 'agenda' && (
            <motion.div 
              key="agenda"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col flex-1"
            >
              <div className="mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <AlertTriangle className="text-orange-500" size={20} />
                  Discussion Items
                </h2>
                <p className="text-sm text-muted-foreground">AI flagged these as needing discussion.</p>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto">
                {discussionItems.length > 0 ? discussionItems.map(item => (
                  <Card key={item.id} className="p-4 border-l-4 border-l-orange-500">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold">{item.title}</h3>
                      <Badge variant="outline" className="text-xs">{item.bucket}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {item.conflictPotential ? "Potential conflict detected." : "High priority item."}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" className="text-xs h-8">Resolve</Button>
                      <Button size="sm" variant="ghost" className="text-xs h-8" onClick={() => setParkingLot([...parkingLot, item.title])}>Park for Later</Button>
                    </div>
                  </Card>
                )) : (
                  <div className="text-center py-10 bg-muted/20 rounded-xl">
                    <ThumbsUp className="mx-auto mb-2 text-muted-foreground" />
                    <p>No urgent issues flagged!</p>
                  </div>
                )}
              </div>

              <Button className="w-full h-12 mt-4" onClick={() => setStep('parking')}>
                Next: Parking Lot <ArrowRight size={16} className="ml-2" />
              </Button>
            </motion.div>
          )}

          {/* PARKING LOT */}
          {step === 'parking' && (
             <motion.div 
               key="parking"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="flex flex-col flex-1"
             >
               <div className="mb-6">
                 <h2 className="text-lg font-bold flex items-center gap-2">
                   <MessageSquare className="text-blue-500" size={20} />
                   Parking Lot
                 </h2>
                 <p className="text-sm text-muted-foreground">Topics for later or requires deeper chat.</p>
               </div>
 
               <div className="flex gap-2 mb-4">
                 <Textarea 
                   placeholder="Add a topic..." 
                   className="min-h-[60px] resize-none"
                   value={newItem}
                   onChange={(e) => setNewItem(e.target.value)}
                 />
                 <Button className="h-auto" onClick={addToParking}><ArrowRight /></Button>
               </div>

               <div className="space-y-2 flex-1 overflow-y-auto">
                 {parkingLot.map((item, idx) => (
                   <div key={idx} className="p-3 bg-card border rounded-lg flex items-center justify-between">
                     <span>{item}</span>
                     <Button variant="ghost" size="sm" onClick={() => setParkingLot(parkingLot.filter((_, i) => i !== idx))}>
                       <X size={14} />
                     </Button>
                   </div>
                 ))}
                 {parkingLot.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm italic mt-4">Parking lot is empty.</p>
                 )}
               </div>
 
               <Button className="w-full h-12 mt-4" onClick={() => setStep('summary')}>
                 Finish Check-in
               </Button>
             </motion.div>
          )}

          {/* SUMMARY */}
          {step === 'summary' && (
             <motion.div 
              key="summary"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center flex-1 text-center space-y-6"
            >
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 mb-4">
                <CheckCircle2 size={48} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Check-in Complete!</h2>
                <p className="text-muted-foreground">
                  Great job staying aligned. {parkingLot.length} items parked for later.
                </p>
              </div>
              
              <Button className="w-full h-12 mt-auto" onClick={() => setLocation('/')}>
                Back to Home
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
