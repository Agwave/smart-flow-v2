"use client"

import { useRef, useEffect, useMemo } from "react"
import { Headset, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { AgentFlowCard } from "@/components/chat/agent-flow-card"
import { ToolResultCard } from "@/components/chat/tool-result-card"
import type { ToolResultData } from "@/lib/types"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface AgentStep {
  agent: string
  label: string
  status: "waiting" | "in-progress" | "completed" | "failed"
  result?: Record<string, unknown>
  duration?: number
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
  agentSteps?: AgentStep[]
}

export function MessageList({ messages, isLoading, agentSteps = [] }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Get agent steps for the last assistant message
  const lastAssistantMessage = messages.filter(m => m.role === "assistant").pop()
  const lastAgentSteps = lastAssistantMessage ? agentSteps : []

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
          const isLastAssistant = message.id === lastAssistantMessage?.id
          const toolResult = toolResults.get(message.id)

          return (
            <div key={message.id} className="flex flex-col gap-2">
              {/* Agent flow card appears before last assistant message */}
              {!isUser && isLastAssistant && lastAgentSteps.length > 0 && (
                <div className="ml-11">
                  <AgentFlowCard
                    data={{
                      steps: lastAgentSteps.map(step => ({
                        agent: step.agent as "intent" | "rag" | "answer" | "review" | "ticket_router",
                        label: step.label,
                        status: step.status === "failed" ? "waiting" : step.status,
                        duration: step.duration,
                      })),
                      intentResult: lastAgentSteps.find(s => s.agent === "intent")?.result as {
                        intent: string
                        intentLabel: string
                        canAutoAnswer: boolean
                        confidence: number
                        keyEntities: string[]
                      } | undefined,
                      totalDuration: lastAgentSteps.reduce((acc, s) => acc + (s.duration || 0), 0),
                    }}
                  />
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
