import type {
  Ticket,
  KnowledgeDocument,
  DailyStats,
  IntentDistribution,
  TeamPerformance,
  OverviewStats,
  AgentConfig,
  SafetyConfig,
  RoutingRule,
  SearchResult,
  ChatMessage,
  AgentFlowData,
} from "./types";

// ============================================================
// Mock 工单数据
// ============================================================
export const mockTickets: Ticket[] = [
  {
    id: "TK-20260301-001",
    sessionId: "sess-001",
    title: "商品质量问题要求退货退款",
    content:
      "用户反馈购买的蓝牙耳机左耳无声音，要求退货退款。订单金额 299 元，已收货 3 天。",
    intent: "return_refund",
    intentLabel: "退货退款",
    status: "pending",
    priority: "P1",
    assignedTeam: "quality_team",
    assignedTeamLabel: "质量问题组",
    createdAt: "2026-03-05T09:15:00Z",
    updatedAt: "2026-03-05T09:15:00Z",
    messages: [
      {
        id: "msg-001-1",
        sessionId: "sess-001",
        role: "user",
        content: "我买的蓝牙耳机左耳没声音了，才用了3天，我要退货退款",
        createdAt: "2026-03-05T09:10:00Z",
      },
      {
        id: "msg-001-2",
        sessionId: "sess-001",
        role: "assistant",
        content:
          "很抱歉给您带来不便。我已查询到您的订单 202603010088，蓝牙耳机 299 元。根据我们的退换货政策，7天内质量问题支持退货退款。我已为您提交退货申请，审核通过后将在 1-3 个工作日内退款至原支付账户。",
        createdAt: "2026-03-05T09:10:05Z",
      },
    ],
    aiSuggestion:
      "建议优先处理此工单。用户反馈质量问题且在 7 天退货期内，根据退换货政策（KB-003）可直接批准退货退款申请。建议回复：尊敬的用户您好，您的退货申请已审核通过，退款将在 1-3 个工作日内退回原支付账户。如有其他问题请随时联系我们。",
    aiSources: [
      { title: "退换货政策 v2.1", relevance: 0.95 },
      { title: "质量问题处理流程", relevance: 0.88 },
    ],
  },
  {
    id: "TK-20260301-002",
    sessionId: "sess-002",
    title: "物流长时间未更新",
    content:
      "用户反馈订单已发货5天但物流信息3天未更新，担心包裹丢失。订单金额 158 元。",
    intent: "logistics_inquiry",
    intentLabel: "物流查询",
    status: "assigned",
    priority: "P2",
    assignedTeam: "logistics_team",
    assignedTeamLabel: "物流处理组",
    assignee: "李明",
    createdAt: "2026-03-04T14:30:00Z",
    updatedAt: "2026-03-05T10:00:00Z",
    messages: [
      {
        id: "msg-002-1",
        sessionId: "sess-002",
        role: "user",
        content: "我的订单发了5天了，物流信息3天没更新了，是不是丢了？",
        createdAt: "2026-03-04T14:25:00Z",
      },
      {
        id: "msg-002-2",
        sessionId: "sess-002",
        role: "assistant",
        content:
          "我理解您的担忧。我已为您查询物流信息，您的包裹目前在中转站等待分拣。由于近期物流量较大，可能存在延迟。如果 48 小时内仍无更新，我们将为您联系物流公司核实。",
        createdAt: "2026-03-04T14:25:08Z",
      },
    ],
    aiSuggestion:
      "建议联系承运商中通快递确认包裹状态。运单号 ZT2026030199887，最后更新位置为杭州中转站。若确认丢失，需按照物流赔付政策进行处理。",
    aiSources: [
      { title: "物流异常处理指南", relevance: 0.92 },
      { title: "承运商联系方式汇总", relevance: 0.78 },
    ],
  },
  {
    id: "TK-20260301-003",
    sessionId: "sess-003",
    title: "价格保护申请",
    content:
      "用户发现购买的商品降价 50 元，要求补差价。订单在价保期（15天）内。",
    intent: "price_protect",
    intentLabel: "价格保护",
    status: "resolved",
    priority: "P3",
    assignedTeam: "refund_team",
    assignedTeamLabel: "退款处理组",
    assignee: "王芳",
    createdAt: "2026-03-03T11:00:00Z",
    updatedAt: "2026-03-04T09:30:00Z",
    resolvedAt: "2026-03-04T09:30:00Z",
    messages: [
      {
        id: "msg-003-1",
        sessionId: "sess-003",
        role: "user",
        content: "我上周买的衣服今天降价了50块，能补差价吗？",
        createdAt: "2026-03-03T10:55:00Z",
      },
      {
        id: "msg-003-2",
        sessionId: "sess-003",
        role: "assistant",
        content:
          "经查询，您的订单在 15 天价格保护期内，符合补差价条件。已为您提交 50 元差价补偿申请，预计 1-2 个工作日到账。",
        createdAt: "2026-03-03T10:55:06Z",
      },
    ],
    aiSuggestion: "工单已解决，差价已退回用户账户。",
    aiSources: [{ title: "价格保护政策说明", relevance: 0.96 }],
  },
  {
    id: "TK-20260301-004",
    sessionId: "sess-004",
    title: "收到商品与描述不符",
    content:
      "用户反馈收到的运动鞋颜色与商品页面展示不一致，要求换货。订单金额 459 元。",
    intent: "exchange",
    intentLabel: "换货申请",
    status: "pending",
    priority: "P1",
    assignedTeam: "quality_team",
    assignedTeamLabel: "质量问题组",
    createdAt: "2026-03-05T08:20:00Z",
    updatedAt: "2026-03-05T08:20:00Z",
    messages: [
      {
        id: "msg-004-1",
        sessionId: "sess-004",
        role: "user",
        content: "我买的白色运动鞋收到是米白色的，跟图片差太多了，我要换一双",
        createdAt: "2026-03-05T08:15:00Z",
      },
    ],
    aiSuggestion:
      "建议核实商品图片与实物色差问题，若确认不符可安排换货。需要用户提供实物照片作为凭证。",
    aiSources: [
      { title: "商品描述不符处理流程", relevance: 0.91 },
      { title: "换货操作手册", relevance: 0.85 },
    ],
  },
  {
    id: "TK-20260301-005",
    sessionId: "sess-005",
    title: "修改收货地址请求",
    content:
      "用户订单已发货但需要修改收货地址，包裹尚未到达目的地城市。",
    intent: "address_change",
    intentLabel: "修改地址",
    status: "assigned",
    priority: "P2",
    assignedTeam: "logistics_team",
    assignedTeamLabel: "物流处理组",
    assignee: "赵强",
    createdAt: "2026-03-04T16:45:00Z",
    updatedAt: "2026-03-05T09:00:00Z",
    messages: [],
    aiSuggestion:
      "包裹目前在途中，可联系中通快递申请拦截并修改地址。运单号 ZT2026030288776。",
    aiSources: [{ title: "地址修改操作指南", relevance: 0.89 }],
  },
  {
    id: "TK-20260301-006",
    sessionId: "sess-006",
    title: "批量订单退款申请（疑似恶意）",
    content:
      "用户在 24 小时内提交了 5 笔退款申请，总金额超过 2000 元。安全阀触发，需人工审核。",
    intent: "return_refund",
    intentLabel: "退货退款",
    status: "pending",
    priority: "P0",
    assignedTeam: "refund_team",
    assignedTeamLabel: "退款处理组",
    createdAt: "2026-03-05T07:30:00Z",
    updatedAt: "2026-03-05T07:30:00Z",
    messages: [],
    aiSuggestion:
      "安全阀已触发：24h 内退款次数超过阈值（5次/24h），总金额 2,350 元超过自动退款上限。建议人工核实用户历史行为后决定是否批准。",
    aiSources: [
      { title: "退款风控策略文档", relevance: 0.97 },
      { title: "异常行为识别规则", relevance: 0.93 },
    ],
  },
  {
    id: "TK-20260301-007",
    sessionId: "sess-007",
    title: "商品使用咨询",
    content: "用户询问购买的空气炸锅如何使用预设菜单功能。",
    intent: "product_consult",
    intentLabel: "商品咨询",
    status: "closed",
    priority: "P3",
    assignedTeam: "general_team",
    assignedTeamLabel: "综合客服组",
    assignee: "张丽",
    createdAt: "2026-03-02T15:20:00Z",
    updatedAt: "2026-03-02T16:00:00Z",
    resolvedAt: "2026-03-02T15:50:00Z",
    messages: [],
    aiSuggestion: "已通过知识库自动回答，用户确认满意。",
    aiSources: [{ title: "空气炸锅使用说明 FAQ", relevance: 0.94 }],
  },
  {
    id: "TK-20260301-008",
    sessionId: "sess-008",
    title: "发票申请",
    content: "用户要求开具增值税普通发票，订单金额 1,280 元。",
    intent: "invoice",
    intentLabel: "发票申请",
    status: "assigned",
    priority: "P3",
    assignedTeam: "general_team",
    assignedTeamLabel: "综合客服组",
    assignee: "张丽",
    createdAt: "2026-03-04T10:15:00Z",
    updatedAt: "2026-03-05T08:45:00Z",
    messages: [],
    aiSuggestion: "用户要求开具增值税普通发票，可直接在系统中操作开票。",
    aiSources: [{ title: "发票开具操作流程", relevance: 0.9 }],
  },
  {
    id: "TK-20260301-009",
    sessionId: "sess-009",
    title: "商品缺件投诉",
    content: "用户反馈收到的套装商品少了一个配件（充电线），要求补发。",
    intent: "missing_parts",
    intentLabel: "缺件补发",
    status: "resolved",
    priority: "P2",
    assignedTeam: "quality_team",
    assignedTeamLabel: "质量问题组",
    assignee: "陈刚",
    createdAt: "2026-03-03T09:00:00Z",
    updatedAt: "2026-03-04T14:00:00Z",
    resolvedAt: "2026-03-04T14:00:00Z",
    messages: [],
    aiSuggestion: "已安排补发配件，运单号 SF2026030412345。",
    aiSources: [{ title: "缺件补发处理流程", relevance: 0.92 }],
  },
  {
    id: "TK-20260301-010",
    sessionId: "sess-010",
    title: "会员积分兑换问题",
    content: "用户反馈积分兑换的优惠券未到账，要求核实。",
    intent: "account_inquiry",
    intentLabel: "账户查询",
    status: "closed",
    priority: "P3",
    assignedTeam: "general_team",
    assignedTeamLabel: "综合客服组",
    assignee: "王芳",
    createdAt: "2026-03-01T13:40:00Z",
    updatedAt: "2026-03-01T15:00:00Z",
    resolvedAt: "2026-03-01T14:50:00Z",
    messages: [],
    aiSuggestion: "积分兑换延迟到账，已手动补发优惠券。",
    aiSources: [{ title: "积分系统 FAQ", relevance: 0.87 }],
  },
];

