import type { IAgent, AgentContext, AgentResult, AgentType, AgentStatus } from "./types";

export abstract class BaseAgent implements IAgent {
  abstract readonly type: AgentType;
  abstract readonly name: string;
  abstract readonly description: string;

  abstract execute(context: AgentContext): Promise<AgentResult>;
  abstract canHandle(context: AgentContext): boolean;

  protected createResult(
    status: AgentStatus,
    output?: Record<string, unknown>,
    error?: string
  ): AgentResult {
    return {
      type: this.type,
      status,
      output,
      error,
      duration: 0,
    };
  }

  protected async measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  }
}

export class FallbackAgent extends BaseAgent {
  readonly type = "answer" as AgentType;
  readonly name = "Fallback";
  readonly description = "Default fallback agent";

  async execute(context: AgentContext): Promise<AgentResult> {
    return this.createResult("completed", {
      message: "Fallback agent executed",
    });
  }

  canHandle(): boolean {
    return true;
  }
}
