"use client"

import { useState } from "react"
import {
  Save,
  RotateCcw,
  AlertTriangle,
  Bot,
  Shield,
  GitBranch,
  Bell,
  Plus,
  X,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  mockAgentConfig,
  mockSafetyConfig,
  mockRoutingRules,
} from "@/lib/mock-data"
import type {
  AgentConfig,
  SafetyConfig,
  RoutingRule,
  TicketPriority,
  TeamType,
} from "@/lib/types"
import { TEAM_MAP, PRIORITY_MAP } from "@/lib/types"

function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-0.5">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const [agentConfig, setAgentConfig] = useState<AgentConfig>(mockAgentConfig)
  const [safetyConfig, setSafetyConfig] = useState<SafetyConfig>(mockSafetyConfig)
  const [routingRules, setRoutingRules] = useState<RoutingRule[]>(mockRoutingRules)
  const [newKeyword, setNewKeyword] = useState("")
  const [saved, setSaved] = useState(false)

  // Notification settings
  const [notifications, setNotifications] = useState({
    ticketCreated: true,
    highPriority: true,
    safetyValve: true,
    dailyReport: false,
  })

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleReset() {
    setAgentConfig(mockAgentConfig)
    setSafetyConfig(mockSafetyConfig)
    setRoutingRules(mockRoutingRules)
    setNotifications({
      ticketCreated: true,
      highPriority: true,
      safetyValve: true,
      dailyReport: false,
    })
  }

  function addBlacklistKeyword() {
    if (newKeyword.trim() && !safetyConfig.blacklistKeywords.includes(newKeyword.trim())) {
      setSafetyConfig((prev) => ({
        ...prev,
        blacklistKeywords: [...prev.blacklistKeywords, newKeyword.trim()],
      }))
      setNewKeyword("")
    }
  }

  function removeBlacklistKeyword(keyword: string) {
    setSafetyConfig((prev) => ({
      ...prev,
      blacklistKeywords: prev.blacklistKeywords.filter((k) => k !== keyword),
    }))
  }

  function toggleRule(intent: string) {
    setRoutingRules((prev) =>
      prev.map((r) =>
        r.intent === intent ? { ...r, enabled: !r.enabled } : r
      )
    )
  }

  function updateRulePriority(intent: string, priority: TicketPriority) {
    setRoutingRules((prev) =>
      prev.map((r) =>
        r.intent === intent
          ? { ...r, priority, ...PRIORITY_MAP[priority] }
          : r
      )
    )
  }

  function updateRuleTeam(intent: string, team: TeamType) {
    setRoutingRules((prev) =>
      prev.map((r) =>
        r.intent === intent
          ? { ...r, team, teamLabel: TEAM_MAP[team] }
          : r
      )
    )
  }

  return (
    <div className="px-6 py-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">系统设置</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理 Agent 配置、安全策略与工单路由规则
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            重置
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {saved ? "已保存" : "保存设置"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="agent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agent" className="gap-1.5">
            <Bot className="h-3.5 w-3.5" />
            Agent 配置
          </TabsTrigger>
          <TabsTrigger value="safety" className="gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            安全阀设置
          </TabsTrigger>
          <TabsTrigger value="routing" className="gap-1.5">
            <GitBranch className="h-3.5 w-3.5" />
            工单路由
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            通知设置
          </TabsTrigger>
        </TabsList>

        {/* --- Agent Config --- */}
        <TabsContent value="agent">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Agent 配置
              </CardTitle>
              <CardDescription>
                调整 Intent Agent、RAG Agent 等核心参数
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <SettingRow
                label="意图识别置信度阈值"
                description="低于此阈值的意图识别结果将触发人工审核"
              >
                <div className="flex items-center gap-3 w-[240px]">
                  <Slider
                    value={[agentConfig.intentConfidenceThreshold * 100]}
                    onValueChange={([v]) =>
                      setAgentConfig((prev) => ({
                        ...prev,
                        intentConfidenceThreshold: v / 100,
                      }))
                    }
                    min={50}
                    max={99}
                    step={1}
                    className="flex-1"
                  />
                  <span className="w-12 text-right text-sm font-medium text-foreground">
                    {(agentConfig.intentConfidenceThreshold * 100).toFixed(0)}%
                  </span>
                </div>
              </SettingRow>

              <SettingRow
                label="RAG Top-K 检索数量"
                description="知识检索时返回的最大文档片段数"
              >
                <div className="flex items-center gap-3 w-[240px]">
                  <Slider
                    value={[agentConfig.ragTopK]}
                    onValueChange={([v]) =>
                      setAgentConfig((prev) => ({
                        ...prev,
                        ragTopK: v,
                      }))
                    }
                    min={1}
                    max={20}
                    step={1}
                    className="flex-1"
                  />
                  <span className="w-12 text-right text-sm font-medium text-foreground">
                    {agentConfig.ragTopK}
                  </span>
                </div>
              </SettingRow>

              <SettingRow
                label="检索策略"
                description="选择 RAG Agent 使用的检索方式"
              >
                <Select
                  value={agentConfig.ragStrategy}
                  onValueChange={(v) =>
                    setAgentConfig((prev) => ({
                      ...prev,
                      ragStrategy: v as AgentConfig["ragStrategy"],
                    }))
                  }
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hybrid">混合检索</SelectItem>
                    <SelectItem value="semantic">语义检索</SelectItem>
                    <SelectItem value="keyword">关键词检索</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>

              <SettingRow
                label="最大自动重试次数"
                description="Agent 自动处理失败后的最大重试次数"
              >
                <div className="flex items-center gap-3 w-[240px]">
                  <Slider
                    value={[agentConfig.maxAutoRetries]}
                    onValueChange={([v]) =>
                      setAgentConfig((prev) => ({
                        ...prev,
                        maxAutoRetries: v,
                      }))
                    }
                    min={0}
                    max={10}
                    step={1}
                    className="flex-1"
                  />
                  <span className="w-12 text-right text-sm font-medium text-foreground">
                    {agentConfig.maxAutoRetries} 次
                  </span>
                </div>
              </SettingRow>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Safety Config --- */}
        <TabsContent value="safety">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                安全阀设置
              </CardTitle>
              <CardDescription>
                配置自动退款限额、频率限制和敏感词黑名单
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <SettingRow
                label="自动退款金额上限"
                description="超过此金额的退款将转人工审核"
              >
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={safetyConfig.maxAutoRefundAmount}
                    onChange={(e) =>
                      setSafetyConfig((prev) => ({
                        ...prev,
                        maxAutoRefundAmount: Number(e.target.value),
                      }))
                    }
                    className="w-[120px] text-right"
                  />
                  <span className="text-sm text-muted-foreground">元</span>
                </div>
              </SettingRow>

              <SettingRow
                label="24h 退款频率限制"
                description="同一用户 24 小时内最大退款次数"
              >
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={safetyConfig.maxRefundFrequency}
                    onChange={(e) =>
                      setSafetyConfig((prev) => ({
                        ...prev,
                        maxRefundFrequency: Number(e.target.value),
                      }))
                    }
                    className="w-[120px] text-right"
                  />
                  <span className="text-sm text-muted-foreground">次</span>
                </div>
              </SettingRow>

              <SettingRow
                label="启用敏感词黑名单"
                description="检测消息中的敏感关键词并触发预警"
              >
                <Switch
                  checked={safetyConfig.blacklistEnabled}
                  onCheckedChange={(v) =>
                    setSafetyConfig((prev) => ({
                      ...prev,
                      blacklistEnabled: v,
                    }))
                  }
                />
              </SettingRow>

              {safetyConfig.blacklistEnabled && (
                <div className="py-4">
                  <Label className="text-sm font-medium text-foreground">
                    黑名单关键词
                  </Label>
                  <p className="mb-3 text-xs text-muted-foreground">
                    当用户消息中包含以下关键词时，将自动升级工单
                  </p>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {safetyConfig.blacklistKeywords.map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        {keyword}
                        <button
                          onClick={() => removeBlacklistKeyword(keyword)}
                          className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">
                            {'删除关键词 ' + keyword}
                          </span>
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="输入新关键词..."
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addBlacklistKeyword()
                        }
                      }}
                      className="max-w-[240px]"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addBlacklistKeyword}
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      添加
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Routing Rules --- */}
        <TabsContent value="routing">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                工单路由规则
              </CardTitle>
              <CardDescription>
                配置不同意图类型对应的处理团队和优先级
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">启用</TableHead>
                      <TableHead>意图类型</TableHead>
                      <TableHead>分配团队</TableHead>
                      <TableHead>默认优先级</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routingRules.map((rule) => (
                      <TableRow
                        key={rule.intent}
                        className={
                          !rule.enabled ? "opacity-50" : ""
                        }
                      >
                        <TableCell>
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={() => toggleRule(rule.intent)}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {rule.intentLabel}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={rule.team}
                            onValueChange={(v) =>
                              updateRuleTeam(rule.intent, v as TeamType)
                            }
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(TEAM_MAP).map(
                                ([key, label]) => (
                                  <SelectItem key={key} value={key}>
                                    {label}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={rule.priority}
                            onValueChange={(v) =>
                              updateRulePriority(
                                rule.intent,
                                v as TicketPriority
                              )
                            }
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PRIORITY_MAP).map(
                                ([key, { label }]) => (
                                  <SelectItem key={key} value={key}>
                                    {key} - {label}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Notifications --- */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                通知设置
              </CardTitle>
              <CardDescription>
                管理系统通知和告警规则
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              <SettingRow
                label="工单创建通知"
                description="新工单创建时发送通知给对应团队"
              >
                <Switch
                  checked={notifications.ticketCreated}
                  onCheckedChange={(v) =>
                    setNotifications((prev) => ({
                      ...prev,
                      ticketCreated: v,
                    }))
                  }
                />
              </SettingRow>

              <SettingRow
                label="高优先级告警"
                description="P0/P1 工单创建时发送紧急告警"
              >
                <Switch
                  checked={notifications.highPriority}
                  onCheckedChange={(v) =>
                    setNotifications((prev) => ({
                      ...prev,
                      highPriority: v,
                    }))
                  }
                />
              </SettingRow>

              <SettingRow
                label="安全阀触发告警"
                description="安全阀规则被触发时立即通知管理员"
              >
                <Switch
                  checked={notifications.safetyValve}
                  onCheckedChange={(v) =>
                    setNotifications((prev) => ({
                      ...prev,
                      safetyValve: v,
                    }))
                  }
                />
              </SettingRow>

              <SettingRow
                label="每日数据报告"
                description="每天 9:00 发送前一日运营数据摘要"
              >
                <Switch
                  checked={notifications.dailyReport}
                  onCheckedChange={(v) =>
                    setNotifications((prev) => ({
                      ...prev,
                      dailyReport: v,
                    }))
                  }
                />
              </SettingRow>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
