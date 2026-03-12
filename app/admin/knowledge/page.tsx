"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Upload,
  RefreshCw,
  FileText,
  Eye,
  X,
  Sparkles,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
import { mockDocuments, mockSearchResults } from "@/lib/mock-data"
import { DOC_TYPE_MAP, DOC_STATUS_MAP, type DocType } from "@/lib/types"

const DOC_TYPE_COLORS: Record<string, string> = {
  faq: "#3b82f6",
  manual: "#8b5cf6",
  policy: "#f59e0b",
  announcement: "#22c55e",
}

const STATUS_COLORS: Record<string, string> = {
  processing: "#f59e0b",
  ready: "#22c55e",
  failed: "#ef4444",
}

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedDoc, setSelectedDoc] = useState<
    (typeof mockDocuments)[0] | null
  >(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [testQuery, setTestQuery] = useState("")
  const [testResults, setTestResults] = useState<typeof mockSearchResults>([])
  const [isTesting, setIsTesting] = useState(false)
  const [isRebuilding, setIsRebuilding] = useState(false)

  const filtered = useMemo(() => {
    return mockDocuments.filter((doc) => {
      const matchesSearch =
        !searchQuery ||
        doc.title.includes(searchQuery) ||
        doc.id.includes(searchQuery)
      const matchesType = typeFilter === "all" || doc.docType === typeFilter
      return matchesSearch && matchesType
    })
  }, [searchQuery, typeFilter])

  const handleTestSearch = () => {
    if (!testQuery.trim()) return
    setIsTesting(true)
    setTimeout(() => {
      setTestResults(mockSearchResults)
      setIsTesting(false)
    }, 800)
  }

  const handleRebuild = () => {
    setIsRebuilding(true)
    setTimeout(() => {
      setIsRebuilding(false)
    }, 2000)
  }

  const handleViewDoc = (doc: (typeof mockDocuments)[0]) => {
    setSelectedDoc(doc)
    setSheetOpen(true)
  }

  return (
    <div className="px-6 py-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">知识库管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            管理知识库文档，测试检索效果
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={handleRebuild}
            disabled={isRebuilding}
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${isRebuilding ? "animate-spin" : ""}`}
            />
            {isRebuilding ? "重建中..." : "重建索引"}
          </Button>
          <UploadDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Document list */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索文档..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-28 text-xs">
                <SelectValue placeholder="类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {(Object.entries(DOC_TYPE_MAP) as [DocType, string][]).map(
                  ([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    文档
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    类型
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    状态
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    切片数
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    大小
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            {doc.title}
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground">
                            {doc.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor:
                            DOC_TYPE_COLORS[doc.docType] + "15",
                          color: DOC_TYPE_COLORS[doc.docType],
                        }}
                      >
                        {doc.docTypeLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor:
                            STATUS_COLORS[doc.status] + "15",
                          color: STATUS_COLORS[doc.status],
                        }}
                      >
                        {doc.status === "processing" && (
                          <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                        )}
                        {DOC_STATUS_MAP[doc.status]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {doc.chunkCount}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {doc.fileSize}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-primary"
                        onClick={() => handleViewDoc(doc)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        查看
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Search test panel */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">
                检索测试
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-muted-foreground">
              输入查询语句，测试 RAG 检索效果
            </p>
            <div className="flex flex-col gap-3">
              <Textarea
                placeholder="例如：如何申请退货？"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                className="min-h-[80px] text-xs"
              />
              <Button
                size="sm"
                className="text-xs"
                onClick={handleTestSearch}
                disabled={isTesting || !testQuery.trim()}
              >
                <Search className="mr-1.5 h-3.5 w-3.5" />
                {isTesting ? "检索中..." : "执行检索"}
              </Button>
            </div>

            {testResults.length > 0 && (
              <div className="mt-4 flex flex-col gap-2.5">
                <p className="text-xs font-medium text-foreground">
                  检索结果 ({testResults.length})
                </p>
                {testResults.map((result, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-border p-2.5"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-medium text-primary">
                        {result.documentTitle}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {(result.score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="h-1 flex-1 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${result.score * 100}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-3">
                      {result.chunk}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Document detail sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base">{selectedDoc?.title}</SheetTitle>
          </SheetHeader>
          {selectedDoc && (
            <div className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted p-2.5 text-xs">
                  <p className="text-muted-foreground">文档ID</p>
                  <p className="mt-0.5 font-mono font-medium">
                    {selectedDoc.id}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-2.5 text-xs">
                  <p className="text-muted-foreground">类型</p>
                  <p className="mt-0.5 font-medium">
                    {selectedDoc.docTypeLabel}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-2.5 text-xs">
                  <p className="text-muted-foreground">切片数</p>
                  <p className="mt-0.5 font-medium">
                    {selectedDoc.chunkCount}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-2.5 text-xs">
                  <p className="text-muted-foreground">文件大小</p>
                  <p className="mt-0.5 font-medium">
                    {selectedDoc.fileSize}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold text-foreground">
                  文档内容
                </h3>
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <p className="text-xs leading-relaxed text-foreground">
                    {selectedDoc.content}
                  </p>
                </div>
              </div>

              {selectedDoc.chunks && selectedDoc.chunks.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold text-foreground">
                    切片预览 ({selectedDoc.chunks.length}/
                    {selectedDoc.chunkCount})
                  </h3>
                  <div className="flex flex-col gap-2">
                    {selectedDoc.chunks.map((chunk) => (
                      <div
                        key={chunk.id}
                        className="rounded-lg border border-border p-2.5"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {chunk.id}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {chunk.tokenCount} tokens
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-foreground">
                          {chunk.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

// Upload dialog component
function UploadDialog() {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="text-xs">
          <Upload className="mr-1.5 h-3.5 w-3.5" />
          上传文档
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>上传知识库文档</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
            }}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border bg-muted/30"
            }`}
          >
            <BookOpen className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              拖拽文件到此处上传
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              支持 .md, .txt, .pdf, .docx 格式
            </p>
            <Button variant="outline" size="sm" className="mt-4 text-xs">
              选择文件
            </Button>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Select>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="选择文档类型" />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(DOC_TYPE_MAP) as [DocType, string][]).map(
                  ([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <Button className="text-xs">
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              确认上传
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
