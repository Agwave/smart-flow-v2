import { tool } from "ai";
import { z } from "zod";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

const mockOrders: Record<string, {
  id: string;
  status: string;
  items: string[];
  totalAmount: number;
  createTime: string;
  logistics: {
    company: string;
    trackingNo: string;
    status: string;
    lastUpdate: string;
  } | null;
}> = {
  "202603010001": {
    id: "202603010001",
    status: "已签收",
    items: ["Apple iPhone 16 Pro Max 256GB 沙漠钛金色"],
    totalAmount: 9999,
    createTime: "2026-03-01 14:30:00",
    logistics: {
      company: "顺丰速运",
      trackingNo: "SF1234567890",
      status: "已签收",
      lastUpdate: "2026-03-03 10:25:00 已签收，签收人：本人",
    },
  },
  "202602280002": {
    id: "202602280002",
    status: "配送中",
    items: ["Nike Air Max 270 运动鞋 黑色 42码", "Nike 运动袜 3双装"],
    totalAmount: 1299,
    createTime: "2026-02-28 09:15:00",
    logistics: {
      company: "中通快递",
      trackingNo: "ZT9876543210",
      status: "配送中",
      lastUpdate: "2026-03-05 08:00:00 [北京市] 快递员正在派送中",
    },
  },
  "202602250003": {
    id: "202602250003",
    status: "退款处理中",
    items: ["小米电动牙刷 T700"],
    totalAmount: 299,
    createTime: "2026-02-25 20:00:00",
    logistics: null,
  },
};

export const tools = {
  queryOrder: tool({
    description: "根据订单号查询订单详情，包括商品信息、订单状态和物流信息",
    parameters: z.object({
      orderId: z.string().describe("订单号，通常是一串数字"),
    }),
    execute: async ({ orderId }) => {
      const order = mockOrders[orderId];
      if (!order) {
        return { found: false, message: `未找到订单号为 ${orderId} 的订单，请核对订单号后重试。` };
      }
      return { found: true, order };
    },
  }),
  queryLogistics: tool({
    description: "查询订单的物流配送信息",
    parameters: z.object({
      orderId: z.string().describe("订单号"),
    }),
    execute: async ({ orderId }) => {
      const order = mockOrders[orderId];
      if (!order) {
        return { found: false, message: "未找到该订单" };
      }
      if (!order.logistics) {
        return { found: true, hasLogistics: false, message: "该订单暂无物流信息" };
      }
      return { found: true, hasLogistics: true, logistics: order.logistics };
    },
  }),
  applyReturn: tool({
    description: "模拟提交退换货申请",
    parameters: z.object({
      orderId: z.string().describe("订单号"),
      reason: z.string().describe("退换货原因"),
      type: z.enum(["退货退款", "换货", "仅退款"]).describe("申请类型"),
    }),
    execute: async ({ orderId, reason, type }) => {
      const order = mockOrders[orderId];
      if (!order) {
        return { success: false, message: "未找到该订单，请核对订单号" };
      }
      return {
        success: true,
        applicationId: `RET${Date.now()}`,
        message: `您的${type}申请已提交成功！申请单号：RET${Date.now().toString().slice(-8)}。预计1-3个工作日内审核完成，请留意站内消息通知。`,
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
    description: "模拟提交退换货申请",
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
