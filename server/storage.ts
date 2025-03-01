import { type User, type InsertUser, type Artwork, type InsertArtwork, type Gallery, type InsertGallery } from "@shared/schema";

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

  // Gallery operations
  getGallery(id: number): Promise<Gallery | undefined>;
  listUserGalleries(userId: number): Promise<Gallery[]>;
  createGallery(gallery: InsertGallery): Promise<Gallery>;
  updateGallery(id: number, gallery: Partial<InsertGallery>): Promise<Gallery>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private artworks: Map<number, Artwork>;
  private galleries: Map<number, Gallery>;
  private currentIds: { user: number; artwork: number; gallery: number };

  constructor() {
    this.users = new Map();
    this.artworks = new Map();
    this.galleries = new Map();
    this.currentIds = { user: 1, artwork: 1, gallery: 1 };

    // Add some initial mock data
    this.initializeMockData();
  }

  private async initializeMockData() {
    // Add mock user
    const mockUser: InsertUser = {
      username: "synthfur",
      password: "password123",
      displayName: "SynthFur",
      bio: "Digital artist with a passion for synthwave aesthetics",
      profileImage: "https://images.unsplash.com/photo-1636690424408-4330adc3e583",
      bannerImage: "https://images.unsplash.com/photo-1636690513351-0af1763f6237"
    };
    const user = await this.createUser(mockUser);

    // Add mock artworks
    const mockArtworks = [
      {
        userId: user.id,
        title: "Neon Dreams",
        description: "A synthwave-inspired piece",
        imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
        isNsfw: false,
        isAiGenerated: false,
        tags: ["synthwave", "digital", "neon"]
      },
      {
        userId: user.id,
        title: "Cyber Sunset",
        description: "Digital landscape",
        imageUrl: "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e",
        isNsfw: false,
        isAiGenerated: true,
        tags: ["landscape", "digital", "ai"]
      }
    ];

    for (const artwork of mockArtworks) {
      await this.createArtwork(artwork);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const user: User = {
      id,
      ...insertUser,
      bio: insertUser.bio || null,
      profileImage: insertUser.profileImage || null,
      bannerImage: insertUser.bannerImage || null
    };
    this.users.set(id, user);
    return user;
  }

  // Artwork operations
  async getArtwork(id: number): Promise<Artwork | undefined> {
    return this.artworks.get(id);
  }

  async listArtworks(filters?: { isNsfw?: boolean; isAiGenerated?: boolean }): Promise<Artwork[]> {
    let artworks = Array.from(this.artworks.values());

    if (filters) {
      if (filters.isNsfw !== undefined) {
        artworks = artworks.filter(art => art.isNsfw === filters.isNsfw);
      }
      if (filters.isAiGenerated !== undefined) {
        artworks = artworks.filter(art => art.isAiGenerated === filters.isAiGenerated);
      }
    }

    return artworks;
  }

  async createArtwork(insertArtwork: InsertArtwork): Promise<Artwork> {
    const id = this.currentIds.artwork++;
    const artwork: Artwork = {
      id,
      ...insertArtwork,
      description: insertArtwork.description || null,
      createdAt: new Date()
    };
    this.artworks.set(id, artwork);
    return artwork;
  }

  async getUserArtworks(userId: number): Promise<Artwork[]> {
    return Array.from(this.artworks.values()).filter(
      (artwork) => artwork.userId === userId
    );
  }

  // Gallery operations
  async getGallery(id: number): Promise<Gallery | undefined> {
    return this.galleries.get(id);
  }

  async listUserGalleries(userId: number): Promise<Gallery[]> {
    return Array.from(this.galleries.values()).filter(
      (gallery) => gallery.userId === userId
    );
  }

  async createGallery(insertGallery: InsertGallery): Promise<Gallery> {
    const id = this.currentIds.gallery++;
    const gallery: Gallery = {
      id,
      ...insertGallery,
      description: insertGallery.description || null
    };
    this.galleries.set(id, gallery);
    return gallery;
  }

  async updateGallery(id: number, galleryUpdate: Partial<InsertGallery>): Promise<Gallery> {
    const existing = await this.getGallery(id);
    if (!existing) throw new Error("Gallery not found");

    const updated: Gallery = {
      ...existing,
      ...galleryUpdate,
      description: galleryUpdate.description || existing.description
    };
    this.galleries.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();