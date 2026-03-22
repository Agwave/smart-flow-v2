import { BaseAgent } from "./base";
import type { AgentContext, AgentResult, AgentType, AgentStatus } from "./types";

const INTENT_PROMPT = `你是一个意图识别助手。请分析用户消息，识别其意图。

## 支持的意图类型：
1. order_query - 查询订单状态、物流信息
2. return_apply - 申请退换货
3. refund_apply - 申请退款
4. logistics_query - 仅查询物流
5. complaint - 投诉
6. general - 一般咨询

## 输出格式（JSON）：
{
  "intent": "意图类型",
  "intentLabel": "意图中文标签",
  "canAutoAnswer": true/false,
  "confidence": 0.0-1.0,
  "keyEntities": ["订单号", "商品名称", "问题描述"]
}

请直接输出JSON，不要其他内容。`;

export class IntentAgent extends BaseAgent {
  readonly type: AgentType = "intent";
  readonly name = "意图识别";
  readonly description = "识别用户意图并提取关键实体";

  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor() {
    super();
    this.apiKey = process.env.ZHIPU_API_KEY || "";
    this.baseURL = "https://open.bigmodel.cn/api/paas/v4";
    this.model = "glm-4-flash";
  }

  canHandle(context: AgentContext): boolean {
    const lastMessage = context.messages[context.messages.length - 1];
    return lastMessage?.role === "user" && !!lastMessage?.content;
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = performance.now();
    
    try {
      const lastMessage = context.messages[context.messages.length - 1];
      if (!lastMessage || lastMessage.role !== "user") {
        return this.createResult("failed", undefined, "No user message found");
      }

      const messages = [
        { role: "system" as const, content: INTENT_PROMPT },
        { role: "user" as const, content: lastMessage.content },
      ];

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return this.createResult("failed", undefined, `API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      let parsed: Record<string, unknown> = {};
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch {
        parsed = { intent: "general", intentLabel: "一般咨询", canAutoAnswer: true, confidence: 0.5, keyEntities: [] };
      }

      const duration = performance.now() - startTime;
      return {
        type: this.type,
        status: "completed",
        output: {
          intent: parsed.intent || "general",
          intentLabel: parsed.intentLabel || "一般咨询",
          canAutoAnswer: parsed.canAutoAnswer ?? true,
          confidence: parsed.confidence || 0.5,
          keyEntities: parsed.keyEntities || [],
        },
        duration,
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        type: this.type,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        duration,
      };
    }
  }
}

export const intentAgent = new IntentAgent();
