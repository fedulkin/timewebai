"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarProvider,
} from "@/components/ui/sidebar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"
import {
  LayoutDashboard, CreditCard, BookOpen, Search,
  Settings, LogOut, Sun, Moon, Menu, Plus, Bot, Pin, PinOff, Package,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAgents, type Agent } from "@/components/agents-provider"
import { useSolutions } from "@/components/solutions-provider"
import { SOLUTIONS } from "@/app/catalog/solutions-data"
import { resolveColor } from "@/lib/solution-color"

// ─── Nav ──────────────────────────────────────────────────────────────────────

const footerItems = [
  { icon: CreditCard, label: "Баланс и платежи", href: "/billing" },
  { icon: BookOpen, label: "Документация", href: "/docs" },
]

// ─── Agent avatar ─────────────────────────────────────────────────────────────

function AgentAvatar({ agent, size = "sm", active = false }: { agent: Agent; size?: "sm" | "md"; active?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg flex items-center justify-center shrink-0 font-semibold",
        size === "sm" ? "size-6 text-[10px]" : "size-8 text-xs",
        active ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground"
      )}
    >
      {agent.name.charAt(0).toUpperCase()}
    </div>
  )
}

// ─── Sortable agent item ──────────────────────────────────────────────────────

function SortableAgentItem({
  agent, active, isPinned, showDivider, onPin, onNavigate, draggedId,
}: {
  agent: Agent
  active: boolean
  isPinned: boolean
  showDivider: boolean
  onPin: (id: string, e: React.MouseEvent) => void
  onNavigate?: () => void
  draggedId: React.MutableRefObject<string | null>
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: agent.id })
  const router = useRouter()

  function handleClick() {
    if (draggedId.current === agent.id) return
    onNavigate?.()
    router.push(`/agents/${agent.id}`)
  }

  return (
    <>
      {showDivider && <div className="my-1 border-t border-border/40" />}
      <SidebarMenuItem
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      >
        <SidebarMenuButton
          isActive={active}
          className={cn(
            "gap-2.5 rounded-lg text-sm h-9 px-1.5 group/item cursor-grab active:cursor-grabbing",
            active ? "bg-transparent! text-foreground font-medium" : "text-muted-foreground"
          )}
          onClick={handleClick}
          {...attributes}
          {...listeners}
        >
          <AgentAvatar agent={agent} size="sm" active={active} />
          <span className="truncate flex-1">{agent.name}</span>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onPin(agent.id, e) }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); onPin(agent.id, e as unknown as React.MouseEvent) } }}
            className={cn(
              "shrink-0 transition-all",
              isPinned ? "opacity-40 hover:opacity-100" : "opacity-0 group-hover/item:opacity-40 hover:!opacity-100"
            )}
          >
            {isPinned ? <PinOff className="size-3" /> : <Pin className="size-3" />}
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  )
}

// ─── Nav content ──────────────────────────────────────────────────────────────

function NavContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const { agents } = useAgents()
  const { solutions } = useSolutions()
  const router = useRouter()
  const { resolvedTheme } = useTheme()

  const [pinned, setPinned] = useState<string[]>([])
  const [order, setOrder]   = useState<string[]>([])

  useEffect(() => {
    try { setPinned(JSON.parse(localStorage.getItem("tw-pinned-agents") ?? "[]")) } catch {}
    try { setOrder(JSON.parse(localStorage.getItem("tw-agents-order") ?? "[]")) } catch {}
  }, [])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const draggedId = useRef<string | null>(null)

  function togglePin(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setPinned(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem("tw-pinned-agents", JSON.stringify(next))
      return next
    })
  }

  function handleDragStart(event: { active: { id: string | number } }) {
    draggedId.current = String(event.active.id)
  }

  function handleDragEnd(event: DragEndEvent) {
    setTimeout(() => { draggedId.current = null }, 100)
    const { active, over } = event
    if (!over || active.id === over.id) return
    const sorted = sortedAgents
    const oldIdx = sorted.findIndex(a => a.id === active.id)
    const newIdx = sorted.findIndex(a => a.id === over.id)
    const next = arrayMove(sorted, oldIdx, newIdx).map(a => a.id)
    setOrder(next)
    localStorage.setItem("tw-agents-order", JSON.stringify(next))
  }

  function handleCreate() {
    onNavigate?.()
    router.push("/agents/new")
  }

  // Apply custom order, then split pinned/unpinned
  const sortedAgents = [...agents].sort((a, b) => {
    const ai = order.indexOf(a.id), bi = order.indexOf(b.id)
    if (ai === -1 && bi === -1) return 0
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
  const pinnedAgents   = sortedAgents.filter(a => pinned.includes(a.id))
  const unpinnedAgents = sortedAgents.filter(a => !pinned.includes(a.id))
  const allSorted      = [...pinnedAgents, ...unpinnedAgents]

  return (
    <>
      <SidebarContent className="px-2 flex flex-col gap-1">
        {/* Dashboard + Catalog */}
        <SidebarGroup className="pb-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/"}
                  className={cn(
                    "gap-3 rounded-lg text-sm",
                    pathname === "/"
                      ? "bg-transparent! text-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  <Link href="/" onClick={onNavigate}>
                    <LayoutDashboard className={cn("size-4 shrink-0", pathname === "/" && "text-primary")} />
                    Сводка
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/catalog")}
                  className={cn(
                    "gap-3 rounded-lg text-sm",
                    pathname.startsWith("/catalog")
                      ? "bg-transparent! text-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  <Link href="/catalog" onClick={onNavigate}>
                    <Package className={cn("size-4 shrink-0", pathname.startsWith("/catalog") && "text-primary")} />
                    Каталог решений
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Solutions */}
        {solutions.length > 0 && (
          <SidebarGroup className="pb-0">
            <div className="px-2 mb-1 flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">
                Решения
              </span>
              <Link href="/catalog" onClick={onNavigate} className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                <Plus className="size-3" />
              </Link>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {solutions.map(sol => {
                  const catalogEntry = SOLUTIONS.find(s => s.slug === sol.slug)
                  const Icon = catalogEntry?.icon
                  const color = resolveColor(
                    catalogEntry?.color ?? sol.color,
                    catalogEntry?.darkColor,
                    resolvedTheme === "dark",
                  )
                  const active = pathname === `/solutions/${sol.id}`
                  return (
                    <SidebarMenuItem key={sol.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={cn(
                          "gap-2.5 rounded-lg text-sm h-9 px-1.5",
                          active ? "bg-transparent! text-foreground font-medium" : "text-muted-foreground"
                        )}
                      >
                        <Link href={`/solutions/${sol.id}`} onClick={onNavigate}>
                          <div
                            className="size-6 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${color}18` }}
                          >
                            {Icon && <Icon className="size-3.5" style={{ color }} />}
                          </div>
                          <span className="truncate flex-1">{sol.name}</span>
                          <span className={cn(
                            "size-1.5 rounded-full shrink-0",
                            sol.status === "running"   && "bg-emerald-500",
                            sol.status === "deploying" && "bg-amber-400 animate-pulse",
                            sol.status === "stopped"   && "bg-muted-foreground/30",
                          )} />
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Agents */}
        <SidebarGroup className="flex-1 pb-0">
          <div className="px-2 mb-1">
            <span className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">
              Агенты
            </span>
          </div>

          <SidebarGroupContent>
            <SidebarMenu>
              {/* Create button */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleCreate}
                  className="gap-2.5 rounded-lg text-sm h-9 px-1.5 text-muted-foreground/60 hover:text-foreground border border-dashed border-border/60 hover:border-border mb-1"
                >
                  <div className="size-6 rounded-lg flex items-center justify-center shrink-0">
                    <Plus className="size-3.5" />
                  </div>
                  <span>Новый агент</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <DndContext id="agents-dnd" sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <SortableContext items={allSorted.map(a => a.id)} strategy={verticalListSortingStrategy}>
                  {allSorted.map((a, i) => {
                    const showDivider = pinnedAgents.length > 0 && unpinnedAgents.length > 0 && i === pinnedAgents.length
                    const active = pathname === `/agents/${a.id}`
                    const isPinned = pinned.includes(a.id)
                    return (
                      <SortableAgentItem
                        key={a.id}
                        agent={a}
                        active={active}
                        isPinned={isPinned}
                        showDivider={showDivider}
                        onPin={togglePin}
                        onNavigate={onNavigate}
                        draggedId={draggedId}
                      />
                    )
                  })}
                </SortableContext>
              </DndContext>
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
                <Link href={item.href} onClick={onNavigate}>
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </>
  )
}

// ─── App shell ────────────────────────────────────────────────────────────────

export function AppShell({ children, mainClassName, fullHeight }: {
  children: React.ReactNode
  mainClassName?: string
  fullHeight?: boolean
}) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <SidebarProvider defaultOpen>
      <div className={cn("flex w-full bg-background md:min-w-[1280px]", fullHeight ? "h-svh overflow-hidden" : "min-h-svh")}>

        {/* Desktop sidebar */}
        <Sidebar collapsible="none" className="hidden md:flex sticky top-0 h-svh bg-background w-60 shrink-0 self-start">
          <SidebarHeader className="p-7 items-start">
            <Logo className="h-4 w-auto" />
          </SidebarHeader>
          <NavContent pathname={pathname} />
        </Sidebar>

        {/* Mobile nav sheet */}
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent side="left" className="w-64 p-0 bg-background flex flex-col">
            <VisuallyHidden><SheetTitle>Навигация</SheetTitle></VisuallyHidden>
            <div className="p-6 pb-4">
              <Logo className="h-4 w-auto" />
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <NavContent pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <div className={cn("flex flex-col flex-1 min-w-0", fullHeight && "overflow-hidden")}>
          {/* Header */}
          <header className="sticky top-0 z-50 flex items-center justify-between bg-background shrink-0 px-4 md:px-7 py-3 md:py-[18px] md:pr-7 md:pl-1.5">
            {/* Mobile: hamburger */}
            <button
              className="md:hidden p-2 -ml-1 rounded-lg hover:bg-muted/40 transition-colors text-muted-foreground"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Открыть меню"
            >
              <Menu className="size-5" />
            </button>

            {/* Mobile: logo */}
            <Logo className="h-3.5 w-auto md:hidden absolute left-1/2 -translate-x-1/2" />

            {/* Desktop: search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Поиск"
                className="pl-9 bg-muted/30 border-border/40 text-sm h-9 w-72"
              />
            </div>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 rounded-lg px-2 py-1 hover:bg-white/5 transition-colors outline-none">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
                      FA
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm text-muted-foreground font-mono">fa20749</span>
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

          <main
            key={pathname}
            className={cn(
              "mx-2 mb-2 md:ml-2 md:mr-6 rounded-[24px] bg-surface-bg ring-1 ring-white/5 flex flex-col gap-10 p-4 md:p-10",
              "page-enter",
              mainClassName
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
