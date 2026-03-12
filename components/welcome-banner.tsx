import { Headset, ShieldCheck, Clock, Zap } from "lucide-react"

export function WelcomeBanner() {
  return (
    <div className="px-4 py-6 lg:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Headset className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            {"您好！欢迎使用智能售后客服"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {"我是您的AI售后助手，可以帮您处理退换货、查询订单、物流追踪等问题"}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3 text-center">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-card-foreground">{"秒级响应"}</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3 text-center">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-card-foreground">{"24h在线"}</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3 text-center">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-card-foreground">{"专业服务"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
