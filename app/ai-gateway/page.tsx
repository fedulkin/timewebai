"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"
import { ChevronDown, Copy, Check, Search, Star, TriangleAlert, Trash2, Columns2, Zap, Gauge } from "lucide-react"
import { cn } from "@/lib/utils"
import { models, providerColors, providerInitials, providerNames, fmtK } from "@/app/ai-gateway/models-data"
import { ProviderIcon } from "@/components/provider-icon"

// ─── Mock data ────────────────────────────────────────────────────────────────

const MAX_CONTEXT = 1000
const MAX_OUTPUT  = 128

// ─── API keys mock data ───────────────────────────────────────────────────────

type ApiKey = {
  id: string
  name: string
  suffix: string
  limitTokens: number
  resetPeriod: "day" | "week" | "month" | null
  expiry: string
  status: "active" | "expired"
  createdAt: string
}

const RESET_LABELS: Record<string, string> = { day: "день", week: "неделя", month: "месяц" }
const EXPIRY_LABELS: Record<string, string> = {
  never: "Бессрочный", "1h": "1 час", "1d": "1 день",
  "1w": "1 неделя", "1m": "1 месяц", "90d": "90 дней",
  "180d": "180 дней", "1y": "1 год",
}

const initialKeys: ApiKey[] = [
  { id: "1", name: "production",     suffix: "a3f9", limitTokens: 500_000, resetPeriod: "month", expiry: "never", status: "active",  createdAt: "2026-03-14" },
  { id: "2", name: "staging",        suffix: "b71c", limitTokens: 100_000, resetPeriod: "week",  expiry: "1m",    status: "active",  createdAt: "2026-04-01" },
  { id: "3", name: "local-dev",      suffix: "2d4e", limitTokens: 0,       resetPeriod: null,    expiry: "1d",    status: "expired", createdAt: "2026-04-10" },
  { id: "4", name: "ci-pipeline",    suffix: "f08a", limitTokens: 250_000, resetPeriod: "day",   expiry: "90d",   status: "active",  createdAt: "2026-04-20" },
  { id: "5", name: "analytics-bot",  suffix: "c519", limitTokens: 0,       resetPeriod: null,    expiry: "never", status: "active",  createdAt: "2026-04-25" },
]

const CODE = `from openai import OpenAI

client = OpenAI(
    api_key="<YOUR_AI_PROXY_KEY>",
    base_url="https://api.timeweb.ai/v1",
)

response = client.chat.completions.create(
    model="openai/gpt-4o",
    messages=[{"role": "user", "content": "Привет!"}],
)`

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SLIDER_MAX = 1_000_000
const SLIDER_STEP = 10_000

