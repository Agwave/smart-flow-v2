"use client"

import { useState } from "react"
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
  Area,
  AreaChart,
  Legend,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  mockDailyStats,
  mockIntentDistribution,
  mockTeamPerformance,
  mockMonthlyResolutionRate,
  mockResponseTimeData,
  mockTicketTrendData,
} from "@/lib/mock-data"

const INTENT_COLORS = [
  "#4a6cf7",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#6b7280",
]

const TEAM_COLORS: Record<string, string> = {
  refund_team: "#4a6cf7",
  logistics_team: "#22c55e",
  quality_team: "#f59e0b",
  general_team: "#3b82f6",
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")

  const filteredDailyStats =
    timeRange === "7d"
      ? mockDailyStats.slice(-7)
      : timeRange === "14d"
        ? mockDailyStats.slice(-14)
        : mockDailyStats

  const filteredResolutionRate =
    timeRange === "7d"
      ? mockMonthlyResolutionRate.slice(-7)
      : timeRange === "14d"
        ? mockMonthlyResolutionRate.slice(-14)
        : mockMonthlyResolutionRate

  const filteredResponseTime =
    timeRange === "7d"
      ? mockResponseTimeData.slice(-7)
      : timeRange === "14d"
        ? mockResponseTimeData.slice(-14)
        : mockResponseTimeData

  const filteredTicketTrend =
    timeRange === "7d"
      ? mockTicketTrendData.slice(-7)
      : timeRange === "14d"
        ? mockTicketTrendData.slice(-14)
        : mockTicketTrendData

  // Summary stats
  const totalSessions = filteredDailyStats.reduce((s, d) => s + d.sessions, 0)
  const totalResolved = filteredDailyStats.reduce((s, d) => s + d.resolved, 0)
  const totalEscalated = filteredDailyStats.reduce(
    (s, d) => s + d.escalated,
    0
  )
  const avgResolution = ((totalResolved / totalSessions) * 100).toFixed(1)

  return (
    <div className="px-6 py-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">统计报表</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            系统运营数据分析与趋势洞察
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">近 7 天</SelectItem>
            <SelectItem value="14d">近 14 天</SelectItem>
            <SelectItem value="30d">近 30 天</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-xs font-medium text-muted-foreground">
              总会话量
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {totalSessions.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-xs font-medium text-muted-foreground">
              已解决
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {totalResolved.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-xs font-medium text-muted-foreground">
              解决率
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {avgResolution}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <p className="text-xs font-medium text-muted-foreground">
              升级工单
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {totalEscalated.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">会话分析</TabsTrigger>
          <TabsTrigger value="intents">意图分布</TabsTrigger>
          <TabsTrigger value="tickets">工单效率</TabsTrigger>
          <TabsTrigger value="teams">团队绩效</TabsTrigger>
        </TabsList>

        {/* --- Sessions Tab --- */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Session volume trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  会话量趋势
                </CardTitle>
                <CardDescription className="text-xs">
                  每日会话总数、已解决数及升级数
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    sessions: { label: "总会话", color: "#4a6cf7" },
                    resolved: { label: "已解决", color: "#22c55e" },
                    escalated: { label: "已升级", color: "#ef4444" },
                  }}
                  className="h-[280px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={filteredDailyStats}
                      margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => v.slice(5)}
                      />
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
                      <Line
                        type="monotone"
                        dataKey="escalated"
                        stroke="var(--color-escalated)"
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Resolution rate trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  解决率趋势
                </CardTitle>
                <CardDescription className="text-xs">
                  整体解决率与 AI 自动解决率对比
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    rate: { label: "整体解决率", color: "#4a6cf7" },
                    aiRate: { label: "AI 自动解决率", color: "#22c55e" },
                  }}
                  className="h-[280px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={filteredResolutionRate}
                      margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => v.slice(5)}
                      />
                      <YAxis
                        domain={[60, 100]}
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="aiRate"
                        stroke="var(--color-aiRate)"
                        fill="var(--color-aiRate)"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="rate"
                        stroke="var(--color-rate)"
                        fill="var(--color-rate)"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Response time */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                响应时间趋势
              </CardTitle>
              <CardDescription className="text-xs">
                平均响应时间与 P95 响应时间（秒）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  avgTime: { label: "平均响应", color: "#3b82f6" },
                  p95Time: { label: "P95 响应", color: "#f59e0b" },
                }}
                className="h-[240px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={filteredResponseTime}
                    margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => v.slice(5)}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${v}s`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="avgTime"
                      stroke="var(--color-avgTime)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="p95Time"
                      stroke="var(--color-p95Time)"
                      strokeWidth={2}
                      strokeDasharray="4 3"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Intents Tab --- */}
        <TabsContent value="intents" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Pie chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  意图类型占比
                </CardTitle>
                <CardDescription className="text-xs">
                  近30日用户咨询意图分布
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={Object.fromEntries(
                    mockIntentDistribution.map((item, i) => [
                      item.intent,
                      { label: item.label, color: INTENT_COLORS[i] },
                    ])
                  )}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockIntentDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="count"
                        nameKey="label"
                      >
                        {mockIntentDistribution.map((_, idx) => (
                          <Cell
                            key={idx}
                            fill={INTENT_COLORS[idx % INTENT_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-3 flex flex-wrap justify-center gap-3">
                  {mockIntentDistribution.map((item, idx) => (
                    <div
                      key={item.intent}
                      className="flex items-center gap-1.5"
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: INTENT_COLORS[idx],
                        }}
                      />
                      <span className="text-[11px] text-muted-foreground">
                        {item.label} ({item.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bar chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  意图数量排行
                </CardTitle>
                <CardDescription className="text-xs">
                  各意图类型的咨询次数
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: { label: "咨询次数", color: "#4a6cf7" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mockIntentDistribution}
                      layout="vertical"
                      margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        horizontal={false}
                      />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis
                        dataKey="label"
                        type="category"
                        tick={{ fontSize: 11 }}
                        width={65}
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
          </div>

          {/* Intent details table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                意图详情
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 pr-4 font-medium text-muted-foreground">
                        意图
                      </th>
                      <th className="pb-2 pr-4 font-medium text-muted-foreground text-right">
                        数量
                      </th>
                      <th className="pb-2 pr-4 font-medium text-muted-foreground text-right">
                        占比
                      </th>
                      <th className="pb-2 font-medium text-muted-foreground">
                        分布
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockIntentDistribution.map((item, idx) => (
                      <tr
                        key={item.intent}
                        className="border-b border-border/50"
                      >
                        <td className="py-2.5 pr-4 font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: INTENT_COLORS[idx],
                              }}
                            />
                            {item.label}
                          </div>
                        </td>
                        <td className="py-2.5 pr-4 text-right text-foreground">
                          {item.count}
                        </td>
                        <td className="py-2.5 pr-4 text-right text-muted-foreground">
                          {item.percentage}%
                        </td>
                        <td className="py-2.5">
                          <div className="h-2 w-full max-w-[200px] rounded-full bg-muted">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${item.percentage}%`,
                                backgroundColor: INTENT_COLORS[idx],
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Tickets Tab --- */}
        <TabsContent value="tickets" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Ticket create vs resolve */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  工单创建与解决趋势
                </CardTitle>
                <CardDescription className="text-xs">
                  每日新建工单数与解决工单数对比
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    created: { label: "新建", color: "#ef4444" },
                    resolved: { label: "已解决", color: "#22c55e" },
                  }}
                  className="h-[280px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={filteredTicketTrend}
                      margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => v.slice(5)}
                      />
                      <YAxis tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="created"
                        fill="var(--color-created)"
                        radius={[4, 4, 0, 0]}
                        barSize={8}
                      />
                      <Bar
                        dataKey="resolved"
                        fill="var(--color-resolved)"
                        radius={[4, 4, 0, 0]}
                        barSize={8}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Ticket backlog trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  工单积压量趋势
                </CardTitle>
                <CardDescription className="text-xs">
                  每日未处理工单累计数量
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    backlog: { label: "积压量", color: "#f59e0b" },
                  }}
                  className="h-[280px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={filteredTicketTrend.map((d) => ({
                        ...d,
                        backlog: Math.max(0, d.created - d.resolved + 5 + Math.floor(Math.random() * 8)),
                      }))}
                      margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => v.slice(5)}
                      />
                      <YAxis tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="backlog"
                        stroke="var(--color-backlog)"
                        fill="var(--color-backlog)"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- Teams Tab --- */}
        <TabsContent value="teams" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Team ticket distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  团队工单分布
                </CardTitle>
                <CardDescription className="text-xs">
                  各团队处理与解决的工单数量
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    totalTickets: { label: "总工单", color: "#4a6cf7" },
                    resolved: { label: "已解决", color: "#22c55e" },
                  }}
                  className="h-[280px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mockTeamPerformance}
                      margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                      />
                      <XAxis
                        dataKey="teamLabel"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="totalTickets"
                        fill="var(--color-totalTickets)"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                      />
                      <Bar
                        dataKey="resolved"
                        fill="var(--color-resolved)"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Team response time */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  团队平均响应时间
                </CardTitle>
                <CardDescription className="text-xs">
                  各团队工单平均处理时长（分钟）
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    avgResponseTime: { label: "平均响应(分钟)", color: "#3b82f6" },
                  }}
                  className="h-[280px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mockTeamPerformance}
                      layout="vertical"
                      margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e5e7eb"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => `${v}min`}
                      />
                      <YAxis
                        dataKey="teamLabel"
                        type="category"
                        tick={{ fontSize: 11 }}
                        width={75}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="avgResponseTime"
                        radius={[0, 4, 4, 0]}
                      >
                        {mockTeamPerformance.map((entry) => (
                          <Cell
                            key={entry.team}
                            fill={TEAM_COLORS[entry.team] || "#6b7280"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Team performance table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                团队绩效详情
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 pr-4 font-medium text-muted-foreground">
                        团队
                      </th>
                      <th className="pb-2 pr-4 font-medium text-muted-foreground text-right">
                        总工单
                      </th>
                      <th className="pb-2 pr-4 font-medium text-muted-foreground text-right">
                        已解决
                      </th>
                      <th className="pb-2 pr-4 font-medium text-muted-foreground text-right">
                        解决率
                      </th>
                      <th className="pb-2 pr-4 font-medium text-muted-foreground text-right">
                        平均响应
                      </th>
                      <th className="pb-2 font-medium text-muted-foreground">
                        效率
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTeamPerformance.map((team) => {
                      const resolveRate = (
                        (team.resolved / team.totalTickets) *
                        100
                      ).toFixed(1)
                      return (
                        <tr
                          key={team.team}
                          className="border-b border-border/50"
                        >
                          <td className="py-2.5 pr-4 font-medium text-foreground">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    TEAM_COLORS[team.team] || "#6b7280",
                                }}
                              />
                              {team.teamLabel}
                            </div>
                          </td>
                          <td className="py-2.5 pr-4 text-right text-foreground">
                            {team.totalTickets}
                          </td>
                          <td className="py-2.5 pr-4 text-right text-foreground">
                            {team.resolved}
                          </td>
                          <td className="py-2.5 pr-4 text-right text-foreground">
                            {resolveRate}%
                          </td>
                          <td className="py-2.5 pr-4 text-right text-muted-foreground">
                            {team.avgResponseTime} 分钟
                          </td>
                          <td className="py-2.5">
                            <div className="h-2 w-full max-w-[120px] rounded-full bg-muted">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${resolveRate}%`,
                                  backgroundColor:
                                    TEAM_COLORS[team.team] || "#6b7280",
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
