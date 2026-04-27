"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarProvider,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"
import {
  LayoutDashboard, ArrowLeftRight, MessageSquare,
  CreditCard, BookOpen, Search,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: LayoutDashboard, label: "Дашборд", href: "/" },
  { icon: ArrowLeftRight, label: "AI Gateway", href: "/ai-gateway" },
  { icon: MessageSquare, label: "Чат с моделями", href: "/chat" },
]

const footerItems = [
  { icon: CreditCard, label: "Баланс и платежи", href: "/billing" },
  { icon: BookOpen, label: "Документация", href: "/docs" },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-svh w-full bg-background">
        <Sidebar collapsible="none" className="sticky top-0 h-svh bg-background w-60 shrink-0 self-start">
          <SidebarHeader className="p-7 items-start">
            <Logo className="h-4 w-auto" />
          </SidebarHeader>

          <SidebarContent className="px-2">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const active = pathname === item.href
                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          className={cn(
                            "gap-3 rounded-lg text-sm",
                            active
                              ? "bg-transparent! text-foreground font-medium"
                              : "text-muted-foreground"
                          )}
                        >
                          <Link href={item.href}>
                            <item.icon className={cn("size-4 shrink-0", active && "text-primary")} />
                            {item.label}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="px-2 pb-4">
            <Separator className="mb-2 opacity-40" />
            <SidebarMenu>
              {footerItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    className="gap-3 rounded-lg text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4 shrink-0" />
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0">
          <header
            className="sticky top-0 z-10 flex items-center justify-between bg-background shrink-0"
            style={{ padding: "18px 28px 18px 6px" }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Поиск"
                className="pl-9 bg-muted/30 border-border/40 text-sm h-9 w-72"
              />
            </div>
            <div className="flex items-center gap-2.5">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
                  FA
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground font-mono">fa20749</span>
            </div>
          </header>

          <main className="mx-2 mb-2 rounded-[24px] bg-surface-bg ring-1 ring-white/5 flex flex-col gap-10 p-10">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