// ============================================================
// Mock 知识库数据
// ============================================================
export const mockDocuments: KnowledgeDocument[] = [
  {
    id: "KB-001",
    title: "售后服务常见问题 FAQ",
    docType: "faq",
    docTypeLabel: "常见问题",
    status: "ready",
    content:
      "包含退换货流程、物流查询方式、退款时效、发票申请等 50+ 条常见问题解答。",
    chunkCount: 52,
    fileSize: "128 KB",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-03-01T08:00:00Z",
    chunks: [
      {
        id: "chunk-001-1",
        content: "Q: 如何申请退货？A: 在订单详情页点击申请退货，填写退货原因并提交...",
        tokenCount: 156,
      },
      {
        id: "chunk-001-2",
        content: "Q: 退款多久到账？A: 退款审核通过后，根据支付方式不同，1-7个工作日到账...",
        tokenCount: 142,
      },
      {
        id: "chunk-001-3",
        content: "Q: 如何查询物流？A: 在订单详情页可查看实时物流信息，也可使用快递单号在承运商官网查询...",
        tokenCount: 168,
      },
    ],
  },
  {
    id: "KB-002",
    title: "客服操作手册 v3.0",
    docType: "manual",
    docTypeLabel: "操作手册",
    status: "ready",
    content:
      "客服团队日常操作流程，包含工单处理、升级流程、话术规范、系统使用指南等内容。",
    chunkCount: 38,
    fileSize: "256 KB",
    createdAt: "2026-02-01T09:00:00Z",
    updatedAt: "2026-02-28T14:00:00Z",
  },
  {
    id: "KB-003",
    title: "退换货政策 v2.1",
    docType: "policy",
    docTypeLabel: "政策规范",
    status: "ready",
    content:
      "商品退换货政策详细说明：7天无理由退货条件、质量问题换货流程、特殊商品退换货限制等。",
    chunkCount: 24,
    fileSize: "64 KB",
    createdAt: "2026-01-20T11:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "KB-004",
    title: "物流异常处理指南",
    docType: "manual",
    docTypeLabel: "操作手册",
    status: "ready",
    content:
      "物流异常情况处理方案：包裹延迟、丢件、破损、拒收等场景的标准处理流程。",
    chunkCount: 18,
    fileSize: "48 KB",
    createdAt: "2026-02-10T15:00:00Z",
    updatedAt: "2026-02-25T09:00:00Z",
  },
  {
    id: "KB-005",
    title: "价格保护与促销规则",
    docType: "policy",
    docTypeLabel: "政策规范",
    status: "ready",
    content:
      "价格保护期限说明（15天）、促销活动价格保护例外、补差价流程等。",
    chunkCount: 12,
    fileSize: "32 KB",
    createdAt: "2026-02-20T10:00:00Z",
    updatedAt: "2026-03-02T11:00:00Z",
  },
  {
    id: "KB-006",
    title: "2026年3月促销活动公告",
    docType: "announcement",
    docTypeLabel: "公告通知",
    status: "ready",
    content:
      "2026年3月大促活动详情：满减规则、优惠券使用说明、活动时间安排、常见问题预案。",
    chunkCount: 8,
    fileSize: "24 KB",
    createdAt: "2026-03-01T08:00:00Z",
    updatedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "KB-007",
    title: "退款风控策略文档",
    docType: "policy",
    docTypeLabel: "政策规范",
    status: "processing",
    content: "退款风控规则配置，包含频率限制、金额阈值、黑名单机制等安全阀策略。",
    chunkCount: 0,
    fileSize: "16 KB",
    createdAt: "2026-03-05T07:00:00Z",
    updatedAt: "2026-03-05T07:00:00Z",
  },
];

