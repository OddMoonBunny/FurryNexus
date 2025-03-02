import { pgTable, text, serial, timestamp, boolean, integer, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  bio: text("bio"),
  profileImage: text("profile_image"),
  bannerImage: text("banner_image"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const artworks = pgTable("artworks", {
  id: uuid("id").defaultRandom().primaryKey(),
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
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Junction table for gallery_artworks
export const galleryArtworks = pgTable("gallery_artworks", {
  galleryId: uuid("gallery_id").notNull().references(() => galleries.id),
  artworkId: uuid("artwork_id").notNull().references(() => artworks.id),
  addedAt: timestamp("added_at").notNull().defaultNow()
});

// New comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  artworkId: uuid("artwork_id").notNull().references(() => artworks.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  artworks: many(artworks),
  galleries: many(galleries),
  comments: many(comments)
}));

export const artworksRelations = relations(artworks, ({ one, many }) => ({
  user: one(users, {
    fields: [artworks.userId],
    references: [users.id]
  }),
  galleries: many(galleryArtworks),
  comments: many(comments)
}));

export const galleriesRelations = relations(galleries, ({ one, many }) => ({
  user: one(users, {
    fields: [galleries.userId],
    references: [users.id]
  }),
  artworks: many(galleryArtworks)
}));

export const galleryArtworksRelations = relations(galleryArtworks, ({ one }) => ({
  gallery: one(galleries, {
    fields: [galleryArtworks.galleryId],
    references: [galleries.id]
  }),
  artwork: one(artworks, {
    fields: [galleryArtworks.artworkId],
    references: [artworks.id]
  })
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id]
  }),
  artwork: one(artworks, {
    fields: [comments.artworkId],
    references: [artworks.id]
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

export const insertCommentSchema = createInsertSchema(comments).omit({
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
export type GalleryArtwork = typeof galleryArtworks.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;