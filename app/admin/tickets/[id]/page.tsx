"use client"

import { use, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  User,
  Headset,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  Copy,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { mockTickets } from "@/lib/mock-data"
import {
  TICKET_STATUS_MAP,
  PRIORITY_MAP,
  TEAM_MAP,
  type TicketStatus,
} from "@/lib/types"
import { cn } from "@/lib/utils"

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  assigned: "#3b82f6",
  resolved: "#22c55e",
  closed: "#6b7280",
}

const PRIORITY_COLORS: Record<string, string> = {
  P0: "#ef4444",
  P1: "#f97316",
  P2: "#3b82f6",
  P3: "#6b7280",
}

const STATUS_FLOW: TicketStatus[] = ["pending", "assigned", "resolved", "closed"]

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const ticket = mockTickets.find((t) => t.id === id)
  const [currentStatus, setCurrentStatus] = useState<TicketStatus>(
    ticket?.status || "pending"
  )
  const [copied, setCopied] = useState(false)

  if (!ticket) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">工单未找到</p>
          <p className="mt-1 text-sm text-muted-foreground">
            工单 {id} 不存在
          </p>
          <Link
            href="/admin/tickets"
            className="mt-4 inline-flex text-sm text-primary hover:underline"
          >
            返回工单列表
          </Link>
        </div>
      </div>
    )
  }

  const handleCopyAiSuggestion = () => {
    if (ticket.aiSuggestion) {
      navigator.clipboard.writeText(ticket.aiSuggestion)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(currentStatus) + 1]

  return (
    <div className="px-6 py-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link
          href="/admin/tickets"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回工单列表
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-foreground">
              {ticket.title}
            </h1>
            <span
              className="inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: STATUS_COLORS[currentStatus] + "15",
                color: STATUS_COLORS[currentStatus],
              }}
            >
              {TICKET_STATUS_MAP[currentStatus]?.label}
            </span>
            <span
              className="inline-flex rounded-md px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: PRIORITY_COLORS[ticket.priority] + "15",
                color: PRIORITY_COLORS[ticket.priority],
              }}
            >
              {PRIORITY_MAP[ticket.priority]?.label}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-mono">{ticket.id}</span>
            <span>{ticket.intentLabel}</span>
            <span>{ticket.assignedTeamLabel}</span>
            {ticket.assignee && <span>负责人: {ticket.assignee}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {nextStatus && (
            <Button
              size="sm"
              onClick={() => setCurrentStatus(nextStatus)}
              className="text-xs"
            >
              流转至 {TICKET_STATUS_MAP[nextStatus]?.label}
            </Button>
          )}
          <Select
            value={currentStatus}
            onValueChange={(v) => setCurrentStatus(v as TicketStatus)}
          >
            <SelectTrigger className="w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FLOW.map((s) => (
                <SelectItem key={s} value={s}>
                  {TICKET_STATUS_MAP[s]?.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: ticket detail & messages */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Ticket content */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">工单详情</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground">
                {ticket.content}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-muted p-2.5">
                  <p className="text-muted-foreground">创建时间</p>
                  <p className="mt-0.5 font-medium text-foreground">
                    {new Date(ticket.createdAt).toLocaleString("zh-CN")}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-2.5">
                  <p className="text-muted-foreground">更新时间</p>
                  <p className="mt-0.5 font-medium text-foreground">
                    {new Date(ticket.updatedAt).toLocaleString("zh-CN")}
                  </p>
                </div>
                {ticket.resolvedAt && (
                  <div className="rounded-lg bg-muted p-2.5">
                    <p className="text-muted-foreground">解决时间</p>
                    <p className="mt-0.5 font-medium text-foreground">
                      {new Date(ticket.resolvedAt).toLocaleString("zh-CN")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status flow visualization */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">状态流转</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {STATUS_FLOW.map((status, idx) => {
                  const isComplete =
                    STATUS_FLOW.indexOf(currentStatus) >= idx
                  const isCurrent = currentStatus === status
                  return (
                    <div key={status} className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                          isCurrent
                            ? "bg-primary text-primary-foreground"
                            : isComplete
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                        )}
                      >
                        {isComplete && !isCurrent && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {isCurrent && <Clock className="h-3 w-3" />}
                        {TICKET_STATUS_MAP[status]?.label}
                      </div>
                      {idx < STATUS_FLOW.length - 1 && (
                        <ChevronDown className="h-3 w-3 -rotate-90 text-muted-foreground" />
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Related conversation */}
          {ticket.messages.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  关联会话记录
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {ticket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2.5",
                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                          msg.role === "user"
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-primary text-primary-foreground"
                        )}
                      >
                        {msg.role === "user" ? (
                          <User className="h-3.5 w-3.5" />
                        ) : (
                          <Headset className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                          msg.role === "user"
                            ? "rounded-tr-sm bg-primary/10 text-foreground"
                            : "rounded-tl-sm border border-border bg-card text-foreground"
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: AI suggestion panel */}
        <div className="flex flex-col gap-4">
          {/* Agent Assist */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">
                  AI 推荐回复
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {ticket.aiSuggestion ? (
                <div>
                  <p className="text-xs leading-relaxed text-foreground">
                    {ticket.aiSuggestion}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 text-xs"
                    onClick={handleCopyAiSuggestion}
                  >
                    <Copy className="mr-1.5 h-3 w-3" />
                    {copied ? "已复制" : "复制回复"}
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  暂无 AI 建议
                </p>
              )}
            </CardContent>
          </Card>

          {/* AI Sources */}
          {ticket.aiSources && ticket.aiSources.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">
                    引用来源
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {ticket.aiSources.map((source) => (
                    <div
                      key={source.title}
                      className="flex items-center justify-between rounded-lg bg-muted px-3 py-2"
                    >
                      <span className="text-xs font-medium text-foreground">
                        {source.title}
                      </span>
                      <span className="text-[10px] font-medium text-primary">
                        {(source.relevance * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ticket info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">工单信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">工单ID</span>
                  <span className="font-mono text-foreground">
                    {ticket.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">意图分类</span>
                  <span className="text-foreground">
                    {ticket.intentLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">负责团队</span>
                  <span className="text-foreground">
                    {ticket.assignedTeamLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">负责人</span>
                  <span className="text-foreground">
                    {ticket.assignee || "未分配"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">会话ID</span>
                  <span className="font-mono text-foreground">
                    {ticket.sessionId}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
