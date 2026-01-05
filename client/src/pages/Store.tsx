import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CoinDisplay } from '@/components/ui/CoinDisplay';
import { Gift, Lock, Plus, Wand2 } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Store() {
  const { rewards, user, redeemReward, addReward } = useApp(); // Need addReward in store
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardCost, setNewRewardCost] = useState('50');
  const [newRewardType, setNewRewardType] = useState('personal_treat');

  const handleAddReward = () => {
    // Logic to add reward via store would go here
    // Mocking for now as store update is next step
    console.log("Adding reward:", { newRewardTitle, newRewardCost, newRewardType });
    setNewRewardTitle('');
  };

  return (
    <div className="p-6 pb-24">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-display font-bold">Rewards</h1>
        <CoinDisplay />
      </header>
      
      {/* AI Suggestion Banner */}
      <div className="mb-8 p-4 bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 rounded-2xl border border-white/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-20">
          <Wand2 size={48} />
        </div>
        <div className="relative z-10">
          <h3 className="font-bold flex items-center gap-2 text-sm text-violet-900 dark:text-violet-100">
            <Wand2 size={14} /> AI Recommendation
          </h3>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            Based on your recent "Gym" streak, you should add a massage reward!
          </p>
          <Button size="sm" variant="secondary" className="h-7 text-xs bg-white/50 backdrop-blur-sm">
            Add "Massage" (100 🪙)
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Joint Goals Section */}
        <section>
          <div className="flex justify-between items-end mb-4">
             <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Joint Goals</h2>
             <AddRewardButton type="joint_goal" />
          </div>
          <div className="grid grid-cols-1 gap-4">
            {rewards.filter(r => r.type === 'joint_goal').map(reward => (
              <RewardCard key={reward.id} reward={reward} canAfford={user.jointCoins >= reward.cost} onRedeem={() => redeemReward(reward.id)} />
            ))}
          </div>
        </section>

        {/* Personal Treats */}
        <section>
          <div className="flex justify-between items-end mb-4">
             <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Treat Yourself</h2>
             <AddRewardButton type="personal_treat" />
          </div>
          <div className="grid grid-cols-2 gap-3">
             {rewards.filter(r => r.type === 'personal_treat').map(reward => (
              <RewardCard key={reward.id} reward={reward} canAfford={user.personalCoins >= reward.cost} onRedeem={() => redeemReward(reward.id)} isCompact />
            ))}
          </div>
        </section>

        {/* Gifts */}
         <section>
          <div className="flex justify-between items-end mb-4">
             <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Gifts for Partner</h2>
             <AddRewardButton type="partner_gift" />
          </div>
          <div className="grid grid-cols-2 gap-3">
             {rewards.filter(r => r.type === 'partner_gift').map(reward => (
              <RewardCard key={reward.id} reward={reward} canAfford={user.personalCoins >= reward.cost} onRedeem={() => redeemReward(reward.id)} isCompact />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function AddRewardButton({ type }: { type: string }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary hover:bg-primary/10">
          <Plus size={12} className="mr-1" /> Add Custom
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm p-6 space-y-4">
          <DrawerHeader className="p-0">
            <DrawerTitle>Create New Reward</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input placeholder="e.g. Breakfast in Bed" />
            </div>
            <div className="space-y-1">
              <Label>Cost (Coins)</Label>
               <Select defaultValue="50">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 🪙 (Small)</SelectItem>
                  <SelectItem value="50">50 🪙 (Medium)</SelectItem>
                  <SelectItem value="100">100 🪙 (Big)</SelectItem>
                  <SelectItem value="500">500 🪙 (Huge)</SelectItem>
                </SelectContent>
               </Select>
            </div>
            <Button className="w-full">Create Reward</Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function RewardCard({ reward, canAfford, onRedeem, isCompact }: { reward: any, canAfford: boolean, onRedeem: () => void, isCompact?: boolean }) {
  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      className={`bg-card rounded-2xl border p-4 shadow-sm relative overflow-hidden ${!canAfford ? 'opacity-70 grayscale-[0.5]' : ''}`}
    >
      <div className="absolute top-0 right-0 p-3 opacity-10 font-display font-bold text-6xl select-none">
        {reward.icon}
      </div>

      <div className="relative z-10">
        <div className="text-3xl mb-2">{reward.icon}</div>
        <h3 className={`font-bold leading-tight ${isCompact ? 'text-sm mb-1' : 'text-lg mb-2'}`}>{reward.title}</h3>
        
        <div className="flex items-center justify-between mt-3">
          <span className="font-mono text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md border border-amber-200/50">
            {reward.cost} 🪙
          </span>
          
          <Button 
            size="sm" 
            disabled={!canAfford}
            onClick={onRedeem}
            className={`h-7 text-xs rounded-lg ${canAfford ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground'}`}
          >
            {canAfford ? 'Redeem' : <Lock size={12} />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
