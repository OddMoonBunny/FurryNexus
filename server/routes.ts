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
    try {
      // Always return all content without filtering
      console.log("Server applying filters: None (all content shown)");
      const artworks = await storage.listArtworks({});
      res.json(artworks);
    } catch (error) {
      console.error("Error fetching artworks:", error);
      res.status(500).json({ error: "Failed to fetch artworks" });
    }
  });

  app.get("/api/artworks/:id", async (req, res) => {
    const artwork = await storage.getArtwork(req.params.id);
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
      const artwork = await storage.getArtwork(req.params.id);
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

      const updated = await storage.updateArtwork(req.params.id, updatedArtwork);
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
      console.log(`Attempting to delete artwork with ID: ${req.params.id}`);

      const artwork = await storage.getArtwork(req.params.id);
      if (!artwork) {
        return res.status(404).json({ message: "Artwork not found" });
      }

      // Ensure users can only delete their own artworks
      if (artwork.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this artwork" });
      }

      await storage.deleteArtwork(req.params.id);
      console.log(`Successfully processed delete request for artwork ID: ${req.params.id}`);
      res.sendStatus(200);
    } catch (error) {
      console.error(`Error deleting artwork with ID: ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to delete artwork", error: String(error) });
    }
  });


  // User routes
  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id); // Removed Number() conversion
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  // Update existing preferences endpoint to handle both settings together
  app.patch("/api/users/:userId/preferences", requireAuth, async (req, res) => {
    try {
      // Ensure users can only update their own preferences
      if (req.user!.id !== Number(req.params.userId)) {
        return res.status(403).json({ message: "Not authorized to update preferences" });
      }

      const { showNsfw, showAiGenerated } = req.body;
      
      console.log(`Updating preferences for user ${req.params.userId}:`, { 
        showNsfw, 
        showAiGenerated,
        currentUserNsfw: req.user!.showNsfw,
        currentUserAi: req.user!.showAiGenerated
      });

      // Always update both preferences together
      const updatedUser = await storage.updateUserPreferences(req.params.userId, {
        showNsfw: showNsfw !== undefined ? showNsfw : req.user!.showNsfw,
        showAiGenerated: showAiGenerated !== undefined ? showAiGenerated : req.user!.showAiGenerated
      });

      console.log("Updated user preferences:", {
        showNsfw: updatedUser.showNsfw,
        showAiGenerated: updatedUser.showAiGenerated
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // Update artwork fetching to use user preferences
  app.get("/api/users/:id/artworks", async (req, res) => {
    try {
      // Always show all content
      console.log("Applying filters for user artworks: None (all content shown)");
      const artworks = await storage.getUserArtworks(req.params.id, {});
      res.json(artworks);
    } catch (error) {
      console.error("Error fetching user artworks:", error);
      res.status(500).json({ message: "Failed to fetch artworks" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", requireAuth, async (req, res) => {
    // Check if user is admin
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const users = await storage.listAllUsers();
    res.json(users);
  });

  app.patch("/api/admin/users/:userId", requireAuth, async (req, res) => {
    // Check if user is admin
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    try {
      const { isAdmin } = req.body;
      const userId = req.params.userId;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.updateUserAdminStatus(userId, !!isAdmin);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user admin status:", error);
      res.status(500).json({ message: "Failed to update user admin status" });
    }
  });

  // Gallery routes
  app.get("/api/galleries", async (req, res) => {
    const galleries = await storage.listAllGalleries();
    res.json(galleries);
  });

  app.get("/api/galleries/:id", async (req, res) => {
    try {
      console.log(`Getting gallery with ID: ${req.params.id}`);
      const gallery = await storage.getGallery(req.params.id);
      if (!gallery) {
        return res.status(404).json({ message: "Gallery not found" });
      }
      console.log("Gallery found:", gallery);
      res.json(gallery);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      res.status(500).json({ message: "Failed to fetch gallery" });
    }
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
      const gallery = await storage.getGallery(req.params.id);
      if (!gallery) {
        return res.status(404).json({ message: "Gallery not found" });
      }

      // Ensure users can only delete their own galleries
      if (gallery.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this gallery" });
      }

      await storage.deleteGallery(req.params.id);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete gallery" });
    }
  });

  app.get("/api/users/:userId/galleries", async (req, res) => {
    const galleries = await storage.listUserGalleries(req.params.userId); // Removed Number() conversion
    res.json(galleries);
  });

  // Gallery-Artwork management routes
  app.post("/api/galleries/:galleryId/artworks/:artworkId", requireAuth, async (req, res) => {
    try {
      const gallery = await storage.getGallery(req.params.galleryId);
      if (!gallery) {
        return res.status(404).json({ message: "Gallery not found" });
      }

      // Ensure users can only modify their own galleries
      if (gallery.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to modify this gallery" });
      }

      await storage.addArtworkToGallery(
        req.params.galleryId,
        req.params.artworkId
      );
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to add artwork to gallery" });
    }
  });

  app.delete("/api/galleries/:galleryId/artworks/:artworkId", requireAuth, async (req, res) => {
    try {
      const gallery = await storage.getGallery(req.params.galleryId);
      if (!gallery) {
        return res.status(404).json({ message: "Gallery not found" });
      }

      // Ensure users can only modify their own galleries
      if (gallery.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to modify this gallery" });
      }

      await storage.removeArtworkFromGallery(
        req.params.galleryId,
        req.params.artworkId
      );
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to remove artwork from gallery" });
    }
  });

  app.get("/api/galleries/:id/artworks", async (req, res) => {
    try {
      console.log(`Getting artworks for gallery with ID: ${req.params.id}`);
      const artworks = await storage.listGalleryArtworks(req.params.id);
      console.log(`Found ${artworks.length} artworks for gallery`);
      res.json(artworks);
    } catch (error) {
      console.error("Error fetching gallery artworks:", error);
      res.status(500).json({ message: "Failed to fetch gallery artworks" });
    }
  });

  // Comments API endpoints
  app.get("/api/artworks/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getArtworkComments(req.params.id);
      res.json(comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/artworks/:id/comments", requireAuth, async (req, res) => {
    try {
      const comment = {
        artworkId: req.params.id,
        userId: req.user!.id,
        content: req.body.content,
      };
      const created = await storage.createComment(comment);
      res.status(201).json(created);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}