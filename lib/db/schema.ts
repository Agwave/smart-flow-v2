import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  phone: text("phone").notNull(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  status: text("status").notNull(),
  totalAmount: integer("total_amount").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
});

export const logistics = sqliteTable("logistics", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  company: text("company").notNull(),
  trackingNo: text("tracking_no").notNull(),
  status: text("status").notNull(),
  lastUpdate: text("last_update").notNull(),
});

export const returnApplications = sqliteTable("return_applications", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  type: text("type").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type User = typeof users.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Logistics = typeof logistics.$inferSelect;
export type ReturnApplication = typeof returnApplications.$inferSelect;