// ============================================================
// Mock 统计数据
// ============================================================
export const mockOverviewStats: OverviewStats = {
  todaySessions: 1284,
  todaySessionsTrend: 12.5,
  resolveRate: 87.3,
  resolveRateTrend: 3.2,
  avgResponseTime: 4.2,
  avgResponseTimeTrend: -8.5,
  pendingTickets: 23,
  pendingTicketsTrend: -15.0,
};

export const mockDailyStats: DailyStats[] = Array.from(
  { length: 30 },
  (_, i) => {
    const date = new Date(2026, 1, 4 + i);
    const base = 800 + Math.floor(Math.random() * 600);
    return {
      date: date.toISOString().split("T")[0],
      sessions: base,
      resolved: Math.floor(base * (0.75 + Math.random() * 0.15)),
      escalated: Math.floor(base * (0.05 + Math.random() * 0.08)),
    };
  }
);

export const mockIntentDistribution: IntentDistribution[] = [
  { intent: "return_refund", label: "退货退款", count: 342, percentage: 26.7 },
  {
    intent: "logistics_inquiry",
    label: "物流查询",
    count: 289,
    percentage: 22.5,
  },
  {
    intent: "product_consult",
    label: "商品咨询",
    count: 234,
    percentage: 18.2,
  },
  {
    intent: "price_protect",
    label: "价格保护",
    count: 156,
    percentage: 12.2,
  },
  { intent: "exchange", label: "换货申请", count: 112, percentage: 8.7 },
  {
    intent: "account_inquiry",
    label: "账户查询",
    count: 89,
    percentage: 6.9,
  },
  { intent: "other", label: "其他", count: 62, percentage: 4.8 },
];

