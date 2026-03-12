"use client"

import {
  Package,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ToolResultData } from "@/lib/types"

interface ToolResultCardProps {
  data: ToolResultData
}

export function ToolResultCard({ data }: ToolResultCardProps) {
  if (data.type === "order_query" && data.order) {
    return <OrderCard order={data.order} />
  }
  if (data.type === "logistics_query" && data.logistics) {
    return <LogisticsCard logistics={data.logistics} />
  }
  if (data.type === "return_apply" && data.returnApply) {
    return <ReturnCard returnInfo={data.returnApply} />
  }
  return null
}

function OrderCard({ order }: { order: NonNullable<ToolResultData["order"]> }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-primary/5 px-3.5 py-2">
        <Package className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-foreground">
          订单信息
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {order.orderId}
        </span>
      </div>
      <div className="px-3.5 py-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">商品</span>
          <span className="text-xs font-medium text-foreground truncate ml-4 text-right">
            {order.product}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">金额</span>
          <span className="text-xs font-semibold text-foreground">
            ¥{order.amount.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">状态</span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
              order.status === "已签收"
                ? "bg-emerald-50 text-emerald-600"
                : order.status === "配送中"
                  ? "bg-primary/10 text-primary"
                  : "bg-amber-50 text-amber-600"
            )}
          >
            {order.statusLabel}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">下单时间</span>
          <span className="text-[10px] text-muted-foreground">
            {order.payTime}
          </span>
        </div>
      </div>
    </div>
  )
}

function LogisticsCard({
  logistics,
}: {
  logistics: NonNullable<ToolResultData["logistics"]>
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-primary/5 px-3.5 py-2">
        <Truck className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-foreground">
          物流追踪
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {logistics.carrier} {logistics.trackingNo}
        </span>
      </div>
      <div className="px-3.5 py-2.5">
        <div className="relative flex flex-col gap-0">
          {logistics.steps.map((step, idx) => (
            <div key={idx} className="relative flex gap-2.5">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full",
                    step.current
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step.current ? (
                    <MapPin className="h-2.5 w-2.5" />
                  ) : (
                    <CheckCircle2 className="h-2.5 w-2.5" />
                  )}
                </div>
                {idx < logistics.steps.length - 1 && (
                  <div className="w-px flex-1 min-h-3 bg-border" />
                )}
              </div>
              <div className="flex-1 pb-2.5">
                <p
                  className={cn(
                    "text-xs",
                    step.current
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.description}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                  {step.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ReturnCard({
  returnInfo,
}: {
  returnInfo: NonNullable<ToolResultData["returnApply"]>
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-emerald-50 px-3.5 py-2">
        <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
        <span className="text-xs font-medium text-emerald-700">
          退货申请已提交
        </span>
      </div>
      <div className="px-3.5 py-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">申请单号</span>
          <span className="text-xs font-medium text-foreground">
            {returnInfo.returnId}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">关联订单</span>
          <span className="text-xs text-foreground">
            {returnInfo.orderId}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">退款原因</span>
          <span className="text-xs text-foreground">{returnInfo.reason}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">退款金额</span>
          <span className="text-xs font-semibold text-emerald-600">
            ¥{returnInfo.refundAmount.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">
            预计 {returnInfo.estimatedDays} 个工作日内完成审核
          </span>
        </div>
      </div>
    </div>
  )
}
