import type { AgentContext, AgentResult, AgentType, AgentStatus } from "./types";

const REVIEW_PROMPT = `你是一个内容安全审核助手。请审核AI生成的回复是否安全、合规。

## 审核标准：
1. **低风险 (low)** - 回复内容安全，可以直接返回给用户
2. **中风险 (medium)** - 回复包含可能引起误解的内容，需要注意
3. **高风险 (high)** - 回复包含不当内容，需要拦截或修改

## 审核要点：
- 是否包含敏感词汇
- 是否承诺了无法兑现的内容
- 是否涉及虚假信息
- 是否有过激言论
- 是否有安全隐患

## 输出格式（JSON）：
{
  "approved": true/false,
  "riskLevel": "low/medium/high",
  "riskTags": ["风险标签1", "风险标签2"]
}

请直接输出JSON，不要其他内容。`;

export class ReviewAgent {
  readonly type: AgentType = "review";
  readonly name = "安全审核";
  readonly description = "审核回复内容的安全性";

  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.ZHIPU_API_KEY || "";
    this.baseURL = "https://open.bigmodel.cn/api/paas/v4";
    this.model = "glm-4-flash";
  }

  canHandle(context: AgentContext): boolean {
    return !!context.metadata?.["response"];
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = performance.now();

    try {
      const response = context.metadata?.["response"] as string;
      if (!response) {
        return {
          type: this.type,
          status: "completed" as AgentStatus,
          output: { approved: true, riskLevel: "low", riskTags: [] },
          duration: 0,
        };
      }

      const messages = [
        { role: "system" as const, content: REVIEW_PROMPT },
        { role: "user" as const, content: `请审核以下回复：\n${response}` },
      ];

      const apiResponse = await fetch(`${this.baseURL}/chat/completions`, {
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

      if (!apiResponse.ok) {
        return {
          type: this.type,
          status: "completed" as AgentStatus,
          output: { approved: true, riskLevel: "low", riskTags: [] },
          duration: performance.now() - startTime,
        };
      }

      const data = await apiResponse.json();
      const content = data.choices?.[0]?.message?.content || "";

      let parsed: Record<string, unknown> = {};
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch {
        parsed = { approved: true, riskLevel: "low", riskTags: [] };
      }

      const duration = performance.now() - startTime;
      return {
        type: this.type,
        status: "completed" as AgentStatus,
        output: {
          approved: parsed.approved ?? true,
          riskLevel: parsed.riskLevel || "low",
          riskTags: parsed.riskTags || [],
        },
        duration,
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      return {
        type: this.type,
        status: "completed" as AgentStatus,
        output: { approved: true, riskLevel: "low", riskTags: [] },
        duration,
      };
    }
  }
}

export const reviewAgent = new ReviewAgent();
