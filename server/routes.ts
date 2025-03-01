import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArtworkSchema, insertGallerySchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";
import { upload, getFileUrl } from "./services/upload";
import path from "path";
import express from "express";

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

  // Serve uploaded files statically
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // File upload endpoint
  app.post("/api/upload", requireAuth, upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const fileUrl = getFileUrl(req.file.filename);
    res.json({ url: fileUrl });
  });

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

  app.patch("/api/artworks/:id", requireAuth, async (req, res) => {
    try {
      const artwork = await storage.getArtwork(Number(req.params.id));
      if (!artwork) {
        return res.status(404).json({ message: "Artwork not found" });
      }

      // Ensure users can only edit their own artworks
      if (artwork.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to edit this artwork" });
      }

      const updatedArtwork = insertArtworkSchema.parse({
        ...req.body,
        userId: req.user!.id
      });

      const updated = await storage.updateArtwork(Number(req.params.id), updatedArtwork);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid artwork data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update artwork" });
      }
    }
  });

  app.delete("/api/artworks/:id", requireAuth, async (req, res) => {
    try {
      const artwork = await storage.getArtwork(Number(req.params.id));
      if (!artwork) {
        return res.status(404).json({ message: "Artwork not found" });
      }

      // Ensure users can only delete their own artworks
      if (artwork.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this artwork" });
      }

      await storage.deleteArtwork(Number(req.params.id));
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete artwork" });
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

  app.delete("/api/galleries/:id", requireAuth, async (req, res) => {
    try {
      const gallery = await storage.getGallery(Number(req.params.id));
      if (!gallery) {
        return res.status(404).json({ message: "Gallery not found" });
      }

      // Ensure users can only delete their own galleries
      if (gallery.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this gallery" });
      }

      await storage.deleteGallery(Number(req.params.id));
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete gallery" });
    }
  });

  // Add this route handler near the other gallery routes
  app.get("/api/galleries/:id", async (req, res) => {
    try {
      const gallery = await storage.getGallery(Number(req.params.id));
      if (!gallery) {
        return res.status(404).json({ message: "Gallery not found" });
      }
      res.json(gallery);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gallery" });
    }
  });

  // Gallery-Artwork management routes
  app.post("/api/galleries/:galleryId/artworks/:artworkId", requireAuth, async (req, res) => {
    try {
      const gallery = await storage.getGallery(Number(req.params.galleryId));
      if (!gallery) {
        return res.status(404).json({ message: "Gallery not found" });
      }

      // Ensure users can only modify their own galleries
      if (gallery.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to modify this gallery" });
      }

      await storage.addArtworkToGallery(
        Number(req.params.galleryId),
        Number(req.params.artworkId)
      );
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to add artwork to gallery" });
    }
  });

  app.delete("/api/galleries/:galleryId/artworks/:artworkId", requireAuth, async (req, res) => {
    try {
      const gallery = await storage.getGallery(Number(req.params.galleryId));
      if (!gallery) {
        return res.status(404).json({ message: "Gallery not found" });
      }

      // Ensure users can only modify their own galleries
      if (gallery.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to modify this gallery" });
      }

      await storage.removeArtworkFromGallery(
        Number(req.params.galleryId),
        Number(req.params.artworkId)
      );
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to remove artwork from gallery" });
    }
  });

  app.get("/api/galleries/:id/artworks", async (req, res) => {
    try {
      const artworks = await storage.listGalleryArtworks(Number(req.params.id));
      res.json(artworks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gallery artworks" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}