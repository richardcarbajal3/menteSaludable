import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertMoodEntrySchema,
  insertJournalEntrySchema,
  insertResourceSchema,
  insertCompletedResourceSchema,
  insertGoalSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default user for demo purposes
  let defaultUser = await storage.getUser("default-user-id");
  if (!defaultUser) {
    defaultUser = await storage.createUser({
      name: "Usuario",
      prefersDarkMode: false,
    });
  }

  // Get current user
  app.get("/api/user", async (_req, res) => {
    try {
      const user = await storage.getUser(defaultUser!.id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Update user
  app.patch("/api/user", async (req, res) => {
    try {
      const user = await storage.updateUser(defaultUser!.id, req.body);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Mood Entries
  app.get("/api/mood-entries", async (_req, res) => {
    try {
      const entries = await storage.getMoodEntries(defaultUser!.id);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mood entries" });
    }
  });

  app.post("/api/mood-entries", async (req, res) => {
    try {
      const data = insertMoodEntrySchema.parse({
        ...req.body,
        userId: defaultUser!.id,
      });
      const entry = await storage.createMoodEntry(data);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: "Invalid mood entry data" });
    }
  });

  // Journal Entries
  app.get("/api/journal-entries", async (_req, res) => {
    try {
      const entries = await storage.getJournalEntries(defaultUser!.id);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });

  app.post("/api/journal-entries", async (req, res) => {
    try {
      const data = insertJournalEntrySchema.parse({
        ...req.body,
        userId: defaultUser!.id,
      });
      const entry = await storage.createJournalEntry(data);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: "Invalid journal entry data" });
    }
  });

  // Resources
  app.get("/api/resources", async (_req, res) => {
    try {
      const allResources = await storage.getAllResources();
      res.json(allResources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch resources" });
    }
  });

  app.post("/api/resources", async (req, res) => {
    try {
      const data = insertResourceSchema.parse(req.body);
      const resource = await storage.createResource(data);
      res.json(resource);
    } catch (error) {
      res.status(400).json({ error: "Invalid resource data" });
    }
  });

  // Completed Resources
  app.get("/api/completed-resources", async (_req, res) => {
    try {
      const completed = await storage.getCompletedResources(defaultUser!.id);
      res.json(completed);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch completed resources" });
    }
  });

  app.post("/api/completed-resources", async (req, res) => {
    try {
      const data = insertCompletedResourceSchema.parse({
        ...req.body,
        userId: defaultUser!.id,
      });
      const completed = await storage.createCompletedResource(data);
      res.json(completed);
    } catch (error) {
      res.status(400).json({ error: "Invalid completed resource data" });
    }
  });

  app.delete("/api/completed-resources/:id", async (req, res) => {
    try {
      await storage.deleteCompletedResource(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete completed resource" });
    }
  });

  // Goals
  app.get("/api/goals", async (_req, res) => {
    try {
      const goals = await storage.getGoals(defaultUser!.id);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const data = insertGoalSchema.parse({
        ...req.body,
        userId: defaultUser!.id,
      });
      const goal = await storage.createGoal(data);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ error: "Invalid goal data" });
    }
  });

  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const updateData = { ...req.body };
      // Convert completedAt to proper timestamp if present
      if (updateData.completedAt !== undefined && updateData.completedAt !== null) {
        updateData.completedAt = new Date(updateData.completedAt);
      }
      const goal = await storage.updateGoal(req.params.id, updateData);
      res.json(goal);
    } catch (error) {
      console.error("Error updating goal:", error);
      res.status(500).json({ error: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      await storage.deleteGoal(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete goal" });
    }
  });

  // Seed initial resources if none exist
  const existingResources = await storage.getAllResources();
  if (existingResources.length === 0) {
    const seedResources = [
      {
        title: "Meditación de 5 minutos para la ansiedad",
        description: "Una práctica guiada breve para calmar la mente y reducir la ansiedad en momentos de estrés.",
        category: "meditation",
        duration: 5,
        content: "Siéntate cómodamente y cierra los ojos. Respira profundamente...",
      },
      {
        title: "Respiración 4-7-8",
        description: "Técnica de respiración que ayuda a reducir el estrés y facilitar el sueño.",
        category: "breathing",
        duration: 3,
        content: "Inhala por la nariz contando hasta 4, sostén la respiración contando hasta 7...",
      },
      {
        title: "Entendiendo la ansiedad",
        description: "Aprende qué es la ansiedad, sus síntomas y cómo manejarla de forma efectiva.",
        category: "article",
        duration: 10,
        content: "La ansiedad es una respuesta natural del cuerpo ante situaciones de estrés...",
      },
      {
        title: "Caminata consciente",
        description: "Ejercicio de mindfulness en movimiento para conectar con el presente.",
        category: "exercise",
        duration: 15,
        content: "Encuentra un espacio tranquilo para caminar. Presta atención a cada paso...",
      },
      {
        title: "Meditación matutina",
        description: "Comienza tu día con claridad mental y energía positiva.",
        category: "meditation",
        duration: 10,
        content: "Al despertar, dedica estos minutos a establecer tus intenciones del día...",
      },
      {
        title: "Gestión del estrés laboral",
        description: "Estrategias prácticas para manejar el estrés en el trabajo.",
        category: "article",
        duration: 8,
        content: "El estrés laboral es común, pero existen técnicas efectivas para manejarlo...",
      },
    ];

    for (const resource of seedResources) {
      await storage.createResource(resource);
    }
  }

  const httpServer = createServer(app);

  return httpServer;
}