export const mockTeamPerformance: TeamPerformance[] = [
  {
    team: "refund_team",
    teamLabel: "退款处理组",
    totalTickets: 156,
    resolved: 142,
    avgResponseTime: 25,
  },
  {
    team: "logistics_team",
    teamLabel: "物流处理组",
    totalTickets: 134,
    resolved: 118,
    avgResponseTime: 35,
  },
  {
    team: "quality_team",
    teamLabel: "质量问题组",
    totalTickets: 98,
    resolved: 82,
    avgResponseTime: 45,
  },
  {
    team: "general_team",
    teamLabel: "综合客服组",
    totalTickets: 210,
    resolved: 198,
    avgResponseTime: 15,
  },
];

// ============================================================
// Mock 搜索结果
// ============================================================
export const mockSearchResults: SearchResult[] = [
  {
    documentId: "KB-001",
    documentTitle: "售后服务常见问题 FAQ",
    chunk:
      "Q: 如何申请退货？A: 在订单详情页点击「申请退货」按钮，选择退货原因，填写退货说明并提交申请。审核通过后，按照提示将商品寄回指定地址。",
    score: 0.95,
  },
  {
    documentId: "KB-003",
    documentTitle: "退换货政策 v2.1",
    chunk:
      "7天无理由退货：自签收之日起7天内，商品未使用且不影响二次销售的情况下，可申请无理由退货。特殊商品（定制类、生鲜类）不适用。",
    score: 0.91,
  },
  {
    documentId: "KB-002",
    documentTitle: "客服操作手册 v3.0",
    chunk:
      "退货处理流程：1. 核实用户身份和订单信息 2. 确认退货原因 3. 检查是否在退货期限内 4. 审核通过后生成退货单 5. 用户寄回商品 6. 验收后发起退款",
    score: 0.87,
  },
];

