import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArtworkSchema, insertGallerySchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";

// Middleware to ensure user is authenticated
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Artwork routes
  app.get("/api/artworks", async (req, res) => {
    const filters = {
      isNsfw: req.query.isNsfw === "true",
      isAiGenerated: req.query.isAiGenerated === "true"
    };
    const artworks = await storage.listArtworks(filters);
    res.json(artworks);
  });

  app.get("/api/artworks/:id", async (req, res) => {
    const artwork = await storage.getArtwork(Number(req.params.id));
    if (!artwork) return res.status(404).json({ message: "Artwork not found" });
    res.json(artwork);
  });

  app.post("/api/artworks", requireAuth, async (req, res) => {
    try {
      const artwork = insertArtworkSchema.parse({
        ...req.body,
        userId: req.user!.id // Get user ID from session
      });
      const created = await storage.createArtwork(artwork);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid artwork data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create artwork" });
      }
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.get("/api/users/:id/artworks", async (req, res) => {
    const artworks = await storage.getUserArtworks(Number(req.params.id));
    res.json(artworks);
  });

  // Gallery routes
  app.get("/api/users/:userId/galleries", async (req, res) => {
    const galleries = await storage.listUserGalleries(Number(req.params.userId));
    res.json(galleries);
  });

  app.post("/api/galleries", requireAuth, async (req, res) => {
    try {
      const gallery = insertGallerySchema.parse({
        ...req.body,
        userId: req.user!.id // Get user ID from session
      });
      const created = await storage.createGallery(gallery);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid gallery data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create gallery" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}