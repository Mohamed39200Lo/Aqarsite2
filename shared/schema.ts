import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Property schema
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // villa, apartment, land, commercial
  price: integer("price").notNull(),
  currency: text("currency").notNull().default("SAR"),
  isRental: boolean("is_rental").notNull().default(false),
  rentalPeriod: text("rental_period"), // yearly, monthly, etc.
  city: text("city").notNull(),
  neighborhood: text("neighborhood").notNull(),
  address: text("address").notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  area: doublePrecision("area").notNull(), // in square meters
  features: text("features").array(), // array of features
  images: text("images").array().notNull(), // array of image URLs
  status: text("status").notNull().default("available"), // available, sold, rented, pending
  createdAt: timestamp("created_at").notNull().defaultNow(),
  propertyCode: text("property_code").notNull().unique(), // Unique identifier like SA-12345
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
});

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"), // admin, user
  email: text("email").notNull().unique(),
  phone: text("phone"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Contact message schema
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
});

// Testimonial schema
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  message: text("message").notNull(),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isApproved: boolean("is_approved").notNull().default(false),
});

// Insert schemas

export const insertPropertySchema = createInsertSchema(properties).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true, isRead: true });
export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ id: true, createdAt: true, isApproved: true });

// Types

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

// Extended schemas for validation

export const loginSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

// Search schema
export const propertySearchSchema = z.object({
  city: z.string().optional(),
  type: z.string().optional(),
  priceRange: z.string().optional(),
  bedrooms: z.number().optional(),
  isRental: z.boolean().optional(),
  area: z.number().optional(),
});

export type PropertySearch = z.infer<typeof propertySearchSchema>;