// ============================================================
// Mock Agent 流程数据
// ============================================================
export function generateMockAgentFlow(
  intent: string,
  needsTicket: boolean = false
): AgentFlowData {
  const steps: AgentFlowData["steps"] = [
    {
      agent: "intent",
      label: "意图识别",
      status: "completed",
      duration: 120,
    },
    { agent: "rag", label: "知识检索", status: "completed", duration: 340 },
    { agent: "answer", label: "回答生成", status: "completed", duration: 890 },
    { agent: "review", label: "质量审核", status: "completed", duration: 85 },
  ];

  if (needsTicket) {
    steps.push({
      agent: "ticket_router",
      label: "工单路由",
      status: "completed",
      duration: 45,
    });
  }

  const intentMap: Record<
    string,
    { label: string; canAuto: boolean; entities: string[] }
  > = {
    return_refund: {
      label: "退货退款",
      canAuto: !needsTicket,
      entities: ["订单号", "商品名", "退货原因"],
    },
    logistics_inquiry: {
      label: "物流查询",
      canAuto: true,
      entities: ["订单号", "快递单号"],
    },
    product_consult: {
      label: "商品咨询",
      canAuto: true,
      entities: ["商品名", "问题类型"],
    },
    price_protect: {
      label: "价格保护",
      canAuto: true,
      entities: ["订单号", "差价金额"],
    },
    exchange: {
      label: "换货申请",
      canAuto: false,
      entities: ["订单号", "商品名", "换货原因"],
    },
  };

  const info = intentMap[intent] || {
    label: "其他",
    canAuto: false,
    entities: [],
  };

  return {
    steps,
    intentResult: {
      intent,
      intentLabel: info.label,
      canAutoAnswer: info.canAuto,
      confidence: 0.85 + Math.random() * 0.12,
      keyEntities: info.entities,
    },
    ragResult: {
      documentsFound: 3 + Math.floor(Math.random() * 5),
      topScore: 0.88 + Math.random() * 0.1,
      sources: [
        { title: "售后服务常见问题 FAQ", score: 0.95 },
        { title: "退换货政策 v2.1", score: 0.91 },
        { title: "客服操作手册 v3.0", score: 0.87 },
      ],
    },
    reviewResult: {
      approved: !needsTicket,
      riskLevel: needsTicket ? "high" : "low",
      riskTags: needsTicket ? ["金额超限", "频率异常"] : [],
    },
    totalDuration: steps.reduce((sum, s) => sum + (s.duration || 0), 0),
    ticketCreated: needsTicket,
  };
}

