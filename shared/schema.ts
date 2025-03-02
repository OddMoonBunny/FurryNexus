import { pgTable, text, serial, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
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
  socialLinks: jsonb("social_links").$type<{ platform: string; url: string }[]>(),
  isAdmin: boolean("is_admin").notNull().default(false),
  isBanned: boolean("is_banned").notNull().default(false),
  showNsfw: boolean("show_nsfw").notNull().default(false),
  showAiGenerated: boolean("show_ai_generated").notNull().default(true),
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
  viewCount: integer("view_count").notNull().default(0),
  likeCount: integer("like_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  artworkId: integer("artwork_id").notNull().references(() => artworks.id),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => users.id),
  followedId: integer("followed_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const galleries = pgTable("galleries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const galleryArtworks = pgTable("gallery_artworks", {
  galleryId: integer("gallery_id").notNull().references(() => galleries.id),
  artworkId: integer("artwork_id").notNull().references(() => artworks.id),
  addedAt: timestamp("added_at").notNull().defaultNow()
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  artworkId: integer("artwork_id").notNull().references(() => artworks.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  artworks: many(artworks),
  galleries: many(galleries),
  comments: many(comments),
  likes: many(likes),
  followers: many(follows, { relationName: "followers" }),
  following: many(follows, { relationName: "following" })
}));

export const artworksRelations = relations(artworks, ({ one, many }) => ({
  user: one(users, {
    fields: [artworks.userId],
    references: [users.id]
  }),
  galleries: many(galleryArtworks),
  comments: many(comments),
  likes: many(likes)
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

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id]
  }),
  artwork: one(artworks, {
    fields: [likes.artworkId],
    references: [artworks.id]
  })
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id]
  }),
  followed: one(users, {
    fields: [follows.followedId],
    references: [users.id]
  })
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertArtworkSchema = createInsertSchema(artworks).omit({
  id: true,
  createdAt: true,
  viewCount: true,
  likeCount: true
});

export const insertGallerySchema = createInsertSchema(galleries).omit({
  id: true,
  createdAt: true
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true
});

export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  createdAt: true
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  createdAt: true
});

// Type Exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Artwork = typeof artworks.$inferSelect;
export type InsertArtwork = z.infer<typeof insertArtworkSchema>;
export type Gallery = typeof galleries.$inferSelect;
export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type GalleryArtwork = typeof galleryArtworks.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;