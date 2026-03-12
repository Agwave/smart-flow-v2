// ============================================================
// SmartFlow 核心类型定义
// ============================================================

// --- 会话与消息 ---
export type SessionStatus = "active" | "resolved" | "escalated" | "closed";
export type MessageRole = "user" | "assistant" | "system";

export interface Session {
  id: string;
  userId: string;
  status: SessionStatus;
  intent?: string;
  satisfaction?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentFlowStep {
  agent: "intent" | "rag" | "answer" | "review" | "ticket_router";
  label: string;
  status: "completed" | "in-progress" | "waiting" | "skipped";
  duration?: number; // ms
  output?: Record<string, unknown>;
}

export interface IntentResult {
  intent: string;
  intentLabel: string;
  canAutoAnswer: boolean;
  confidence: number;
  keyEntities: string[];
}

export interface RAGResult {
  documentsFound: number;
  topScore: number;
  sources: { title: string; score: number }[];
}

export interface ReviewResult {
  approved: boolean;
  riskLevel: "low" | "medium" | "high";
  riskTags: string[];
}

export interface AgentFlowData {
  steps: AgentFlowStep[];
  intentResult?: IntentResult;
  ragResult?: RAGResult;
  reviewResult?: ReviewResult;
  totalDuration: number;
  ticketCreated?: boolean;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  agentFlow?: AgentFlowData;
  toolResult?: ToolResultData;
  createdAt: string;
}

// --- 工具调用结果 ---
export type ToolResultType = "order_query" | "logistics_query" | "return_apply";

export interface OrderInfo {
  orderId: string;
  status: string;
  statusLabel: string;
  product: string;
  amount: number;
  payTime: string;
  shipTime?: string;
}

export interface LogisticsStep {
  time: string;
  description: string;
  current: boolean;
}

export interface LogisticsInfo {
  orderId: string;
  carrier: string;
  trackingNo: string;
  status: string;
  steps: LogisticsStep[];
}

export interface ReturnInfo {
  returnId: string;
  orderId: string;
  reason: string;
  status: string;
  refundAmount: number;
  estimatedDays: number;
}

export interface ToolResultData {
  type: ToolResultType;
  order?: OrderInfo;
  logistics?: LogisticsInfo;
  returnApply?: ReturnInfo;
}

// --- 工单 ---
export type TicketStatus = "pending" | "assigned" | "resolved" | "closed";
export type TicketPriority = "P0" | "P1" | "P2" | "P3";
export type TeamType =
  | "refund_team"
  | "logistics_team"
  | "quality_team"
  | "general_team";

export interface Ticket {
  id: string;
  sessionId: string;
  title: string;
  content: string;
  intent: string;
  intentLabel: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTeam: TeamType;
  assignedTeamLabel: string;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  messages: ChatMessage[];
  aiSuggestion?: string;
  aiSources?: { title: string; relevance: number }[];
}

// --- 知识库 ---
export type DocType = "faq" | "manual" | "policy" | "announcement";
export type DocStatus = "processing" | "ready" | "failed";

export interface DocumentChunk {
  id: string;
  content: string;
  tokenCount: number;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  docType: DocType;
  docTypeLabel: string;
  status: DocStatus;
  content: string;
  chunkCount: number;
  chunks?: DocumentChunk[];
  fileSize: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  documentId: string;
  documentTitle: string;
  chunk: string;
  score: number;
}

// --- 统计 ---
export interface DailyStats {
  date: string;
  sessions: number;
  resolved: number;
  escalated: number;
}

export interface IntentDistribution {
  intent: string;
  label: string;
  count: number;
  percentage: number;
}

export interface TeamPerformance {
  team: string;
  teamLabel: string;
  totalTickets: number;
  resolved: number;
  avgResponseTime: number; // minutes
}

export interface OverviewStats {
  todaySessions: number;
  todaySessionsTrend: number;
  resolveRate: number;
  resolveRateTrend: number;
  avgResponseTime: number; // seconds
  avgResponseTimeTrend: number;
  pendingTickets: number;
  pendingTicketsTrend: number;
}

// --- 系统设置 ---
export interface AgentConfig {
  intentConfidenceThreshold: number;
  ragTopK: number;
  ragStrategy: "hybrid" | "semantic" | "keyword";
  maxAutoRetries: number;
}

export interface SafetyConfig {
  maxAutoRefundAmount: number;
  maxRefundFrequency: number; // per 24h
  blacklistEnabled: boolean;
  blacklistKeywords: string[];
}

export interface RoutingRule {
  intent: string;
  intentLabel: string;
  team: TeamType;
  teamLabel: string;
  priority: TicketPriority;
  enabled: boolean;
}

// --- 辅助映射 ---
export const TICKET_STATUS_MAP: Record<
  TicketStatus,
  { label: string; color: string }
> = {
  pending: { label: "待处理", color: "amber" },
  assigned: { label: "已分配", color: "blue" },
  resolved: { label: "已解决", color: "green" },
  closed: { label: "已关闭", color: "gray" },
};

export const PRIORITY_MAP: Record<
  TicketPriority,
  { label: string; color: string }
> = {
  P0: { label: "紧急", color: "red" },
  P1: { label: "高", color: "orange" },
  P2: { label: "中", color: "blue" },
  P3: { label: "低", color: "gray" },
};

export const TEAM_MAP: Record<TeamType, string> = {
  refund_team: "退款处理组",
  logistics_team: "物流处理组",
  quality_team: "质量问题组",
  general_team: "综合客服组",
};

export const DOC_TYPE_MAP: Record<DocType, string> = {
  faq: "常见问题",
  manual: "操作手册",
  policy: "政策规范",
  announcement: "公告通知",
};

export const DOC_STATUS_MAP: Record<
  DocStatus,
  { label: string; color: string }
> = {
  processing: { label: "处理中", color: "amber" },
  ready: { label: "就绪", color: "green" },
  failed: { label: "失败", color: "red" },
};
