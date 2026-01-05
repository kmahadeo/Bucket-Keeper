import { useApp } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CoinDisplay } from '@/components/ui/CoinDisplay';
import { Gift, Lock } from 'lucide-react';

export default function Store() {
  const { rewards, user, redeemReward } = useApp();

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-display font-bold">Rewards</h1>
        <CoinDisplay />
      </header>

      <div className="space-y-8">
        {/* Joint Goals Section */}
        <section>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Joint Goals</h2>
          <div className="grid grid-cols-1 gap-4">
            {rewards.filter(r => r.type === 'joint_goal').map(reward => (
              <RewardCard key={reward.id} reward={reward} canAfford={user.jointCoins >= reward.cost} onRedeem={() => redeemReward(reward.id)} />
            ))}
          </div>
        </section>

        {/* Personal Treats */}
        <section>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Treat Yourself</h2>
          <div className="grid grid-cols-2 gap-3">
             {rewards.filter(r => r.type === 'personal_treat').map(reward => (
              <RewardCard key={reward.id} reward={reward} canAfford={user.personalCoins >= reward.cost} onRedeem={() => redeemReward(reward.id)} isCompact />
            ))}
          </div>
        </section>

        {/* Gifts */}
         <section>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Gifts for Partner</h2>
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

function RewardCard({ reward, canAfford, onRedeem, isCompact }: { reward: any, canAfford: boolean, onRedeem: () => void, isCompact?: boolean }) {
  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      className={`bg-card rounded-2xl border p-4 shadow-sm relative overflow-hidden ${!canAfford ? 'opacity-70' : ''}`}
    >
      <div className="absolute top-0 right-0 p-3 opacity-10 font-display font-bold text-6xl select-none">
        {reward.icon}
      </div>

      <div className="relative z-10">
        <div className="text-3xl mb-2">{reward.icon}</div>
        <h3 className={`font-bold leading-tight ${isCompact ? 'text-sm mb-1' : 'text-lg mb-2'}`}>{reward.title}</h3>
        
        <div className="flex items-center justify-between mt-3">
          <span className="font-mono text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
            {reward.cost} 🪙
          </span>
          
          <Button 
            size="sm" 
            disabled={!canAfford}
            onClick={onRedeem}
            className={`h-7 text-xs rounded-lg ${canAfford ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            {canAfford ? 'Redeem' : <Lock size={12} />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
