import { tool } from "ai";
import { z } from "zod";

const SYSTEM_PROMPT = `你是一个专业的电商售后智能客服助手，名叫"小智"。你的职责是为顾客提供高效、专业、有温度的售后服务。

## 你的核心能力：
1. **订单查询**：帮助顾客查询订单状态、物流信息
2. **退换货服务**：指导顾客完成退货、换货申请流程
3. **商品问题**：处理商品质量问题、缺件、错发等情况
4. **退款服务**：协助处理退款申请，解释退款流程和时效
5. **物流问题**：查询物流状态，处理物流异常（丢件、延误等）
6. **售后投诉**：倾听顾客诉求，提供合理的解决方案

## 沟通原则：
- 始终保持礼貌、耐心、专业的态度
- 使用简洁清晰的中文回复
- 适当使用分步骤说明，方便顾客理解
- 当遇到无法处理的问题时，建议顾客联系人工客服（工作时间：9:00-22:00）
- 主动提供解决方案而不是被动等待
- 回复控制在合理长度，不要过于冗长

## 退换货政策参考：
- 7天无理由退换货（商品未使用、包装完好）
- 15天内质量问题可申请退换
- 退款一般3-7个工作日到账
- 运费险覆盖的订单退货包邮，其他需顾客承担退货运费

## 重要提醒：
- 你是AI助手，不能实际操作系统执行退换货等操作
- 你可以使用工具查询模拟的订单信息和物流状态
- 当需要实际操作时，引导顾客通过APP或联系人工客服完成
- 不要编造不存在的优惠活动或承诺`;

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

const tools = {
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

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    return new Response("Missing API key", { status: 500 });
  }

  const chatMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content || "",
    })),
  ];

  const response = await fetch(
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen-plus",
        input: { messages: chatMessages },
        parameters: { result_format: "message", stream: false },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    return new Response(`API Error: ${response.status} - ${errorText}`, { status: 500 });
  }

  const data = await response.json();
  const fullText = data.output?.choices?.[0]?.message?.content || "抱歉，我暂时无法回答。";

  const encoder = new TextEncoder();
  const chunks = fullText.match(/[^.!?。！？]+[.!?。！？]?/g) || [fullText];

  const stream = new ReadableStream({
    start(controller) {
      let index = 0;
      const sendChunk = () => {
        if (index >= chunks.length) {
          controller.enqueue(encoder.encode("data: {\"type\":\"done\"}\n\n"));
          controller.close();
          return;
        }
        const chunk = chunks[index];
        const escapedText = chunk.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        controller.enqueue(encoder.encode(`data: {"type":"content","text":"${escapedText}"}\n\n`));
        index++;
        setTimeout(sendChunk, 30);
      };
      sendChunk();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
