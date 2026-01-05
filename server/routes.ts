import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBucketItemSchema, insertRewardSchema } from "@shared/schema";
import { GoogleGenAI } from "@google/genai";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { buildCoupleContext, formatContextForPrompt } from "./ai/context";

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY!,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL!,
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Register AI integration routes
  registerChatRoutes(app);
  registerImageRoutes(app);

  // --- Bucket Items API ---
  
  app.get("/api/items", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string | undefined;
      const items = await storage.getAllItems(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });

  app.post("/api/items", async (req: Request, res: Response) => {
    try {
      // Don't validate with Zod, just pass through (schema handles defaults)
      const newItem = await storage.createItem(req.body);
      res.status(201).json(newItem);
    } catch (error) {
      console.error("Error creating item:", error);
      res.status(400).json({ error: "Invalid item data" });
    }
  });

  app.patch("/api/items/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedItem = await storage.updateItem(id, updates);
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(400).json({ error: "Failed to update item" });
    }
  });

  app.post("/api/items/:id/toggle", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const item = await storage.toggleItemComplete(id);
      res.json(item);
    } catch (error) {
      console.error("Error toggling item:", error);
      res.status(400).json({ error: "Failed to toggle item" });
    }
  });

  app.delete("/api/items/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteItem(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ error: "Failed to delete item" });
    }
  });

  // --- Rewards API ---

  app.get("/api/rewards", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string | undefined;
      const allRewards = await storage.getAllRewards(userId);
      res.json(allRewards);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      res.status(500).json({ error: "Failed to fetch rewards" });
    }
  });

  app.post("/api/rewards", async (req: Request, res: Response) => {
    try {
      const newReward = await storage.createReward(req.body);
      res.status(201).json(newReward);
    } catch (error) {
      console.error("Error creating reward:", error);
      res.status(400).json({ error: "Invalid reward data" });
    }
  });

  app.delete("/api/rewards/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteReward(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting reward:", error);
      res.status(500).json({ error: "Failed to delete reward" });
    }
  });

  // --- User API ---

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id/coins", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { personalCoins, jointCoins } = req.body;
      const user = await storage.updateUserCoins(id, personalCoins, jointCoins);
      res.json(user);
    } catch (error) {
      console.error("Error updating coins:", error);
      res.status(500).json({ error: "Failed to update coins" });
    }
  });

  app.patch("/api/users/:id/mood", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { mood } = req.body;
      const user = await storage.updateUserMood(id, mood);
      res.json(user);
    } catch (error) {
      console.error("Error updating mood:", error);
      res.status(500).json({ error: "Failed to update mood" });
    }
  });

  // --- AI Features (Using Real Context) ---

  app.post("/api/ai/daily-plan", async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId || "u1";
      const context = await buildCoupleContext(userId);
      const contextStr = formatContextForPrompt(context, 'daily_plan');
      
      const prompt = `You are a helpful relationship and productivity assistant for a couple's task management app.

${contextStr}

Based on this REAL data from their app, create a personalized daily plan. Consider:
- Their current moods
- Overdue items that need attention  
- High priority tasks
- The balance of workload between partners
- Opportunities to earn coins and reach reward goals

Return JSON in this exact format:
{
  "greeting": "Good morning! Here's your personalized plan based on your actual tasks...",
  "priorityTasks": ["Task 1 to focus on", "Task 2 to focus on", "Task 3 to focus on"],
  "insight": "An observation about their patterns or a helpful tip based on their real data",
  "encouragement": "A motivating message based on their progress and streak",
  "conflictWarning": "Any potential scheduling conflicts or overdue items to address, or null if none",
  "rewardSuggestion": "If they're close to affording a reward, mention it here, or null"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const text = response.text || "{}";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const plan = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        greeting: "Ready to tackle the day together!",
        priorityTasks: context.buckets.joint.pending.slice(0, 3).map(i => i.title),
        insight: `You've completed ${context.stats.totalCompleted} tasks together!`,
        encouragement: "Keep up the great teamwork!",
        conflictWarning: context.stats.overdueCount > 0 ? `You have ${context.stats.overdueCount} overdue items` : null,
        rewardSuggestion: context.rewards.affordable.length > 0 ? `You can afford ${context.rewards.affordable[0]?.title}!` : null
      };

      res.json(plan);
    } catch (error) {
      console.error("Error generating daily plan:", error);
      res.status(500).json({ error: "Failed to generate daily plan" });
    }
  });

  app.post("/api/ai/bucket-insights", async (req: Request, res: Response) => {
    try {
      const { bucket, userId } = req.body;
      const context = await buildCoupleContext(userId || "u1");
      const contextStr = formatContextForPrompt(context, 'buckets');
      
      const bucketData = context.buckets[bucket as keyof typeof context.buckets];
      
      const prompt = `You are a relationship assistant analyzing the "${bucket}" bucket for a couple.

${contextStr}

This specific bucket has:
- ${bucketData?.pending.length || 0} pending items
- ${bucketData?.completed.length || 0} completed items
- ${bucketData?.overdue.length || 0} overdue items

Provide brief, actionable insights for this bucket. Return JSON:
{
  "status": "on_track" or "needs_attention" or "falling_behind",
  "tip": "A specific tip for this bucket based on the actual items",
  "quickWin": "One easy task they could complete quickly from their actual pending items, or null"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const text = response.text || "{}";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const insights = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        status: "on_track",
        tip: "Keep up the good work!",
        quickWin: bucketData?.pending[0]?.title || null
      };

      res.json(insights);
    } catch (error) {
      console.error("Error generating bucket insights:", error);
      res.status(500).json({ error: "Failed to generate insights" });
    }
  });

  app.post("/api/ai/store-recommendations", async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId || "u1";
      const context = await buildCoupleContext(userId);
      const contextStr = formatContextForPrompt(context, 'store');
      
      const prompt = `You are a rewards advisor for a couple's productivity app.

${contextStr}

Based on their coin balance and available rewards, give personalized recommendations:
{
  "recommendation": "What reward they should save for or redeem based on their actual progress",
  "motivation": "How many more tasks to complete to afford their next goal",
  "celebration": "If they recently earned a lot of coins or hit a milestone, celebrate it here, or null"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const text = response.text || "{}";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const recs = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        recommendation: context.rewards.affordable.length > 0 
          ? `You can redeem ${context.rewards.affordable[0]?.title}!`
          : "Keep completing tasks to unlock rewards!",
        motivation: `Complete ${Math.ceil((context.rewards.available[0]?.cost || 50) / 10)} more tasks to reach your next reward.`,
        celebration: context.stats.streakDays > 3 ? `Amazing ${context.stats.streakDays}-day streak!` : null
      };

      res.json(recs);
    } catch (error) {
      console.error("Error generating store recommendations:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  app.post("/api/ai/conflict-resolution", async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      const context = await buildCoupleContext(userId || "u1");
      const contextStr = formatContextForPrompt(context, 'home');
      
      const overdueItems = [
        ...context.buckets.personal.overdue,
        ...context.buckets.partner.overdue,
        ...context.buckets.joint.overdue,
      ];
      
      const highPriorityItems = [
        ...context.buckets.personal.pending,
        ...context.buckets.partner.pending,
        ...context.buckets.joint.pending,
      ].filter(i => i.priority === 'high');
      
      const prompt = `You are a relationship assistant helping a couple manage potential conflicts.

${contextStr}

Analyze their situation and identify any scheduling conflicts or balance issues:
- Overdue items: ${overdueItems.map(i => i.title).join(', ') || 'None'}
- High priority items: ${highPriorityItems.map(i => i.title).join(', ') || 'None'}
- Workload balance score: ${context.patterns.balanceScore}%

Return JSON with resolution options:
{
  "hasConflict": true/false,
  "conflictDescription": "What the main issue is, based on their actual data",
  "optionA": "First suggested solution",
  "optionB": "Second suggested solution",
  "balanceTip": "If workload is unbalanced, suggest how to improve, or null"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const text = response.text || "{}";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        hasConflict: overdueItems.length > 0,
        conflictDescription: overdueItems.length > 0 
          ? `You have ${overdueItems.length} overdue items that need attention`
          : "No conflicts detected!",
        optionA: "Focus on overdue items first",
        optionB: "Split tasks between partners",
        balanceTip: context.patterns.balanceScore < 70 ? "Consider redistributing some tasks for better balance" : null
      };

      res.json(result);
    } catch (error) {
      console.error("Error with AI conflict resolution:", error);
      res.status(500).json({ error: "Failed to generate AI suggestions" });
    }
  });

  app.post("/api/ai/suggestions", async (req: Request, res: Response) => {
    try {
      const { type, userId } = req.body;
      const context = await buildCoupleContext(userId || "u1");
      const contextStr = formatContextForPrompt(context, type === 'date' ? 'home' : 'buckets');
      
      let prompt = "";
      if (type === "date") {
        prompt = `Based on this couple's data:
${contextStr}

Suggest 3 date ideas that would work for them. Consider:
- Their moods: ${context.user.mood || 'unknown'} and ${context.partner?.mood || 'unknown'}
- Their joint coins: ${context.user.jointCoins} (could use for a splurge)
- Their recent activity patterns

Return JSON: { "ideas": ["idea1", "idea2", "idea3"] }`;
      } else if (type === "balance") {
        prompt = `Based on this couple's workload:
${contextStr}

The balance score is ${context.patterns.balanceScore}%. Suggest how to improve fairness.
Return JSON: { "suggestion": "specific advice based on their actual task distribution" }`;
      } else {
        prompt = `${contextStr}\n\nProvide helpful advice. Return JSON: { "suggestion": "your advice" }`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const text = response.text || "{}";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { suggestion: "Keep up the teamwork!" };
      res.json(result);
    } catch (error) {
      console.error("Error with AI suggestions:", error);
      res.status(500).json({ error: "Failed to generate suggestions" });
    }
  });

  app.post("/api/ai/theme-generator", async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      const context = await buildCoupleContext(userId || "u1");
      
      const prompt = `Generate a color theme for a couples app based on their moods:
- User mood: ${context.user.mood || 'neutral'}
- Partner mood: ${context.partner?.mood || 'neutral'}
- Their productivity streak: ${context.stats.streakDays} days

Create a theme that matches their current emotional state.
Return JSON:
{
  "primary": "hsl(hue saturation% lightness%)",
  "secondary": "hsl(hue saturation% lightness%)",
  "background": "hsl(hue saturation% lightness%)",
  "name": "Theme Name reflecting their mood"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const text = response.text || "{}";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const theme = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        primary: "260 85% 65%",
        secondary: "10 85% 65%",
        background: "220 20% 97%",
        name: "Harmony"
      };

      res.json(theme);
    } catch (error) {
      console.error("Error generating theme:", error);
      res.status(500).json({ error: "Failed to generate theme" });
    }
  });

  return httpServer;
}
