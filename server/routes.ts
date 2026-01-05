import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBucketItemSchema, insertRewardSchema } from "@shared/schema";
import { GoogleGenAI } from "@google/genai";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";

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
      const validatedItem = insertBucketItemSchema.parse(req.body);
      const newItem = await storage.createItem(validatedItem);
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
      const validatedReward = insertRewardSchema.parse(req.body);
      const newReward = await storage.createReward(validatedReward);
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

  // --- AI Features ---

  app.post("/api/ai/conflict-resolution", async (req: Request, res: Response) => {
    try {
      const { event1, event2, context } = req.body;
      
      const prompt = `You are a relationship assistant. Two events are in conflict:
Event 1: ${event1}
Event 2: ${event2}
${context ? `Additional context: ${context}` : ''}

Suggest TWO compromises in JSON format:
{
  "optionA": "Brief compromise option A",
  "optionB": "Brief compromise option B"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const text = response.text || "{}";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        optionA: "Reschedule one event to a different time",
        optionB: "Shorten both events to fit them in"
      };

      res.json(result);
    } catch (error) {
      console.error("Error with AI conflict resolution:", error);
      res.status(500).json({ error: "Failed to generate AI suggestions" });
    }
  });

  app.post("/api/ai/suggestions", async (req: Request, res: Response) => {
    try {
      const { type, context } = req.body;
      
      let prompt = "";
      if (type === "date") {
        prompt = `Suggest 5 creative date ideas. ${context ? `Context: ${context}` : ''} Return as JSON array of strings.`;
      } else if (type === "balance") {
        prompt = `Based on household chore distribution: ${context}, suggest how to balance workload better. Return as JSON with "suggestion" key.`;
      } else {
        prompt = context;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const text = response.text || "";
      res.json({ suggestion: text });
    } catch (error) {
      console.error("Error with AI suggestions:", error);
      res.status(500).json({ error: "Failed to generate suggestions" });
    }
  });

  app.post("/api/ai/theme-generator", async (req: Request, res: Response) => {
    try {
      const { vibe, mood } = req.body;
      
      const prompt = `Generate a color theme for a couples app. Vibe: ${vibe || 'romantic'}, Mood: ${mood || 'happy'}.
Return JSON with:
{
  "primary": "hsl(...)",
  "secondary": "hsl(...)",
  "background": "hsl(...)",
  "name": "Theme Name"
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
        name: "Custom Theme"
      };

      res.json(theme);
    } catch (error) {
      console.error("Error generating theme:", error);
      res.status(500).json({ error: "Failed to generate theme" });
    }
  });

  return httpServer;
}
