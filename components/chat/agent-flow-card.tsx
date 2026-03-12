"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Brain,
  Search,
  PenLine,
  ShieldCheck,
  Route,
  CheckCircle2,
  Loader2,
  Circle,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { AgentFlowData } from "@/lib/types"

const agentIcons: Record<string, React.ElementType> = {
  intent: Brain,
  rag: Search,
  answer: PenLine,
  review: ShieldCheck,
  ticket_router: Route,
}

const statusIcon: Record<string, React.ElementType> = {
  completed: CheckCircle2,
  "in-progress": Loader2,
  waiting: Circle,
  skipped: Circle,
}

interface AgentFlowCardProps {
  data: AgentFlowData
  animate?: boolean
}

export function AgentFlowCard({ data, animate = false }: AgentFlowCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-border bg-muted/50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-left transition-colors hover:bg-muted/80"
      >
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {data.steps.map((step) => {
              const Icon = agentIcons[step.agent] || Circle
              return (
                <div
                  key={step.agent}
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2 border-muted/50",
                    step.status === "completed"
                      ? "bg-primary text-primary-foreground"
                      : step.status === "in-progress"
                        ? "bg-amber-500 text-white"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-2.5 w-2.5" />
                </div>
              )
            })}
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            Agent 处理流程
          </span>
          <span className="text-[10px] text-muted-foreground/70">
            {data.totalDuration}ms
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border px-3.5 py-3 space-y-3">
          {/* Step timeline */}
          <div className="relative flex flex-col gap-0">
            {data.steps.map((step, idx) => {
              const Icon = agentIcons[step.agent] || Circle
              const StatusIcon = statusIcon[step.status] || Circle
              const isLast = idx === data.steps.length - 1

              return (
                <div key={step.agent} className="relative flex gap-3">
                  {/* Vertical line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                        step.status === "completed"
                          ? "bg-primary/10 text-primary"
                          : step.status === "in-progress"
                            ? "bg-amber-100 text-amber-600"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    {!isLast && (
                      <div className="w-px flex-1 min-h-2 bg-border" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">
                        {step.label}
                      </span>
                      <StatusIcon
                        className={cn(
                          "h-3 w-3",
                          step.status === "completed"
                            ? "text-primary"
                            : step.status === "in-progress"
                              ? "animate-spin text-amber-500"
                              : "text-muted-foreground"
                        )}
                      />
                      {step.duration && (
                        <span className="text-[10px] text-muted-foreground">
                          {step.duration}ms
                        </span>
                      )}
                    </div>

                    {/* Intent details */}
                    {step.agent === "intent" && data.intentResult && (
                      <div className="mt-1.5 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            {data.intentResult.intentLabel}
                          </span>
                          {data.intentResult.canAutoAnswer ? (
                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
                              可自动回答
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                              需人工介入
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">
                            置信度
                          </span>
                          <div className="h-1.5 w-20 rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{
                                width: `${data.intentResult.confidence * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-medium text-foreground">
                            {(data.intentResult.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        {data.intentResult.keyEntities.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {data.intentResult.keyEntities.map((entity) => (
                              <span
                                key={entity}
                                className="inline-flex rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground"
                              >
                                {entity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* RAG details */}
                    {step.agent === "rag" && data.ragResult && (
                      <div className="mt-1.5 space-y-1">
                        <p className="text-[10px] text-muted-foreground">
                          检索到 {data.ragResult.documentsFound} 篇相关文档，最高相似度{" "}
                          {(data.ragResult.topScore * 100).toFixed(1)}%
                        </p>
                        <div className="flex flex-col gap-0.5">
                          {data.ragResult.sources.slice(0, 3).map((src) => (
                            <div
                              key={src.title}
                              className="flex items-center gap-1.5 text-[10px]"
                            >
                              <div className="h-1 w-1 rounded-full bg-primary" />
                              <span className="text-muted-foreground truncate">
                                {src.title}
                              </span>
                              <span className="shrink-0 font-medium text-primary">
                                {(src.score * 100).toFixed(0)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Review details */}
                    {step.agent === "review" && data.reviewResult && (
                      <div className="mt-1.5 flex items-center gap-2">
                        {data.reviewResult.approved ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            审核通过
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            需人工审核
                          </span>
                        )}
                        <span
                          className={cn(
                            "inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                            data.reviewResult.riskLevel === "low"
                              ? "bg-emerald-50 text-emerald-600"
                              : data.reviewResult.riskLevel === "medium"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-red-50 text-red-600"
                          )}
                        >
                          风险: {data.reviewResult.riskLevel === "low" ? "低" : data.reviewResult.riskLevel === "medium" ? "中" : "高"}
                        </span>
                        {data.reviewResult.riskTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] text-red-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Ticket router */}
                    {step.agent === "ticket_router" && data.ticketCreated && (
                      <div className="mt-1.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                          <Route className="h-2.5 w-2.5" />
                          已创建工单并转交人工处理
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
