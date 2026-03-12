"use client"

import { useRef, useEffect, useMemo } from "react"
import { Headset, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { AgentFlowCard } from "@/components/chat/agent-flow-card"
import { ToolResultCard } from "@/components/chat/tool-result-card"
import { generateMockAgentFlow } from "@/lib/mock-data"
import type { AgentFlowData, ToolResultData } from "@/lib/types"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

function getMessageText(msg: Message): string {
  return msg.content || "";
}

/** Detect intent from the user's message text for mock agent flow */
function detectMockIntent(text: string): { intent: string; needsTicket: boolean } {
  const lower = text.toLowerCase()
  if (lower.includes("退货") || lower.includes("退款") || lower.includes("退换")) {
    return { intent: "return_refund", needsTicket: false }
  }
  if (lower.includes("物流") || lower.includes("快递") || lower.includes("配送")) {
    return { intent: "logistics_inquiry", needsTicket: false }
  }
  if (lower.includes("换货") || lower.includes("换一")) {
    return { intent: "exchange", needsTicket: true }
  }
  if (lower.includes("价") || lower.includes("降价") || lower.includes("差价")) {
    return { intent: "price_protect", needsTicket: false }
  }
  if (lower.includes("质量") || lower.includes("坏了") || lower.includes("破损")) {
    return { intent: "return_refund", needsTicket: true }
  }
  if (lower.includes("投诉") || lower.includes("不满")) {
    return { intent: "return_refund", needsTicket: true }
  }
  return { intent: "product_consult", needsTicket: false }
}

/** Detect if a tool result card should be generated */
function detectToolResult(text: string): ToolResultData | undefined {
  if (text.includes("订单") && (text.includes("查询") || text.includes("202"))) {
    return {
      type: "order_query",
      order: {
        orderId: "202603010001",
        status: "已签收",
        statusLabel: "已签收",
        product: "Apple iPhone 16 Pro Max 256GB",
        amount: 9999,
        payTime: "2026-03-01 14:30:00",
        shipTime: "2026-03-02 08:00:00",
      },
    }
  }
  if (text.includes("物流") || text.includes("快递")) {
    return {
      type: "logistics_query",
      logistics: {
        orderId: "202602280002",
        carrier: "中通快递",
        trackingNo: "ZT9876543210",
        status: "配送中",
        steps: [
          { time: "03-05 08:00", description: "快递员正在派送中", current: true },
          { time: "03-04 22:15", description: "已到达北京朝阳区分拣中心", current: false },
          { time: "03-03 14:30", description: "已到达杭州转运中心", current: false },
          { time: "03-02 16:00", description: "商家已发货", current: false },
        ],
      },
    }
  }
  if (text.includes("退货") || text.includes("退款申请")) {
    return {
      type: "return_apply",
      returnApply: {
        returnId: "RET20260305001",
        orderId: "202603010001",
        reason: "质量问题",
        status: "审核中",
        refundAmount: 9999,
        estimatedDays: 3,
      },
    }
  }
  return undefined
}

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Pre-compute agent flows for assistant messages that follow user messages
  const agentFlows = useMemo(() => {
    const flows = new Map<string, AgentFlowData>()
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === "assistant" && i > 0 && messages[i - 1].role === "user") {
        const userText = getMessageText(messages[i - 1])
        const { intent, needsTicket } = detectMockIntent(userText)
        flows.set(messages[i].id, generateMockAgentFlow(intent, needsTicket))
      }
    }
    return flows
  }, [messages])

  // Pre-compute tool result cards for assistant messages
  const toolResults = useMemo(() => {
    const results = new Map<string, ToolResultData>()
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === "assistant") {
        const text = getMessageText(messages[i])
        const result = detectToolResult(text)
        if (result) {
          results.set(messages[i].id, result)
        }
      }
    }
    return results
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        {messages.map((message) => {
          const isUser = message.role === "user"
          const text = getMessageText(message)
          const agentFlow = agentFlows.get(message.id)
          const toolResult = toolResults.get(message.id)

          return (
            <div key={message.id} className="flex flex-col gap-2">
              {/* Agent flow card appears before assistant messages */}
              {!isUser && agentFlow && (
                <div className="ml-11">
                  <AgentFlowCard data={agentFlow} />
                </div>
              )}

              {/* Message bubble */}
              <div
                className={cn(
                  "flex gap-3",
                  isUser ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    isUser
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {isUser ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Headset className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isUser
                      ? "rounded-tr-md bg-primary text-primary-foreground"
                      : "rounded-tl-md border border-border bg-card text-card-foreground shadow-sm"
                  )}
                >
                  <MessageContent text={text} />
                </div>
              </div>

              {/* Tool result card appears after assistant messages */}
              {!isUser && toolResult && (
                <div className="ml-11 max-w-[80%]">
                  <ToolResultCard data={toolResult} />
                </div>
              )}
            </div>
          )
        })}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex flex-col gap-2">
            {/* Show in-progress agent flow while loading */}
            <div className="ml-11">
              <AgentFlowCard
                data={{
                  steps: [
                    { agent: "intent", label: "意图识别", status: "completed", duration: 120 },
                    { agent: "rag", label: "知识检索", status: "in-progress" },
                    { agent: "answer", label: "回答生成", status: "waiting" },
                    { agent: "review", label: "质量审核", status: "waiting" },
                  ],
                  intentResult: {
                    intent: "processing",
                    intentLabel: "分析中...",
                    canAutoAnswer: true,
                    confidence: 0,
                    keyEntities: [],
                  },
                  totalDuration: 0,
                }}
                animate
              />
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Headset className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function MessageContent({ text }: { text: string }) {
  const lines = text.split("\n")
  return (
    <div className="flex flex-col gap-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />
        // Bold text
        const formatted = line.replace(
          /\*\*(.*?)\*\*/g,
          '<strong class="font-semibold">$1</strong>'
        )
        return (
          <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />
        )
      })}
    </div>
  )
}
