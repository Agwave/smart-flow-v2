"use client"

import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Ticket,
} from "lucide-react"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
  Bar,
  BarChart,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { StatCard } from "@/components/admin/stat-card"
import {
  mockOverviewStats,
  mockDailyStats,
  mockIntentDistribution,
  mockTickets,
} from "@/lib/mock-data"
import { TICKET_STATUS_MAP, PRIORITY_MAP } from "@/lib/types"
import Link from "next/link"

const INTENT_COLORS = [
  "#4a6cf7",
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#6b7280",
]

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

export default function AdminDashboard() {
  const recentTickets = mockTickets.slice(0, 5)

  // Ticket status distribution
  const statusCounts = mockTickets.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: TICKET_STATUS_MAP[status as keyof typeof TICKET_STATUS_MAP]?.label || status,
    value: count,
    status,
  }))

  // Recent 7 days sessions
  const recent7Days = mockDailyStats.slice(-7)

  return (
    <div className="px-6 py-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">概览仪表盘</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          SmartFlow 智能客服系统运行状态总览
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="今日会话数"
          value={mockOverviewStats.todaySessions.toLocaleString()}
          trend={mockOverviewStats.todaySessionsTrend}
          icon={MessageSquare}
        />
        <StatCard
          title="解决率"
          value={mockOverviewStats.resolveRate}
          unit="%"
          trend={mockOverviewStats.resolveRateTrend}
          icon={CheckCircle2}
        />
        <StatCard
          title="平均响应"
          value={mockOverviewStats.avgResponseTime}
          unit="秒"
          trend={mockOverviewStats.avgResponseTimeTrend}
          icon={Clock}
        />
        <StatCard
          title="待处理工单"
          value={mockOverviewStats.pendingTickets}
          trend={mockOverviewStats.pendingTicketsTrend}
          icon={Ticket}
        />
      </div>

      {/* Charts row */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Session trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">近7日会话趋势</CardTitle>
            <CardDescription className="text-xs">
              每日会话总数与已解决数
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                sessions: { label: "总会话", color: "#4a6cf7" },
                resolved: { label: "已解决", color: "#22c55e" },
              }}
              className="h-[240px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recent7Days} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke="var(--color-sessions)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="var(--color-resolved)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Ticket status pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">工单状态分布</CardTitle>
            <CardDescription className="text-xs">
              当前所有工单
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                pending: { label: "待处理", color: "#f59e0b" },
                assigned: { label: "已分配", color: "#3b82f6" },
                resolved: { label: "已解决", color: "#22c55e" },
                closed: { label: "已关闭", color: "#6b7280" },
              }}
              className="h-[240px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] || "#6b7280"}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {statusData.map((entry) => (
                <div key={entry.status} className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[entry.status] }}
                  />
                  <span className="text-[11px] text-muted-foreground">
                    {entry.name} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Intent distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">意图分布</CardTitle>
            <CardDescription className="text-xs">
              近30日用户意图统计
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: "数量", color: "#4a6cf7" },
              }}
              className="h-[220px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockIntentDistribution}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                >
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="label"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={60}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {mockIntentDistribution.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={INTENT_COLORS[idx % INTENT_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent tickets */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold">最近工单</CardTitle>
              <CardDescription className="text-xs">
                需要关注的最新工单
              </CardDescription>
            </div>
            <Link
              href="/admin/tickets"
              className="text-xs font-medium text-primary hover:underline"
            >
              查看全部
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/admin/tickets/${ticket.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground truncate">
                        {ticket.title}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                      {ticket.id} - {ticket.intentLabel}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                      style={{
                        backgroundColor:
                          PRIORITY_COLORS[ticket.priority] + "15",
                        color: PRIORITY_COLORS[ticket.priority],
                      }}
                    >
                      {PRIORITY_MAP[ticket.priority]?.label}
                    </span>
                    <span
                      className="inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                      style={{
                        backgroundColor:
                          STATUS_COLORS[ticket.status] + "15",
                        color: STATUS_COLORS[ticket.status],
                      }}
                    >
                      {TICKET_STATUS_MAP[ticket.status]?.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
