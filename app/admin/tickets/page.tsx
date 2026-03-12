"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Filter, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
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
  type TicketStatus,
  type TicketPriority,
} from "@/lib/types"

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

export default function TicketsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [teamFilter, setTeamFilter] = useState<string>("all")

  const filteredTickets = useMemo(() => {
    return mockTickets.filter((ticket) => {
      const matchesSearch =
        !searchQuery ||
        ticket.title.includes(searchQuery) ||
        ticket.id.includes(searchQuery) ||
        ticket.intentLabel.includes(searchQuery)
      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter
      const matchesPriority =
        priorityFilter === "all" || ticket.priority === priorityFilter
      const matchesTeam =
        teamFilter === "all" || ticket.assignedTeam === teamFilter
      return matchesSearch && matchesStatus && matchesPriority && matchesTeam
    })
  }, [searchQuery, statusFilter, priorityFilter, teamFilter])

  const teams = [
    ...new Set(mockTickets.map((t) => t.assignedTeam)),
  ]

  return (
    <div className="px-6 py-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">工单管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          管理和跟踪所有客服工单
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索工单ID、标题..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-28 text-xs">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              {(Object.entries(TICKET_STATUS_MAP) as [TicketStatus, { label: string }][]).map(
                ([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-28 text-xs">
              <SelectValue placeholder="优先级" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部优先级</SelectItem>
              {(Object.entries(PRIORITY_MAP) as [TicketPriority, { label: string }][]).map(
                ([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {key} - {label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>

          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-32 text-xs">
              <SelectValue placeholder="团队" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部团队</SelectItem>
              {teams.map((team) => {
                const ticket = mockTickets.find((t) => t.assignedTeam === team)
                return (
                  <SelectItem key={team} value={team}>
                    {ticket?.assignedTeamLabel || team}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-3 text-xs text-muted-foreground">
        共 {filteredTickets.length} 条工单
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  工单ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  标题
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  意图
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  状态
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  优先级
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  团队
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  创建时间
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                    {ticket.id}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-foreground">
                      {ticket.title}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      {ticket.intentLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                      style={{
                        backgroundColor: STATUS_COLORS[ticket.status] + "15",
                        color: STATUS_COLORS[ticket.status],
                      }}
                    >
                      {TICKET_STATUS_MAP[ticket.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                      style={{
                        backgroundColor: PRIORITY_COLORS[ticket.priority] + "15",
                        color: PRIORITY_COLORS[ticket.priority],
                      }}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {ticket.assignedTeamLabel}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleDateString("zh-CN", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/tickets/${ticket.id}`}
                      className="inline-flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
                    >
                      查看
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    没有找到匹配的工单
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
