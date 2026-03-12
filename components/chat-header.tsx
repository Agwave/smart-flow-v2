import Link from "next/link"
import { Headset, RotateCcw, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatHeaderProps {
  onReset: () => void
}

export function ChatHeader({ onReset }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Headset className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-card-foreground">
            SmartFlow 智能客服
          </h1>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">
              在线服务中
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-muted-foreground hover:text-card-foreground"
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          重新开始
        </Button>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-muted-foreground hover:text-card-foreground"
        >
          <Link href="/admin">
            <Settings className="mr-1.5 h-3.5 w-3.5" />
            管理后台
          </Link>
        </Button>
      </div>
    </header>
  )
}
