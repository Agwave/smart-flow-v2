import {
  AgentContext,
  AgentMessage,
  OrchestratorConfig,
  DEFAULT_CONFIG,
  LLMConfig,
} from "./types";
import { toolDefinitions, tools } from "./tools";
import { intentAgent } from "./intent-agent";
import { reviewAgent } from "./review-agent";

const SYSTEM_PROMPT = `你是一个专业的电商售后智能客服助手，名叫"小智"。你的职责是为顾客提供高效、专业、有温度的售后服务。

## 你的核心能力：
1. **订单查询**：帮助顾客查询订单状态、物流信息
2. **退换货服务**：指导顾客完成退货、换货申请流程
3. **商品问题**：处理商品质量问题、缺件、错发等情况
4. **退款服务**：协助处理退款申请，解释退款流程和时效
5. **物流问题**：查询物流状态，处理物流异常（丢件、延误等）
6. **售后投诉**：倾听顾客诉求，提供合理的解决方案

## 工具使用规则（重要）：
当用户询问订单相关信息时，你**必须**使用以下工具来查询真实数据：
- **queryOrder**: 查询订单详情（包括商品、金额、物流）
- **queryLogistics**: 查询物流配送信息
- **applyReturn**: 提交退换货申请

**使用工具的示例**：
- 用户问"我的订单202603010001到哪了" → 必须先调用queryOrder或queryLogistics
- 用户问"这个订单的商品有哪些" → 必须先调用queryOrder

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
- 你必须使用工具查询真实的订单信息和物流状态
- 不要编造订单数据，必须调用工具获取
- 当需要实际操作时，引导顾客通过APP或联系人工客服完成`;

interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
  rawArguments: string;
}

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
    let chatMessages: { role: string; content: string; tool_calls?: unknown[]; tool_call_id?: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content || "",
      })),
    ];

    let intentContext = "";
    let intentResultData: Record<string, unknown> | null = null;

    if (this.config.enabledAgents?.includes("intent")) {
      yield JSON.stringify({ type: "agent_start", agent: "intent", label: "意图识别" });

      const context: AgentContext = { messages };
      const intentResult = await intentAgent.execute(context);

      if (intentResult.status === "completed" && intentResult.output) {
        const intent = intentResult.output;
        intentResultData = intent;
        intentContext = `\n[用户意图: ${intent.intentLabel || intent.intent || "未知"}]`;
        chatMessages[0].content += intentContext;

        yield JSON.stringify({
          type: "agent_complete",
          agent: "intent",
          label: "意图识别",
          result: intent,
          duration: intentResult.duration,
        });
      } else {
        yield JSON.stringify({
          type: "agent_error",
          agent: "intent",
          label: "意图识别",
          error: intentResult.error,
        });
      }
    }

    yield JSON.stringify({ type: "agent_start", agent: "answer", label: "生成回答" });

    const maxIterations = 10;
    let iteration = 0;

    while (iteration < maxIterations) {
      iteration++;

      const requestBody = {
        model: this.llmConfig.model,
        messages: chatMessages,
        stream: true,
        tools: toolDefinitions.map((def) => ({
          type: "function" as const,
          function: def,
        })),
      };

      const response = await fetch(`${this.llmConfig.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.llmConfig.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const decoder = new TextDecoder();
      const reader = response.body!.getReader();
      let buffer = "";
      let toolCalls: ToolCall[] = [];
      let currentText = "";
      let hasToolCalls = false;
      let finishReason = "";

      try {
        let streamEnded = false;
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
              streamEnded = true;
              break;
            }
            try {
              const parsed = JSON.parse(raw);
              const choice = parsed.choices?.[0];
              const delta = choice?.delta;

              if (delta?.content) {
                currentText += delta.content;
                yield JSON.stringify({ type: "content", text: delta.content });
              }

              if (delta?.tool_calls) {
                hasToolCalls = true;
                for (const tc of delta.tool_calls) {
                  const func = tc.function;
                  const existingIndex = toolCalls.findIndex((t) => t.name === func?.name);
                  if (existingIndex >= 0) {
                    toolCalls[existingIndex].rawArguments += func.arguments;
                  } else if (func?.name) {
                    toolCalls.push({ name: func.name, arguments: {}, rawArguments: func.arguments || "" });
                  }
                }
              }

              if (choice?.finish_reason) {
                finishReason = choice.finish_reason;
              }
            } catch { /* ignore */ }
          }
          
          if (streamEnded) break;
        }
      } finally {
        reader.releaseLock();
      }

      // 解析累积的工具调用参数
      for (const tc of toolCalls) {
        if (tc.rawArguments) {
          try {
            tc.arguments = JSON.parse(tc.rawArguments);
          } catch {
            // JSON 解析失败，尝试更宽松的解析
            try {
              const match = tc.rawArguments.match(/\{[\s\S]*\}/);
              if (match) {
                tc.arguments = JSON.parse(match[0]);
              }
            } catch { /* ignore */ }
          }
        }
      }

      if ((finishReason === "tool_calls" || hasToolCalls) && toolCalls.length > 0) {
        // 有工具调用，继续处理
      } else {
        yield JSON.stringify({ type: "agent_complete", agent: "answer", label: "生成回答" });
        break;
      }

      const assistantMessage = {
        role: "assistant" as const,
        content: currentText,
        tool_calls: toolCalls.map((tc, i) => ({
          id: `call_${i}`,
          type: "function" as const,
          function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
        })),
      };
      chatMessages.push(assistantMessage);

      for (const tc of toolCalls) {
        yield JSON.stringify({ type: "tool_call", tool: tc.name, args: tc.arguments });

        let toolResult: unknown;
        try {
          const toolFn = tools[tc.name as keyof typeof tools];
          if (toolFn && typeof toolFn.execute === "function") {
            toolResult = await (toolFn.execute as (args: Record<string, unknown>, options?: { abortSignal?: AbortSignal }) => Promise<unknown>)(tc.arguments);
          } else {
            toolResult = { error: `Unknown tool: ${tc.name}` };
          }
        } catch (err) {
          toolResult = { error: err instanceof Error ? err.message : "Tool execution failed" };
        }

        yield JSON.stringify({ type: "tool_result", tool: tc.name, result: toolResult });

        chatMessages.push({
          role: "tool" as const,
          content: JSON.stringify(toolResult),
          tool_call_id: assistantMessage.tool_calls?.find((t) => t.function.name === tc.name)?.id,
        });
      }
    }

    yield JSON.stringify({ type: "agent_complete", agent: "answer", label: "生成回答" });

    if (this.config.enableReview && chatMessages.length > 1) {
      yield JSON.stringify({ type: "agent_start", agent: "review", label: "安全审核" });
      const lastAssistantMsg = chatMessages.filter((m) => m.role === "assistant").pop();
      if (lastAssistantMsg?.content) {
        const reviewResult = await this.reviewResponse(lastAssistantMsg.content);
        yield JSON.stringify({
          type: "agent_complete",
          agent: "review",
          label: "安全审核",
          result: reviewResult,
        });
      }
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

  /**
   * @deprecated Use execute() with streaming instead. This method returns empty string.
   */
  async generateAnswer(_messages: { role: string; content: string }[]): Promise<string> {
    console.warn("generateAnswer() is deprecated. Use execute() with streaming instead.");
    return "";
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

export function createOrchestrator(config?: Partial<OrchestratorConfig>): AgentOrchestrator {
  return new AgentOrchestrator(config);
}
