"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarProvider,
} from "@/components/ui/sidebar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"
import {
  LayoutDashboard, ArrowLeftRight, MessageSquare, Columns2,
  CreditCard, BookOpen, Search, Settings, LogOut, Sun, Moon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: LayoutDashboard, label: "Дашборд", href: "/" },
  { icon: ArrowLeftRight, label: "AI Gateway", href: "/ai-gateway" },
  { icon: MessageSquare, label: "LLM-плейграунд", href: "/chat" },
]

const footerItems = [
  { icon: CreditCard, label: "Баланс и платежи", href: "/billing" },
  { icon: BookOpen, label: "Документация", href: "/docs" },
]

export function AppShell({ children, mainClassName, fullHeight }: { children: React.ReactNode; mainClassName?: string; fullHeight?: boolean }) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <SidebarProvider defaultOpen>
      <div className={cn("flex w-full bg-background", fullHeight ? "h-svh overflow-hidden" : "min-h-svh")}>
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

        <div className={cn("flex flex-col flex-1 min-w-0", fullHeight && "overflow-hidden")}>
          <header
            className="sticky top-0 z-50 flex items-center justify-between bg-background shrink-0"
            style={{ padding: "18px 28px 18px 6px" }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Поиск"
                className="pl-9 bg-muted/30 border-border/40 text-sm h-9 w-72"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 rounded-lg px-2 py-1 hover:bg-white/5 transition-colors outline-none">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
                      FA
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground font-mono">fa20749</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem className="gap-3 cursor-pointer">
                  <Settings className="size-4 text-muted-foreground shrink-0" />
                  <span className="whitespace-nowrap">Настройки аккаунта</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-3 cursor-pointer"
                  onSelect={(e) => { e.preventDefault(); setTheme(isDark ? "light" : "dark") }}
                >
                  {isDark
                    ? <Sun  className="size-4 text-muted-foreground shrink-0" />
                    : <Moon className="size-4 text-muted-foreground shrink-0" />}
                  <span className="flex-1 whitespace-nowrap">Тёмная тема</span>
                  <Switch checked={isDark} className="pointer-events-none scale-75" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-3 cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="size-4 shrink-0" />
                  <span className="whitespace-nowrap">Выход</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <main className={cn("ml-2 mr-6 mb-2 rounded-[24px] bg-surface-bg ring-1 ring-white/5 flex flex-col gap-10 p-10", mainClassName)}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
