import { type User, type InsertUser, type Artwork, type InsertArtwork, type Gallery, type InsertGallery, users, artworks, galleries, galleryArtworks } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Artwork operations
  getArtwork(id: number): Promise<Artwork | undefined>;
  listArtworks(filters?: { isNsfw?: boolean; isAiGenerated?: boolean }): Promise<Artwork[]>;
  createArtwork(artwork: InsertArtwork): Promise<Artwork>;
  getUserArtworks(userId: number): Promise<Artwork[]>;
  updateArtwork(id: number, artwork: InsertArtwork): Promise<Artwork>;
  deleteArtwork(id: number): Promise<void>;

  // Gallery operations
  getGallery(id: number): Promise<Gallery | undefined>;
  listUserGalleries(userId: number): Promise<Gallery[]>;
  createGallery(gallery: InsertGallery): Promise<Gallery>;
  updateGallery(id: number, gallery: Partial<InsertGallery>): Promise<Gallery>;
  deleteGallery(id: number): Promise<void>;

  // Gallery-Artwork operations
  addArtworkToGallery(galleryId: number, artworkId: number): Promise<void>;
  removeArtworkFromGallery(galleryId: number, artworkId: number): Promise<void>;
  listGalleryArtworks(galleryId: number): Promise<Artwork[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
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

  // Artwork operations
  async getArtwork(id: number): Promise<Artwork | undefined> {
    const [artwork] = await db.select().from(artworks).where(eq(artworks.id, id));
    return artwork;
  }

  async listArtworks(filters?: { isNsfw?: boolean; isAiGenerated?: boolean }): Promise<Artwork[]> {
    let query = db.select().from(artworks);

    if (filters?.isNsfw !== undefined) {
      query = query.where(eq(artworks.isNsfw, filters.isNsfw));
    }
    if (filters?.isAiGenerated !== undefined) {
      query = query.where(eq(artworks.isAiGenerated, filters.isAiGenerated));
    }

    return await query;
  }

  async createArtwork(insertArtwork: InsertArtwork): Promise<Artwork> {
    const [artwork] = await db.insert(artworks).values(insertArtwork).returning();
    return artwork;
  }

  async getUserArtworks(userId: number): Promise<Artwork[]> {
    return await db.select().from(artworks).where(eq(artworks.userId, userId));
  }

  async updateArtwork(id: number, updateArtwork: InsertArtwork): Promise<Artwork> {
    const [artwork] = await db
      .update(artworks)
      .set(updateArtwork)
      .where(eq(artworks.id, id))
      .returning();

    if (!artwork) throw new Error("Artwork not found");
    return artwork;
  }

  async deleteArtwork(id: number): Promise<void> {
    await db.delete(artworks).where(eq(artworks.id, id));
  }

  // Gallery operations
  async getGallery(id: number): Promise<Gallery | undefined> {
    const [gallery] = await db.select().from(galleries).where(eq(galleries.id, id));
    return gallery;
  }

  async listUserGalleries(userId: number): Promise<Gallery[]> {
    return await db.select().from(galleries).where(eq(galleries.userId, userId));
  }

  async createGallery(insertGallery: InsertGallery): Promise<Gallery> {
    const [gallery] = await db.insert(galleries).values(insertGallery).returning();
    return gallery;
  }

  async updateGallery(id: number, galleryUpdate: Partial<InsertGallery>): Promise<Gallery> {
    const [gallery] = await db
      .update(galleries)
      .set(galleryUpdate)
      .where(eq(galleries.id, id))
      .returning();

    if (!gallery) throw new Error("Gallery not found");
    return gallery;
  }

  async deleteGallery(id: number): Promise<void> {
    await db.delete(galleries).where(eq(galleries.id, id));
  }

  async addArtworkToGallery(galleryId: number, artworkId: number): Promise<void> {
    await db.insert(galleryArtworks).values({
      galleryId,
      artworkId,
    });
  }

  async removeArtworkFromGallery(galleryId: number, artworkId: number): Promise<void> {
    await db.delete(galleryArtworks)
      .where(and(
        eq(galleryArtworks.galleryId, galleryId),
        eq(galleryArtworks.artworkId, artworkId)
      ));
  }

  async listGalleryArtworks(galleryId: number): Promise<Artwork[]> {
    const result = await db
      .select({
        artwork: artworks
      })
      .from(galleryArtworks)
      .innerJoin(artworks, eq(artworks.id, galleryArtworks.artworkId))
      .where(eq(galleryArtworks.galleryId, galleryId));

    return result.map(r => r.artwork);
  }
}

export const storage = new DatabaseStorage();