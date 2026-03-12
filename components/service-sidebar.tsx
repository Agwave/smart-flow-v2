import {
  Package,
  RotateCcw,
  Truck,
  Clock,
  HelpCircle,
  Star,
} from "lucide-react"

const serviceItems = [
  { icon: Package, label: "订单查询", desc: "查看订单详情与状态" },
  { icon: RotateCcw, label: "退换货服务", desc: "7天无理由退换" },
  { icon: Truck, label: "物流追踪", desc: "实时查看物流信息" },
  { icon: Clock, label: "售后进度", desc: "跟踪售后处理进度" },
  { icon: Star, label: "服务评价", desc: "对服务进行评价反馈" },
  { icon: HelpCircle, label: "帮助中心", desc: "常见问题与使用指南" },
]

export function ServiceSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-l border-border bg-card lg:block">
      <div className="p-5">
        <h2 className="mb-4 text-sm font-semibold text-card-foreground">
          {"售后服务中心"}
        </h2>
        <div className="flex flex-col gap-1.5">
          {serviceItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted cursor-pointer"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-card-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-5 border-t border-border pt-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {"服务时间"}
        </h3>
        <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground leading-relaxed">
          <p>{"人工客服：9:00 - 22:00"}</p>
          <p>{"智能客服：24小时在线"}</p>
          <p className="mt-2 text-primary font-medium">{"当前为智能客服为您服务"}</p>
        </div>
      </div>
    </aside>
  )
}