function fmtTokens(n: number) {
  if (n === 0) return "Без лимита"
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)} M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)} K`
  return String(n)
}

function generateKey() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  const rand = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `twai-${rand(8)}-${rand(4)}-${rand(4)}-${rand(12)}`
}

// ─── Key revealed dialog ──────────────────────────────────────────────────────

function KeyRevealDialog({ open, apiKey, onClose }: { open: boolean; apiKey: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-[460px] gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-border/60">
          <DialogTitle className="text-base font-semibold">API-ключ создан</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Скопируйте ключ и сохраните его в надёжном месте.
          </p>

          {/* Key display */}
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
            <span className="flex-1 font-mono text-sm break-all select-all">{apiKey}</span>
            <button
              onClick={handleCopy}
              className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              {copied
                ? <Check className="size-4 text-emerald-500" />
                : <Copy className="size-4" />}
            </button>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/8 px-4 py-3">
            <TriangleAlert className="size-4 shrink-0 text-amber-500 mt-0.5" />
            <p className="text-sm text-amber-600 dark:text-amber-400 leading-relaxed">
              После закрытия этого окна ключ не будет показан повторно.
              Если вы его потеряете, потребуется создать новый.
            </p>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/20">
          <Button onClick={onClose}
            className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Готово
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Create Key Dialog ────────────────────────────────────────────────────────

function CreateKeyDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: (key: string) => void
}) {
  const [name, setName] = useState("")
  const [limitTokens, setLimitTokens] = useState(0)
  const [resetPeriod, setResetPeriod] = useState("month")
  const [expiry, setExpiry] = useState("never")

  const hasLimit = limitTokens > 0

  function handleInputChange(raw: string) {
    const n = Math.max(0, Math.min(SLIDER_MAX, Number(raw) || 0))
    setLimitTokens(n)
  }

  function handleSubmit() {
    const key = generateKey()
    onOpenChange(false)
    // reset
    setName("")
    setLimitTokens(0)
    setResetPeriod("month")
    setExpiry("never")
    onCreated(key)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-border/60">
          <DialogTitle className="text-base font-semibold">Создать API-ключ</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Key name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="key-name" className="text-sm font-medium">
              Имя ключа
            </Label>
            <Input
              id="key-name"
              placeholder="Например: production-key"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 bg-muted/30 border-border/60 text-sm"
            />
          </div>

          {/* Token limit */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="token-limit" className="text-sm font-medium">
                Лимит токенов
                <span className="ml-1.5 text-xs text-muted-foreground font-normal">опционально</span>
              </Label>
              <span className="text-xs font-mono text-muted-foreground">{fmtTokens(limitTokens)}</span>
            </div>
            {/* Slider */}
            <Slider
              min={0}
              max={SLIDER_MAX}
              step={SLIDER_STEP}
              value={[limitTokens]}
              onValueChange={([v]) => setLimitTokens(v)}
              className="py-1"
            />
            {/* Axis labels */}
            <div className="flex justify-between text-[10px] text-muted-foreground/60 -mt-1">
              <span>0</span>
              <span>250K</span>
              <span>500K</span>
              <span>750K</span>
              <span>1M</span>
            </div>
            {/* Manual input */}
            <div className="relative mt-1">
              <Input
                id="token-limit"
                type="number"
                min={0}
                max={SLIDER_MAX}
                placeholder="0"
                value={limitTokens === 0 ? "" : limitTokens}
                onChange={(e) => handleInputChange(e.target.value)}
                className="h-9 bg-muted/30 border-border/60 text-sm pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                токенов
              </span>
            </div>
          </div>

          {/* Reset period — visible only when limit is set */}
          {hasLimit && (
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Период сброса лимита</Label>
              <Select value={resetPeriod} onValueChange={setResetPeriod}>
                <SelectTrigger className="w-full h-9 bg-muted/30 border-border/60 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">День</SelectItem>
                  <SelectItem value="week">Неделя</SelectItem>
                  <SelectItem value="month">Месяц</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Expiry */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Срок действия</Label>
            <Select value={expiry} onValueChange={setExpiry}>
              <SelectTrigger className="w-full h-9 bg-muted/30 border-border/60 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Бессрочный</SelectItem>
                <SelectItem value="1h">1 час</SelectItem>
                <SelectItem value="1d">1 день</SelectItem>
                <SelectItem value="1w">1 неделя</SelectItem>
                <SelectItem value="1m">1 месяц</SelectItem>
                <SelectItem value="90d">90 дней</SelectItem>
                <SelectItem value="180d">180 дней</SelectItem>
                <SelectItem value="1y">1 год</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/20">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}
            className="border-border/60">
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Создать ключ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Code block ───────────────────────────────────────────────────────────────

function CodeBlock() {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(CODE)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const lines = CODE.split("\n")

  function highlight(line: string) {
    if (line.startsWith("from ") || line.startsWith("import ")) {
      return (
        <>
          <span className="text-purple-400">{line.split(" ")[0]} </span>
          <span className="text-blue-300">{line.split(" ").slice(1, -2).join(" ")} </span>
          <span className="text-purple-400">import </span>
          <span className="text-blue-300">{line.split(" ").at(-1)}</span>
        </>
      )
    }
    return line
      .split(/(\"[^\"]*\"|\'[^\']*\')/g)
      .map((part, i) =>
        /^["']/.test(part)
          ? <span key={i} className="text-emerald-400">{part}</span>
          : <span key={i} className="text-slate-200">{part}</span>
      )
  }

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden bg-[#0d0d10] flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Line numbers */}
        <div className="py-5 px-3 select-none text-right font-mono text-xs text-white/20 leading-6 min-w-[2.5rem]">
          {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        {/* Code */}
        <pre className="flex-1 py-5 pr-4 text-xs font-mono leading-6 overflow-x-auto">
          {lines.map((line, i) => (
            <div key={i}>{line ? highlight(line) : " "}</div>
          ))}
        </pre>
        {/* Copy */}
        <button
          onClick={handleCopy}
          className="m-3 self-start p-1.5 rounded-md hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
        >
          {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
        </button>
      </div>

      {/* Selectors */}
      <div className="flex gap-2 px-4 py-3 border-t border-white/10">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs text-white/50 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white/80">
          openai/gpt-4o <ChevronDown className="size-3" />
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs text-white/50 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white/80">
          Python <ChevronDown className="size-3" />
        </Button>
      </div>
    </div>
  )
}

// ─── Copy model id ────────────────────────────────────────────────────────────

function CopyModelId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover/cell:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
    >
      {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
    </button>
  )
}

// ─── Model icon ───────────────────────────────────────────────────────────────

function ModelIcon({ provider }: { provider: string }) {
  return <ProviderIcon provider={provider} className="size-8 rounded-lg" />
}

// ─── Stars ────────────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn(
          "size-3",
          i < rating ? "fill-primary text-primary" : "text-muted/30 fill-muted/10"
        )} />
      ))}
    </div>
  )
}

// ─── Progress bar cell ────────────────────────────────────────────────────────

function ProgressCell({ value, max }: { value: number; max: number }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-[70px]">
      <span className="font-mono text-sm text-muted-foreground">{fmtK(value)}</span>
      <div className="h-1 rounded-full bg-white/8 overflow-hidden">
        <div className="h-full rounded-full bg-primary/70" style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  )
}

// ─── Speed badge ──────────────────────────────────────────────────────────────

function SpeedBadge({ speed }: { speed: "Высокая" | "Средняя" | "Низкая" }) {
  const cfg = {
    Высокая: { cls: "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/8", icon: <Zap className="size-3" /> },
    Средняя: { cls: "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/8",     icon: <Gauge className="size-3" /> },
    Низкая:  { cls: "text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/8",          icon: <Gauge className="size-3" /> },
  }[speed]
  return (
    <Badge variant="outline" className={cn("gap-1 text-[11px] font-normal px-1.5 py-0.5", cfg.cls)}>
      {cfg.icon}
      {speed}
    </Badge>
  )
}

// ─── License badge ────────────────────────────────────────────────────────────

function LicenseBadge({ license }: { license: "Проприетарная" | "Open Source" }) {
  const isOpen = license === "Open Source"
  return (
    <Badge variant="outline" className={cn(
      "text-[11px] font-normal px-1.5 py-0.5",
      isOpen
        ? "text-sky-600 dark:text-sky-400 border-sky-500/30 bg-sky-500/8"
        : "text-muted-foreground border-border/50 bg-muted/20",
    )}>
      {isOpen ? "Open Source" : "Проприетарная"}
    </Badge>
  )
}

// ─── Masked key ───────────────────────────────────────────────────────────────

function MaskedKey({ suffix }: { suffix: string }) {
  return (
    <span className="font-mono text-sm text-muted-foreground tracking-wide">
      twai-<span className="text-muted-foreground/40">••••-••••-••••-••••••••</span>{suffix}
    </span>
  )
}

// ─── Delete confirm dialog ────────────────────────────────────────────────────

function DeleteKeyDialog({
  apiKey,
  onConfirm,
  onClose,
}: {
  apiKey: ApiKey
  onConfirm: () => void
  onClose: () => void
}) {
  const [input, setInput] = useState("")
  const match = input === apiKey.name

  function handleConfirm() {
    if (!match) return
    onConfirm()
    onClose()
  }

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-[420px] gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-border/60">
          <DialogTitle className="text-base font-semibold">Удалить API-ключ</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 flex flex-col gap-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Это действие необратимо. Все запросы, использующие этот ключ,
            перестанут работать немедленно.
          </p>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm-name" className="text-sm font-medium">
              Введите{" "}
              <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground text-[13px]">
                {apiKey.name}
              </code>{" "}
              для подтверждения
            </Label>
            <Input
              id="confirm-name"
              placeholder={apiKey.name}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              className="h-9 bg-muted/30 border-border/60 text-sm"
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/20">
          <Button variant="outline" size="sm" onClick={onClose} className="border-border/60">
            Отмена
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={!match}
            onClick={handleConfirm}
          >
            Удалить ключ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Keys table ───────────────────────────────────────────────────────────────

function KeysTable({ keys, onDelete }: { keys: ApiKey[]; onDelete: (id: string) => void }) {
  const [pendingDelete, setPendingDelete] = useState<ApiKey | null>(null)
  if (keys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <p className="text-muted-foreground text-sm">У вас пока нет API-ключей.</p>
      </div>
    )
  }

  return (
    <>
      {pendingDelete && (
        <DeleteKeyDialog
          apiKey={pendingDelete}
          onConfirm={() => onDelete(pendingDelete.id)}
          onClose={() => setPendingDelete(null)}
        />
      )}
    <div className="overflow-x-auto">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="border-border/40 hover:bg-transparent">
            <TableHead className="text-muted-foreground/60 font-normal text-xs">Имя</TableHead>
            <TableHead className="text-muted-foreground/60 font-normal text-xs">Ключ</TableHead>
            <TableHead className="text-muted-foreground/60 font-normal text-xs">Лимит токенов</TableHead>
            <TableHead className="text-muted-foreground/60 font-normal text-xs">Срок действия</TableHead>
            <TableHead className="text-muted-foreground/60 font-normal text-xs">Статус</TableHead>
            <TableHead className="text-muted-foreground/60 font-normal text-xs">Создан</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((key) => (
            <TableRow key={key.id} className="border-border/30 hover:bg-muted/40 group">
              {/* Name */}
              <TableCell className="py-4 font-medium text-sm">{key.name}</TableCell>

              {/* Masked value */}
              <TableCell className="py-4">
                <MaskedKey suffix={key.suffix} />
              </TableCell>

              {/* Limit */}
              <TableCell className="py-4">
                {key.limitTokens > 0 ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-sm">{fmtTokens(key.limitTokens)}</span>
                    {key.resetPeriod && (
                      <span className="text-xs text-muted-foreground">
                        Сброс: {RESET_LABELS[key.resetPeriod]}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>

              {/* Expiry */}
              <TableCell className="py-4 text-sm text-muted-foreground">
                {EXPIRY_LABELS[key.expiry] ?? key.expiry}
              </TableCell>

              {/* Status */}
              <TableCell className="py-4">
                {key.status === "active" ? (
                  <Badge variant="outline"
                    className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/8 gap-1.5 font-normal">
                    <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                    Активен
                  </Badge>
                ) : (
                  <Badge variant="outline"
                    className="text-muted-foreground border-border/60 bg-muted/20 gap-1.5 font-normal">
                    <span className="size-1.5 rounded-full bg-muted-foreground/50 inline-block" />
                    Истёк
                  </Badge>
                )}
              </TableCell>

              {/* Created */}
              <TableCell className="py-4 text-sm text-muted-foreground font-mono">
                {key.createdAt}
              </TableCell>

              {/* Delete */}
              <TableCell className="py-4">
                <button
                  onClick={() => setPendingDelete(key)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </>
  )
}

// ─── Quick start ─────────────────────────────────────────────────────────────

const STEP_INSTALL = `pip install openai`

const STEP_INIT = `from openai import OpenAI

