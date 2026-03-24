import { tool } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { orders, orderItems, logistics, returnApplications } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { initializeDatabase } from "@/lib/db/seed";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

let dbInitialized = false;

async function ensureDatabase() {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
}

export const tools = {
  queryOrder: tool({
    description: "根据订单号查询订单详情，包括商品信息、订单状态和物流信息",
    parameters: z.object({
      orderId: z.string().describe("订单号，通常是一串数字"),
    }),
    execute: async ({ orderId }: { orderId: string }) => {
      await ensureDatabase();

      const orderResult = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (orderResult.length === 0) {
        return { found: false, message: `未找到订单号为 ${orderId} 的订单，请核对订单号后重试。` };
      }

      const order = orderResult[0];

      const itemsResult = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));

      const logisticsResult = await db
        .select()
        .from(logistics)
        .where(eq(logistics.orderId, orderId))
        .limit(1);

      return {
        found: true,
        order: {
          id: order.id,
          status: order.status,
          totalAmount: order.totalAmount / 100,
          createdAt: order.createdAt,
          items: itemsResult.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.price / 100,
          })),
          logistics: logisticsResult.length > 0 ? {
            company: logisticsResult[0].company,
            trackingNo: logisticsResult[0].trackingNo,
            status: logisticsResult[0].status,
            lastUpdate: logisticsResult[0].lastUpdate,
          } : null,
        },
      };
    },
  }),

  queryLogistics: tool({
    description: "查询订单的物流配送信息",
    parameters: z.object({
      orderId: z.string().describe("订单号"),
    }),
    execute: async ({ orderId }: { orderId: string }) => {
      await ensureDatabase();

      const orderResult = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (orderResult.length === 0) {
        return { found: false, message: "未找到该订单" };
      }

      const logisticsResult = await db
        .select()
        .from(logistics)
        .where(eq(logistics.orderId, orderId))
        .limit(1);

      if (logisticsResult.length === 0) {
        return { found: true, hasLogistics: false, message: "该订单暂无物流信息" };
      }

      return {
        found: true,
        hasLogistics: true,
        logistics: {
          company: logisticsResult[0].company,
          trackingNo: logisticsResult[0].trackingNo,
          status: logisticsResult[0].status,
          lastUpdate: logisticsResult[0].lastUpdate,
        },
      };
    },
  }),

  applyReturn: tool({
    description: "提交退换货申请",
    parameters: z.object({
      orderId: z.string().describe("订单号"),
      reason: z.string().describe("退换货原因"),
      type: z.enum(["退货退款", "换货", "仅退款"]).describe("申请类型"),
    }),
    execute: async ({ orderId, reason, type }: { orderId: string; reason: string; type: string }) => {
      await ensureDatabase();

      const orderResult = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (orderResult.length === 0) {
        return { success: false, message: "未找到该订单，请核对订单号" };
      }

      const applicationId = `RET${Date.now()}`;
      const now = new Date();

      await db.insert(returnApplications).values({
        id: applicationId,
        orderId,
        type,
        reason,
        status: "待审核",
        createdAt: now,
        updatedAt: now,
      });

      return {
        success: true,
        applicationId,
        message: `您的${type}申请已提交成功！申请单号：${applicationId}。预计1-3个工作日内审核完成，请留意站内消息通知。`,
      };
    },
  }),
};

export type ToolName = keyof typeof tools;

export function getTool(name: ToolName) {
  return tools[name];
}

export function getAllTools() {
  return tools;
}

export const toolDefinitions: ToolDefinition[] = [
  {
    name: "queryOrder",
    description: "根据订单号查询订单详情，包括商品信息、订单状态和物流信息",
    parameters: {
      type: "object",
      properties: {
        orderId: { type: "string", description: "订单号，通常是一串数字" },
      },
      required: ["orderId"],
    },
  },
  {
    name: "queryLogistics",
    description: "查询订单的物流配送信息",
    parameters: {
      type: "object",
      properties: {
        orderId: { type: "string", description: "订单号" },
      },
      required: ["orderId"],
    },
  },
  {
    name: "applyReturn",
    description: "提交退换货申请",
    parameters: {
      type: "object",
      properties: {
        orderId: { type: "string", description: "订单号" },
        reason: { type: "string", description: "退换货原因" },
        type: { type: "string", enum: ["退货退款", "换货", "仅退款"], description: "申请类型" },
      },
      required: ["orderId", "reason", "type"],
    },
  },
];
