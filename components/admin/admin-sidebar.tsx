"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Ticket,
  BookOpen,
  BarChart3,
  Settings,
  Headset,
  MessageSquare,
  ChevronLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", label: "概览", icon: LayoutDashboard, exact: true },
  { href: "/admin/tickets", label: "工单管理", icon: Ticket, exact: false },
  { href: "/admin/knowledge", label: "知识库", icon: BookOpen, exact: false },
  { href: "/admin/analytics", label: "统计报表", icon: BarChart3, exact: false },
  { href: "/admin/settings", label: "系统设置", icon: Settings, exact: false },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Headset className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-card-foreground">SmartFlow</p>
          <p className="text-[10px] text-muted-foreground">管理控制台</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3">
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-border px-3 py-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <MessageSquare className="h-4 w-4" />
          客服对话
          <ChevronLeft className="ml-auto h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  )
}