client = OpenAI(
    api_key="<YOUR_AI_GATEWAY_KEY>",
    base_url="https://api.timeweb.ai/v1",
)`

const STEP_REQUEST = `response = client.chat.completions.create(
    model="openai/gpt-4o",
    messages=[
        {"role": "system", "content": "Отвечай кратко."},
        {"role": "user",   "content": "Что такое Kubernetes?"},
    ],
)

print(response.choices[0].message.content)`

function InlineCode({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const lines = code.split("\n")

  function highlight(line: string) {
    if (line.startsWith("from ") || line.startsWith("import ") || line.startsWith("pip ")) {
      return line
        .split(/(\b(?:from|import|install)\b)/g)
        .map((part, i) =>
          /^(from|import|install)$/.test(part)
            ? <span key={i} className="text-purple-400">{part}</span>
            : <span key={i} className="text-slate-200">{part}</span>
        )
    }
    if (line.startsWith("#")) return <span className="text-slate-500">{line}</span>
    return line
      .split(/(\"[^\"]*\"|\'[^\']*\')/g)
      .map((part, i) =>
        /^["']/.test(part)
          ? <span key={i} className="text-emerald-400">{part}</span>
          : <span key={i} className="text-slate-200">{part}</span>
      )
  }

  return (
    <div className={cn("rounded-xl border border-white/10 bg-[#0d0d10] overflow-hidden", className)}>
      <div className="flex items-start">
        <div className="py-4 px-3 select-none text-right font-mono text-xs text-white/20 leading-6 min-w-[2.5rem]">
          {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <pre className="flex-1 py-4 text-xs font-mono leading-6 overflow-x-auto">
          {lines.map((line, i) => (
            <div key={i}>{line ? highlight(line) : " "}</div>
          ))}
        </pre>
        <button
          onClick={handleCopy}
          className="m-2.5 self-start p-1.5 rounded-md hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors"
        >
          {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
        </button>
      </div>
    </div>
  )
}

function QuickStart({ onCreateKey }: { onCreateKey: () => void }) {
  const steps = [
    {
      num: 1,
      title: "Создайте API-ключ",
      desc: "Нажмите кнопку ниже, придумайте имя ключа и при необходимости задайте лимит токенов. Сохраните ключ сразу — после закрытия окна он не будет показан повторно.",
      content: (
        <Button
          onClick={onCreateKey}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Создать ключ
        </Button>
      ),
    },
    {
      num: 2,
      title: "Установите библиотеку и настройте клиент",
      desc: "AI Gateway совместим с OpenAI SDK — достаточно указать ваш ключ и базовый URL. Работает с любым языком, поддерживающим OpenAI API.",
      content: (
        <div className="flex flex-col gap-2">
          <InlineCode code={STEP_INSTALL} />
          <InlineCode code={STEP_INIT} />
        </div>
      ),
    },
    {
      num: 3,
      title: "Отправьте первый запрос",
      desc: "Используйте любую модель из каталога через стандартный Chat Completions API. Модель указывается в формате provider/model-name.",
      content: <InlineCode code={STEP_REQUEST} />,
    },
  ]

  return (
    <div className="flex flex-col gap-0 max-w-2xl">
      {steps.map((step, idx) => (
        <div key={step.num} className="flex gap-6">
          {/* Left: number + connector */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center size-8 rounded-full bg-primary/15 text-primary text-sm font-semibold shrink-0 ring-1 ring-primary/30">
              {step.num}
            </div>
            {idx < steps.length - 1 && (
              <div className="w-px flex-1 bg-border/60 my-2" />
            )}
          </div>

          {/* Right: content */}
          <div className={cn("flex flex-col gap-3 pb-10", idx === steps.length - 1 && "pb-0")}>
            <div className="flex flex-col gap-1 pt-1">
              <h3 className="text-base font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
            {step.content}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Capabilities filter ──────────────────────────────────────────────────────

const ALL_CAPABILITIES = Array.from(
  new Set(models.flatMap((m) => m.capabilities))
).sort()

const ALL_PROVIDERS = Array.from(new Set(models.map((m) => m.provider))).sort()

function CapabilitiesFilter({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (caps: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [open])

  function toggle(cap: string) {
    onChange(selected.includes(cap) ? selected.filter((c) => c !== cap) : [...selected, cap])
  }

  const hasFilter = selected.length > 0

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "gap-2 h-9 px-3 text-sm border-border/60 bg-muted/30 transition-colors",
          hasFilter
            ? "text-primary border-primary/40 bg-primary/6 hover:bg-primary/10"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {hasFilter ? (
          <>Возможности<span className="inline-flex items-center justify-center size-4 rounded-full bg-primary text-[10px] text-primary-foreground font-medium">{selected.length}</span></>
        ) : (
          <>Возможности <ChevronDown className="size-3.5 opacity-60" /></>
        )}
      </Button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 bg-popover border border-border/60 rounded-xl shadow-xl overflow-hidden w-52">
          <div className="p-1.5 flex flex-col gap-0.5 max-h-72 overflow-y-auto">
            {ALL_CAPABILITIES.map((cap) => {
              const checked = selected.includes(cap)
              return (
                <button
                  key={cap}
                  onClick={() => toggle(cap)}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm hover:bg-muted/50 transition-colors text-left w-full"
                >
                  <div className={cn(
                    "size-4 rounded flex items-center justify-center border shrink-0 transition-colors",
                    checked ? "bg-primary border-primary" : "border-border/60 bg-transparent",
                  )}>
                    {checked && <Check className="size-2.5 text-primary-foreground stroke-[3]" />}
                  </div>
                  <span className={checked ? "text-foreground" : "text-muted-foreground"}>{cap}</span>
                </button>
              )
            })}
          </div>

          {hasFilter && (
            <div className="border-t border-border/40 p-1.5">
              <button
                onClick={() => onChange([])}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5 rounded-lg hover:bg-muted/40"
              >
                Сбросить фильтр
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Provider filter ──────────────────────────────────────────────────────────

function ProviderFilter({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (providers: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [open])

  function toggle(p: string) {
    onChange(selected.includes(p) ? selected.filter((v) => v !== p) : [...selected, p])
  }

  const hasFilter = selected.length > 0

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "gap-2 h-9 px-3 text-sm border-border/60 bg-muted/30 transition-colors",
          hasFilter
            ? "text-primary border-primary/40 bg-primary/6 hover:bg-primary/10"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {hasFilter ? (
          <>Провайдеры<span className="inline-flex items-center justify-center size-4 rounded-full bg-primary text-[10px] text-primary-foreground font-medium">{selected.length}</span></>
        ) : (
          <>Провайдеры <ChevronDown className="size-3.5 opacity-60" /></>
        )}
      </Button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 bg-popover border border-border/60 rounded-xl shadow-xl overflow-hidden w-48">
          <div className="p-1.5 flex flex-col gap-0.5">
            {ALL_PROVIDERS.map((p) => {
              const checked = selected.includes(p)
              return (
                <button
                  key={p}
                  onClick={() => toggle(p)}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm hover:bg-muted/50 transition-colors text-left w-full"
                >
                  <div className={cn(
                    "size-4 rounded flex items-center justify-center border shrink-0 transition-colors",
                    checked ? "bg-primary border-primary" : "border-border/60 bg-transparent",
                  )}>
                    {checked && <Check className="size-2.5 text-primary-foreground stroke-[3]" />}
                  </div>
                  <ProviderIcon provider={p} className="size-5 rounded" />
                  <span className={checked ? "text-foreground" : "text-muted-foreground"}>
                    {providerNames[p] ?? p}
                  </span>
                </button>
              )
            })}
          </div>

          {hasFilter && (
            <div className="border-t border-border/40 p-1.5">
              <button
                onClick={() => onChange([])}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5 rounded-lg hover:bg-muted/40"
              >
                Сбросить фильтр
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AIGatewayPage() {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [revealKey, setRevealKey] = useState<string | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialKeys)
  const [selectedCaps, setSelectedCaps] = useState<string[]>([])
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])

  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      if (selectedProviders.length > 0 && !selectedProviders.includes(m.provider)) return false
      if (selectedCaps.length > 0 && !selectedCaps.every((cap) => m.capabilities.includes(cap))) return false
      return true
    })
  }, [selectedCaps, selectedProviders])

  function handleKeyCreated(key: string) {
    const suffix = key.slice(-4)
    setApiKeys((prev) => [{
      id: String(Date.now()),
      name: "Новый ключ",
      suffix,
      limitTokens: 0,
      resetPeriod: null,
      expiry: "never",
      status: "active",
      createdAt: new Date().toISOString().slice(0, 10),
    }, ...prev])
    setRevealKey(key)
  }

  function handleDeleteKey(id: string) {
    setApiKeys((prev) => prev.filter((k) => k.id !== id))
  }

  return (
    <AppShell>
      <CreateKeyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleKeyCreated}
      />
      <KeyRevealDialog
        open={revealKey !== null}
        apiKey={revealKey ?? ""}
        onClose={() => setRevealKey(null)}
      />

        {/* Hero + Code */}
        <div className="grid grid-cols-2 gap-10 items-center bg-tertiary border-b border-border/60 p-10 -m-10 mb-0" style={{ borderRadius: "24px 24px 0 0" }}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h1 className="text-4xl font-bold tracking-tight">AI Gateway</h1>
              <p className="text-muted-foreground leading-relaxed">
                AI Gateway позволяет переключаться между сотнями моделей
                без необходимости управлять ограничениями потребления
                или учётными записями провайдеров.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                size="lg"
                onClick={() => setCreateOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
              >
                Создать ключ
              </Button>
              <Button variant="link" className="text-primary px-0">
                Изучить документацию
              </Button>
            </div>
          </div>

          <CodeBlock />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="models">
          <TabsList className="bg-transparent border-0 p-0 gap-1 h-auto">
            {[
              { value: "models",   label: "Модели" },
              { value: "quickstart", label: "Быстрый старт" },
              { value: "keys",     label: "API-ключи" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground",
                  "data-[state=active]:bg-transparent data-[state=active]:text-foreground",
                  "data-[state=active]:ring-1 data-[state=active]:ring-primary",
                  "data-[state=active]:shadow-none"
                )}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Models tab */}
          <TabsContent value="models" className="mt-8 flex flex-col gap-6">
            {/* Filters row */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-2xl font-semibold tracking-tight">Модели</h2>
              <div className="flex items-center gap-2">
                <ProviderFilter selected={selectedProviders} onChange={setSelectedProviders} />
                <CapabilitiesFilter selected={selectedCaps} onChange={setSelectedCaps} />
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Найти модель"
                    className="pl-9 bg-muted/30 border-border/60 text-sm h-9 w-52"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <TooltipProvider delayDuration={200}>
            <div className="overflow-x-auto">
              <Table className="table-fixed" style={{ minWidth: 1632 }}>
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="sticky left-0 z-10 bg-surface-bg text-muted-foreground/60 font-normal text-xs w-96">Модель</TableHead>
                    <TableHead className="text-muted-foreground/60 font-normal text-xs w-28">Рейтинг</TableHead>
                    <TableHead className="text-muted-foreground/60 font-normal text-xs w-96">Возможности</TableHead>
                    <TableHead className="text-muted-foreground/60 font-normal text-xs w-32">Контекст</TableHead>
                    <TableHead className="text-muted-foreground/60 font-normal text-xs w-32">Макс. ответ</TableHead>
                    <TableHead className="text-muted-foreground/60 font-normal text-xs w-32">Скорость</TableHead>
                    <TableHead className="text-muted-foreground/60 font-normal text-xs w-40">Лицензия</TableHead>
                    <TableHead className="text-muted-foreground/60 font-normal text-xs w-40">Стоимость / млн</TableHead>
                    <TableHead className="sticky right-0 z-10 bg-surface-bg w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModels.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="py-16 text-center text-sm text-muted-foreground">
                        Ни одна модель не соответствует выбранным возможностям
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredModels.map((model) => (
                    <TableRow
                      key={model.id}
                      className="border-border/30 hover:bg-tertiary group cursor-pointer"
                      onClick={() => router.push(`/ai-gateway/models/${model.id}`)}
                    >
                      {/* Model */}
                      <TableCell className="sticky left-0 z-10 bg-surface-bg group-hover:bg-tertiary py-4 transition-colors">
                        <div className="flex items-center gap-3">
                          <ModelIcon provider={model.provider} />
                          <div className="flex items-center gap-1.5 group/cell min-w-0">
                            <span className="font-mono text-sm">{model.id}</span>
                            <CopyModelId id={model.id} />
                          </div>
                        </div>
                      </TableCell>

                      {/* Rating */}
                      <TableCell className="py-4"><StarRating rating={model.rating} /></TableCell>

                      {/* Capabilities */}
                      <TableCell className="py-4">
                        <div className="flex flex-wrap gap-1">
                          {model.capabilities.map((cap) => (
                            <span key={cap}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs border border-border/50 bg-muted/30 text-muted-foreground">
                              {cap}
                            </span>
                          ))}
                        </div>
                      </TableCell>

                      {/* Context */}
                      <TableCell className="py-4"><ProgressCell value={model.context} max={MAX_CONTEXT} /></TableCell>

                      {/* Max output */}
                      <TableCell className="py-4"><ProgressCell value={model.maxOut} max={MAX_OUTPUT} /></TableCell>

                      {/* Speed */}
                      <TableCell className="py-4"><SpeedBadge speed={model.speed} /></TableCell>

                      {/* License */}
                      <TableCell className="py-4"><LicenseBadge license={model.license} /></TableCell>

                      {/* Cost */}
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground/40 w-14">Чтение</span>
                            <span className="font-mono text-muted-foreground">{model.read}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground/40 w-14">Запись</span>
                            <span className="font-mono text-muted-foreground">{model.write}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Compare (sticky right) */}
                      <TableCell className="sticky right-0 z-10 bg-surface-bg group-hover:bg-tertiary py-4 text-center transition-colors">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/model-comparison?a=${encodeURIComponent(model.id)}`)
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-muted border border-transparent hover:border-border/60 text-muted-foreground hover:text-foreground"
                            >
                              <Columns2 className="size-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="left">Сравнить с другими</TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            </TooltipProvider>
          </TabsContent>

          <TabsContent value="quickstart" className="mt-8">
            <QuickStart onCreateKey={() => setCreateOpen(true)} />
          </TabsContent>
          <TabsContent value="keys" className="mt-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight">API-ключи</h2>
              <Button
                onClick={() => setCreateOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Создать ключ
              </Button>
            </div>
            <KeysTable keys={apiKeys} onDelete={handleDeleteKey} />
          </TabsContent>
        </Tabs>
    </AppShell>
  )
}