// ============================================================
// Mock 系统设置
// ============================================================
export const mockAgentConfig: AgentConfig = {
  intentConfidenceThreshold: 0.85,
  ragTopK: 5,
  ragStrategy: "hybrid",
  maxAutoRetries: 3,
};

export const mockSafetyConfig: SafetyConfig = {
  maxAutoRefundAmount: 500,
  maxRefundFrequency: 3,
  blacklistEnabled: true,
  blacklistKeywords: ["投诉工商", "消费者协会", "找媒体曝光", "法律途径"],
};

export const mockRoutingRules: RoutingRule[] = [
  {
    intent: "return_refund",
    intentLabel: "退货退款",
    team: "refund_team",
    teamLabel: "退款处理组",
    priority: "P1",
    enabled: true,
  },
  {
    intent: "logistics_inquiry",
    intentLabel: "物流查询",
    team: "logistics_team",
    teamLabel: "物流处理组",
    priority: "P2",
    enabled: true,
  },
  {
    intent: "exchange",
    intentLabel: "换货申请",
    team: "quality_team",
    teamLabel: "质量问题组",
    priority: "P1",
    enabled: true,
  },
  {
    intent: "product_consult",
    intentLabel: "商品咨询",
    team: "general_team",
    teamLabel: "综合客服组",
    priority: "P3",
    enabled: true,
  },
  {
    intent: "price_protect",
    intentLabel: "价格保护",
    team: "refund_team",
    teamLabel: "退款处理组",
    priority: "P3",
    enabled: true,
  },
  {
    intent: "account_inquiry",
    intentLabel: "账户查询",
    team: "general_team",
    teamLabel: "综合客服组",
    priority: "P3",
    enabled: true,
  },
  {
    intent: "invoice",
    intentLabel: "发票申请",
    team: "general_team",
    teamLabel: "综合客服组",
    priority: "P3",
    enabled: true,
  },
  {
    intent: "missing_parts",
    intentLabel: "缺件补发",
    team: "quality_team",
    teamLabel: "质量问题组",
    priority: "P2",
    enabled: true,
  },
];

// ============================================================
// Mock 会话消息（用于聊天页面演示）
// ============================================================
export const mockWelcomeMessages: ChatMessage[] = [
  {
    id: "welcome-1",
    sessionId: "demo",
    role: "assistant",
    content:
      "您好！我是 SmartFlow 智能客服助手。我可以帮您处理退换货、查询物流、解答商品问题等售后需求。请问有什么可以帮到您的？",
    createdAt: new Date().toISOString(),
  },
];

// ============================================================
// 月度统计（用于报表页面）
// ============================================================
export const mockMonthlyResolutionRate = Array.from(
  { length: 30 },
  (_, i) => ({
    date: new Date(2026, 1, 4 + i).toISOString().split("T")[0],
    rate: 78 + Math.random() * 15,
    aiRate: 82 + Math.random() * 12,
  })
);

export const mockResponseTimeData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2026, 1, 4 + i).toISOString().split("T")[0],
  avgTime: 3 + Math.random() * 4,
  p95Time: 8 + Math.random() * 6,
}));

export const mockTicketTrendData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2026, 1, 4 + i).toISOString().split("T")[0],
  created: 15 + Math.floor(Math.random() * 20),
  resolved: 12 + Math.floor(Math.random() * 22),
}));
