import type { AgentContext, AgentResult, AgentType } from "./types";
import { toolDefinitions } from "./tools";

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

export interface AnswerAgentConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

export class AnswerAgent {
  readonly type: AgentType = "answer";
  readonly name = "回答生成";
  readonly description = "基于上下文生成最终回复";

  private config: AnswerAgentConfig;

  constructor(config?: Partial<AnswerAgentConfig>) {
    this.config = {
      apiKey: process.env.ZHIPU_API_KEY || "",
      baseURL: "https://open.bigmodel.cn/api/paas/v4",
      model: "glm-4-flash",
      ...config,
    };
  }

  canHandle(): boolean {
    return true;
  }

  async *execute(messages: { role: string; content: string }[]): AsyncGenerator<string, void, unknown> {
    const chatMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...messages.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" as const : "user" as const,
        content: msg.content || "",
      })),
    ];

    const response = await fetch(`${this.config.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: chatMessages,
        stream: true,
        tools: toolDefinitions.map((def) => ({
          type: "function" as const,
          function: def,
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const decoder = new TextDecoder();
    const reader = response.body!.getReader();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") {
            yield JSON.stringify({ type: "done" });
            return;
          }
          try {
            const parsed = JSON.parse(raw);
            const text: string | undefined = parsed.choices?.[0]?.delta?.content;
            if (text) {
              yield JSON.stringify({ type: "content", text });
            }
          } catch { /* ignore malformed lines */ }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async executeNonStream(messages: { role: string; content: string }[]): Promise<string> {
    const chatMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...messages.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" as const : "user" as const,
        content: msg.content || "",
      })),
    ];

    const response = await fetch(`${this.config.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: chatMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }
}

export const answerAgent = new AnswerAgent();
