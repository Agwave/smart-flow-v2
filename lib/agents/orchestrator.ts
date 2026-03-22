import {
  AgentContext,
  AgentMessage,
  OrchestratorConfig,
  DEFAULT_CONFIG,
  LLMConfig,
} from "./types";
import { toolDefinitions } from "./tools";
import { intentAgent } from "./intent-agent";
import { answerAgent } from "./answer-agent";
import { reviewAgent } from "./review-agent";

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

export class AgentOrchestrator {
  private config: OrchestratorConfig;
  private llmConfig: LLMConfig;

  constructor(config?: Partial<OrchestratorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.llmConfig = {
      provider: "zhipu",
      model: "glm-4-flash",
      apiKey: process.env.ZHIPU_API_KEY || "",
      baseURL: "https://open.bigmodel.cn/api/paas/v4",
    };
  }

  async *execute(messages: AgentMessage[]): AsyncGenerator<string, void, unknown> {
    const chatMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...messages.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" as const : "user" as const,
        content: msg.content || "",
      })),
    ];

    let intentContext = "";
    if (this.config.enabledAgents?.includes("intent")) {
      const context: AgentContext = { messages };
      const intentResult = await intentAgent.execute(context);
      if (intentResult.status === "completed" && intentResult.output) {
        const intent = intentResult.output;
        intentContext = `\n[用户意图: ${intent.intentLabel || intent.intent || "未知"}]`;
        console.log("[Intent Agent] Intent:", intent);
        chatMessages[0].content += intentContext;
      }
    }

    const fullResponse: string[] = [];
    for await (const chunk of answerAgent.execute(chatMessages)) {
      fullResponse.push(chunk);
      yield chunk;

      try {
        const parsed = JSON.parse(chunk);
        if (parsed.type === "done") {
          if (this.config.enableReview) {
            const responseText = fullResponse
              .map(c => {
                try {
                  return JSON.parse(c).text || "";
                } catch {
                  return "";
                }
              })
              .join("");
            
            if (responseText) {
              const reviewResult = await this.reviewResponse(responseText);
              console.log("[Review Agent] Result:", reviewResult);
            }
          }
          return;
        }
      } catch { /* ignore parse errors */ }
    }
  }

  async executeStream(
    messages: AgentMessage[],
    onChunk: (chunk: string) => void
  ): Promise<void> {
    for await (const chunk of this.execute(messages)) {
      onChunk(chunk);
    }
  }

  async runIntentDetection(messages: AgentMessage[]): Promise<Record<string, unknown> | null> {
    const context: AgentContext = { messages };
    const result = await intentAgent.execute(context);
    if (result.status === "completed" && result.output) {
      return result.output;
    }
    return null;
  }

  async generateAnswer(messages: { role: string; content: string }[]): Promise<string> {
    return answerAgent.executeNonStream(messages);
  }

  async reviewResponse(response: string): Promise<Record<string, unknown>> {
    const context: AgentContext = {
      messages: [],
      metadata: { response },
    };
    const result = await reviewAgent.execute(context);
    if (result.status === "completed" && result.output) {
      return result.output;
    }
    return { approved: true, riskLevel: "low", riskTags: [] };
  }

  getConfig(): OrchestratorConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<OrchestratorConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

let orchestratorInstance: AgentOrchestrator | null = null;

export function getOrchestrator(config?: Partial<OrchestratorConfig>): AgentOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestrator(config);
  }
  return orchestratorInstance;
}

export function createOrchestrator(config?: Partial<OrchestratorConfig>): AgentOrchestrator {
  return new AgentOrchestrator(config);
}
