import { type User, type InsertUser, type Artwork, type InsertArtwork, type Gallery, type InsertGallery, users, artworks, galleries, galleryArtworks, comments } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listAllUsers(): Promise<User[]>; // Added
  updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<User | undefined>; // Added
  updateUserPreferences(userId: string, preferences: { showNsfw?: boolean; showAiGenerated?: boolean }): Promise<User | undefined>;

  // Artwork operations
  getArtwork(id: string): Promise<Artwork | undefined>;
  listArtworks(filters?: { isNsfw?: boolean; isAiGenerated?: boolean }): Promise<Artwork[]>;
  createArtwork(artwork: InsertArtwork): Promise<Artwork>;
  getUserArtworks(userId: string, filters?: { isNsfw?: boolean; isAiGenerated?: boolean }): Promise<Artwork[]>;
  updateArtwork(id: string, artwork: InsertArtwork): Promise<Artwork>;
  deleteArtwork(id: string): Promise<void>;

  // Gallery operations
  getGallery(id: string): Promise<Gallery | undefined>;
  listUserGalleries(userId: string): Promise<Gallery[]>;
  createGallery(gallery: InsertGallery): Promise<Gallery>;
  updateGallery(id: string, gallery: Partial<InsertGallery>): Promise<Gallery>;
  deleteGallery(id: string): Promise<void>;
  listAllGalleries(): Promise<Gallery[]>;

  // Gallery-Artwork operations
  addArtworkToGallery(galleryId: string, artworkId: string): Promise<void>;
  removeArtworkFromGallery(galleryId: string, artworkId: string): Promise<void>;
  listGalleryArtworks(galleryId: string): Promise<Artwork[]>;

  // Comment operations
  getArtworkComments(artworkId: string): Promise<{ userId: string; content: string; createdAt: Date }[]>;
  createComment(comment: { artworkId: string; userId: string; content: string }): Promise<{ id: number; artworkId: string; userId: string; content: string; createdAt: Date }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async listAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ isAdmin })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async updateUserPreferences(userId: string, preferences: { showNsfw?: boolean; showAiGenerated?: boolean }): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        showNsfw: preferences.showNsfw,
        showAiGenerated: preferences.showAiGenerated
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }


  // Artwork operations
  async getArtwork(id: string): Promise<Artwork | undefined> {
    const [artwork] = await db.select().from(artworks).where(eq(artworks.id, id));
    return artwork;
  }

  async listArtworks(filters?: { isNsfw?: boolean; isAiGenerated?: boolean }): Promise<Artwork[]> {
    let query = db.select().from(artworks);

    // Create an array of conditions
    const conditions = [];

    // Handle the combination of NSFW and AI Generated filters
    if (filters?.isNsfw !== undefined || filters?.isAiGenerated !== undefined) {
      if (!filters.isNsfw) {
        // If NSFW is disabled, only show non-NSFW content
        conditions.push(eq(artworks.isNsfw, false));
      }

      if (filters.isAiGenerated !== undefined) {
        // Show AI or non-AI content based on the filter
        conditions.push(eq(artworks.isAiGenerated, filters.isAiGenerated));
      }
    }

    console.log("Applied filters:", filters, "Building query with conditions:", conditions.length);

    // Apply all conditions with AND logic if there are any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async createArtwork(insertArtwork: InsertArtwork): Promise<Artwork> {
    const [artwork] = await db.insert(artworks).values(insertArtwork).returning();
    return artwork;
  }

  async getUserArtworks(userId: string, filters?: { isNsfw?: boolean; isAiGenerated?: boolean }): Promise<Artwork[]> {
    let query = db.select().from(artworks).where(eq(artworks.userId, userId));

    // Create an array of conditions
    const conditions = [];

    // Handle the combination of NSFW and AI Generated filters
    if (filters?.isNsfw !== undefined || filters?.isAiGenerated !== undefined) {
      if (!filters.isNsfw) {
        // If NSFW is disabled, only show non-NSFW content
        conditions.push(eq(artworks.isNsfw, false));
      }

      if (filters.isAiGenerated !== undefined) {
        // Show AI or non-AI content based on the filter
        conditions.push(eq(artworks.isAiGenerated, filters.isAiGenerated));
      }
    }

    // Apply all conditions with AND logic if there are any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async updateArtwork(id: string, updateArtwork: InsertArtwork): Promise<Artwork> {
    const [artwork] = await db
      .update(artworks)
      .set(updateArtwork)
      .where(eq(artworks.id, id))
      .returning();

    if (!artwork) throw new Error("Artwork not found");
    return artwork;
  }

  async deleteArtwork(id: string): Promise<void> {
    try {
      try {
        // First try to delete any comments associated with the artwork
        // Wrap in try/catch to handle case where comments table doesn't exist
        await db.delete(comments).where(eq(comments.artworkId, id));
      } catch (commentError) {
        console.log("Comments table doesn't exist or other error with comments deletion, continuing with artwork deletion");
      }

      // Then delete any gallery associations
      await db.delete(galleryArtworks).where(eq(galleryArtworks.artworkId, id));

      // Finally delete the artwork
      await db.delete(artworks).where(eq(artworks.id, id));

      console.log(`Successfully deleted artwork with ID: ${id}`);
    } catch (error) {
      console.error(`Error deleting artwork with ID: ${id}:`, error);
      throw error;
    }
  }

  // Gallery operations
  async getGallery(id: string): Promise<Gallery | undefined> {
    const [gallery] = await db.select().from(galleries).where(eq(galleries.id, id));
    return gallery;
  }

  async listUserGalleries(userId: string): Promise<Gallery[]> {
    return await db.select().from(galleries).where(eq(galleries.userId, userId));
  }

  async createGallery(insertGallery: InsertGallery): Promise<Gallery> {
    const [gallery] = await db.insert(galleries).values(insertGallery).returning();
    return gallery;
  }

  async updateGallery(id: string, galleryUpdate: Partial<InsertGallery>): Promise<Gallery> {
    const [gallery] = await db
      .update(galleries)
      .set(galleryUpdate)
      .where(eq(galleries.id, id))
      .returning();

    if (!gallery) throw new Error("Gallery not found");
    return gallery;
  }

  async deleteGallery(id: string): Promise<void> {
    // First delete gallery-artwork associations
    await db.delete(galleryArtworks).where(eq(galleryArtworks.galleryId, id));
    // Then delete the gallery
    await db.delete(galleries).where(eq(galleries.id, id));
  }

  async listAllGalleries(): Promise<Gallery[]> {
    return await db.select().from(galleries);
  }

  // Gallery-Artwork operations
  async addArtworkToGallery(galleryId: string, artworkId: string): Promise<void> {
    console.log(`Adding artwork ${artworkId} to gallery ${galleryId}`);
    await db.insert(galleryArtworks).values({
      galleryId,
      artworkId,
    });
  }

  async removeArtworkFromGallery(galleryId: string, artworkId: string): Promise<void> {
    console.log(`Removing artwork ${artworkId} from gallery ${galleryId}`);
    await db.delete(galleryArtworks)
      .where(and(
        eq(galleryArtworks.galleryId, galleryId),
        eq(galleryArtworks.artworkId, artworkId)
      ));
  }

  async listGalleryArtworks(galleryId: string): Promise<Artwork[]> {
    console.log(`Fetching artworks for gallery ${galleryId}`);
    try {
      const result = await db
        .select({
          artwork: artworks
        })
        .from(galleryArtworks)
        .innerJoin(artworks, eq(artworks.id, galleryArtworks.artworkId))
        .where(eq(galleryArtworks.galleryId, galleryId));

      console.log(`Found ${result.length} artworks for gallery ${galleryId}`);
      console.log('Artwork IDs:', result.map(r => r.artwork.id));
      return result.map(r => r.artwork);
    } catch (error) {
      console.error('Error fetching gallery artworks:', error);
      throw error;
    }
  }

  async getArtworkComments(artworkId: string): Promise<{ userId: string; content: string; createdAt: Date }[]> {
    return await db.query.comments.findMany({
      where: eq(comments.artworkId, artworkId),
      orderBy: desc(comments.createdAt),
    });
  }

  async createComment(comment: { artworkId: string; userId: string; content: string }): Promise<{ id: number; artworkId: string; userId: string; content: string; createdAt: Date }> {
    const [created] = await db.insert(comments).values({
      artworkId: comment.artworkId,
      userId: comment.userId,
      content: comment.content,
      createdAt: new Date(),
    }).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();