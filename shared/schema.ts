import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  profileImage: text("profile_image"),
  bannerImage: text("banner_image")
});

export const artworks = pgTable("artworks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
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
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  artworkIds: integer("artwork_ids").array().notNull()
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true
});

export const insertArtworkSchema = createInsertSchema(artworks).omit({
  id: true,
  createdAt: true
});

export const insertGallerySchema = createInsertSchema(galleries).omit({
  id: true
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Artwork = typeof artworks.$inferSelect;
export type InsertArtwork = z.infer<typeof insertArtworkSchema>;
export type Gallery = typeof galleries.$inferSelect;
export type InsertGallery = z.infer<typeof insertGallerySchema>;