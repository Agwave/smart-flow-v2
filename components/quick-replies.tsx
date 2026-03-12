import { Package, RotateCcw, Truck, CreditCard, MessageCircleQuestion, ShieldCheck } from "lucide-react"

const quickReplies = [
  { label: "查询订单状态", icon: Package, message: "我想查询一下我的订单状态" },
  { label: "申请退货退款", icon: RotateCcw, message: "我想申请退货退款" },
  { label: "物流配送查询", icon: Truck, message: "我的快递到哪了？帮我查一下物流信息" },
  { label: "修改收货地址", icon: CreditCard, message: "我想修改订单的收货地址" },
  { label: "商品质量问题", icon: ShieldCheck, message: "我收到的商品有质量问题，该怎么处理？" },
  { label: "其他问题咨询", icon: MessageCircleQuestion, message: "我有其他售后问题想要咨询" },
]

interface QuickRepliesProps {
  onSelect: (message: string) => void
  disabled?: boolean
}

export function QuickReplies({ onSelect, disabled }: QuickRepliesProps) {
  return (
    <div className="px-4 py-3 lg:px-6">
      <p className="mb-2.5 text-xs font-medium text-muted-foreground">{"常见问题快捷入口"}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {quickReplies.map((item) => (
          <button
            key={item.label}
            onClick={() => onSelect(item.message)}
            disabled={disabled}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-left text-xs font-medium text-card-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <item.icon className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
