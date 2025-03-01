import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  profileImage: text("profile_image"),
  bannerImage: text("banner_image"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const artworks = pgTable("artworks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  isNsfw: boolean("is_nsfw").notNull().default(false),
  isAiGenerated: boolean("is_ai_generated").notNull().default(false),
  tags: text("tags").array().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const galleries = pgTable("galleries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  artworkIds: integer("artwork_ids").array().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  artworks: many(artworks),
  galleries: many(galleries)
}));

export const artworksRelations = relations(artworks, ({ one }) => ({
  user: one(users, {
    fields: [artworks.userId],
    references: [users.id]
  })
}));

export const galleriesRelations = relations(galleries, ({ one }) => ({
  user: one(users, {
    fields: [galleries.userId],
    references: [users.id]
  })
}));

// Session table for auth
export const sessions = pgTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull()
});

// Schemas for data insertion
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertArtworkSchema = createInsertSchema(artworks).omit({
  id: true,
  createdAt: true
});

export const insertGallerySchema = createInsertSchema(galleries).omit({
  id: true,
  createdAt: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Artwork = typeof artworks.$inferSelect;
export type InsertArtwork = z.infer<typeof insertArtworkSchema>;
export type Gallery = typeof galleries.$inferSelect;
export type InsertGallery = z.infer<typeof insertGallerySchema>;