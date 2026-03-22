// ============================================================
// SmartFlow Agent System - Type Definitions
// ============================================================

import { Tool } from "ai";

/**
 * Agent types supported in the system
 */
export type AgentType = "intent" | "rag" | "answer" | "review" | "ticket_router";

/**
 * Agent execution status
 */
export type AgentStatus = "pending" | "running" | "completed" | "failed";

/**
 * Message structure for agent communication
 */
export interface AgentMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Context passed to each agent during execution
 */
export interface AgentContext {
  messages: AgentMessage[];
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Result returned by each agent
 */
export interface AgentResult {
  type: AgentType;
  status: AgentStatus;
  output?: Record<string, unknown>;
  error?: string;
  duration: number; // ms
}

/**
 * Agent interface - all agents must implement this
 */
export interface IAgent {
  readonly type: AgentType;
  readonly name: string;
  readonly description: string;

  /**
   * Execute the agent with given context
   */
  execute(context: AgentContext): Promise<AgentResult>;

  /**
   * Validate if agent can handle the given context
   */
  canHandle(context: AgentContext): boolean;
}

/**
 * Tool definition with metadata
 */
export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (params: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Orchestrator configuration
 */
export interface OrchestratorConfig {
  /**
   * Maximum time allowed for entire orchestration (ms)
   */
  maxDuration?: number;

  /**
   * Enable/disable specific agent types
   */
  enabledAgents?: AgentType[];

  /**
   * Confidence threshold for intent detection
   */
  intentThreshold?: number;

  /**
   * Enable RAG retrieval
   */
  enableRAG?: boolean;

  /**
   * Enable safety review
   */
  enableReview?: boolean;
}

/**
 * Default orchestrator configuration
 */
export const DEFAULT_CONFIG: OrchestratorConfig = {
  maxDuration: 60000,
  enabledAgents: ["intent", "answer"],
  intentThreshold: 0.7,
  enableRAG: false, // Phase 1: disabled
  enableReview: false, // Phase 1: disabled
};

/**
 * Streaming callback for SSE responses
 */
export interface StreamCallbacks {
  onContent?: (text: string) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

/**
 * LLM Provider configuration
 */
export interface LLMConfig {
  provider: "zhipu" | "openai" | "anthropic";
  model: string;
  apiKey: string;
  baseURL?: string;
}

/**
 * Tool execution result
 */
export interface ToolExecutionResult {
  toolName: string;
  success: boolean;
  result?: unknown;
  error?: string;
  duration: number;
}
