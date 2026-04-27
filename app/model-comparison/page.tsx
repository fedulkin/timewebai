"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Star, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  models, providerNames, fmtK, type Model,
} from "@/app/ai-gateway/models-data"
import { ProviderIcon } from "@/components/provider-icon"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MAX_CONTEXT = Math.max(...models.map((m) => m.context))
const MAX_OUT     = Math.max(...models.map((m) => m.maxOut))

function parsePrice(s: string): number {
  return parseFloat(s.replace("₽", "").trim())
}

type Winner = "a" | "b" | "tie"

function winner(a: number, b: number, higherBetter: boolean): Winner {
  if (a === b) return "tie"
  if (higherBetter) return a > b ? "a" : "b"
  return a < b ? "a" : "b"
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ModelIcon({ provider }: { provider: string }) {
  return <ProviderIcon provider={provider} className="size-12 rounded-xl" />
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn(
          "size-3.5",
          i < rating ? "fill-primary text-primary" : "text-muted-foreground/20 fill-muted-foreground/10"
        )} />
      ))}
    </div>
  )
}

function Bar({ value, max, win }: { value: number; max: number; win: boolean }) {
  return (
    <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden w-full mt-1">
      <div
        className={cn("h-full rounded-full transition-all", win ? "bg-primary" : "bg-muted-foreground/30")}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  )
}

function WinBadge({ win }: { win: boolean }) {
  if (!win) return null
  return (
    <span className="ml-1.5 text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
      лучше
    </span>
  )
}

// ─── Comparison row ───────────────────────────────────────────────────────────

function CompareRow({
  label,
  a,
  b,
}: {
  label: string
  a: React.ReactNode
  b: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-2 divide-x divide-border/50 border-b border-border/40 last:border-b-0 min-w-[560px]">
      <div className="px-5 sm:px-7 py-5">{a}</div>
      <div className="px-5 sm:px-7 py-5">{b}</div>
    </div>
  )
}

function RowLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-2">
      {children}
    </p>
  )
}

// ─── Model selector ───────────────────────────────────────────────────────────

function ModelSelect({ value, onChange, exclude, placeholder }: {
  value: string | null
  onChange: (v: string) => void
  exclude: string | null
  placeholder?: string
}) {
  return (
    <Select value={value ?? ""} onValueChange={onChange}>
      <SelectTrigger className="h-10 bg-muted/30 border-border/60 text-sm w-full">
        <SelectValue placeholder={placeholder ?? "Выберите модель"} />
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {models
          .filter((m) => m.id !== exclude)
          .map((m) => (
            <SelectItem key={m.id} value={m.id}>
              <div className="flex items-center gap-2">
                <ProviderIcon provider={m.provider} className="size-5 rounded" />
                <span className="font-mono text-xs">{m.id}</span>
              </div>
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ModelComparisonContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [modelA, setModelA] = useState(() => {
    const a = searchParams.get("a")
    return a && models.find((m) => m.id === a) ? a : models[0].id
  })
  const [modelB, setModelB] = useState<string | null>(null)

  const mA = models.find((m) => m.id === modelA)!
  const mB = modelB ? models.find((m) => m.id === modelB) ?? null : null

  const ctxWin    = mB ? winner(mA.context,           mB.context,           true)  : "tie"
  const outWin    = mB ? winner(mA.maxOut,             mB.maxOut,            true)  : "tie"
  const readWin   = mB ? winner(parsePrice(mA.read),   parsePrice(mB.read),  false) : "tie"
  const writeWin  = mB ? winner(parsePrice(mA.write),  parsePrice(mB.write), false) : "tie"
  const ratingWin = mB ? winner(mA.rating,             mB.rating,            true)  : "tie"

  // Empty state for column B
  const EmptyCol = () => (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground/50">
      <span className="text-sm">—</span>
    </div>
  )

  return (
    <AppShell>
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit -mt-2"
      >
        <ArrowLeft className="size-4" />
        Назад
      </button>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Сравнение моделей</h1>
        <p className="text-muted-foreground text-sm">
          Выберите модель во второй колонке для сравнения характеристик
        </p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ModelSelect value={modelA} onChange={setModelA} exclude={modelB} />
        <ModelSelect value={modelB} onChange={setModelB} exclude={modelA} placeholder="Выберите модель для сравнения" />
      </div>

      {/* Comparison table */}
      <div className="rounded-2xl border border-border/60 overflow-hidden overflow-x-auto">

        {/* Model headers */}
        <div className="grid grid-cols-2 divide-x divide-border/50 border-b border-border/60 bg-muted/20 min-w-[560px]">
          <div className="px-7 py-6 flex items-center gap-4">
            <ModelIcon provider={mA.provider} />
            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-mono text-sm font-semibold truncate">{mA.id}</span>
              <span className="text-xs text-muted-foreground">{providerNames[mA.provider]}</span>
            </div>
          </div>
          <div className="px-7 py-6 flex items-center gap-4">
            {mB ? (
              <>
                <ModelIcon provider={mB.provider} />
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-mono text-sm font-semibold truncate">{mB.id}</span>
                  <span className="text-xs text-muted-foreground">{providerNames[mB.provider]}</span>
                </div>
              </>
            ) : (
              <span className="text-sm text-muted-foreground/40 italic">Модель не выбрана</span>
            )}
          </div>
        </div>

        {/* Rating */}
        <CompareRow
          label="Рейтинг"
          a={<div><RowLabel>Рейтинг</RowLabel><div className="flex items-center gap-2"><StarRating rating={mA.rating} /><WinBadge win={ratingWin === "a"} /></div></div>}
          b={mB ? <div><RowLabel>Рейтинг</RowLabel><div className="flex items-center gap-2"><StarRating rating={mB.rating} /><WinBadge win={ratingWin === "b"} /></div></div> : <EmptyCol />}
        />

        {/* Context */}
        <CompareRow
          label="Контекст"
          a={<div><RowLabel>Контекстное окно</RowLabel><div className="flex items-center gap-1.5"><span className="font-mono text-lg font-semibold">{fmtK(mA.context)}</span><span className="text-xs text-muted-foreground">токенов</span><WinBadge win={ctxWin === "a"} /></div><Bar value={mA.context} max={MAX_CONTEXT} win={ctxWin !== "b"} /></div>}
          b={mB ? <div><RowLabel>Контекстное окно</RowLabel><div className="flex items-center gap-1.5"><span className="font-mono text-lg font-semibold">{fmtK(mB.context)}</span><span className="text-xs text-muted-foreground">токенов</span><WinBadge win={ctxWin === "b"} /></div><Bar value={mB.context} max={MAX_CONTEXT} win={ctxWin !== "a"} /></div> : <EmptyCol />}
        />

        {/* Max output */}
        <CompareRow
          label="Макс. ответ"
          a={<div><RowLabel>Макс. ответ</RowLabel><div className="flex items-center gap-1.5"><span className="font-mono text-lg font-semibold">{fmtK(mA.maxOut)}</span><span className="text-xs text-muted-foreground">токенов</span><WinBadge win={outWin === "a"} /></div><Bar value={mA.maxOut} max={MAX_OUT} win={outWin !== "b"} /></div>}
          b={mB ? <div><RowLabel>Макс. ответ</RowLabel><div className="flex items-center gap-1.5"><span className="font-mono text-lg font-semibold">{fmtK(mB.maxOut)}</span><span className="text-xs text-muted-foreground">токенов</span><WinBadge win={outWin === "b"} /></div><Bar value={mB.maxOut} max={MAX_OUT} win={outWin !== "a"} /></div> : <EmptyCol />}
        />

        {/* Read price */}
        <CompareRow
          label="Чтение"
          a={<div><RowLabel>Чтение / млн токенов</RowLabel><div className="flex items-center gap-1.5"><span className="font-mono text-lg font-semibold">{mA.read}</span><WinBadge win={readWin === "a"} /></div></div>}
          b={mB ? <div><RowLabel>Чтение / млн токенов</RowLabel><div className="flex items-center gap-1.5"><span className="font-mono text-lg font-semibold">{mB.read}</span><WinBadge win={readWin === "b"} /></div></div> : <EmptyCol />}
        />

        {/* Write price */}
        <CompareRow
          label="Написание"
          a={<div><RowLabel>Написание / млн токенов</RowLabel><div className="flex items-center gap-1.5"><span className="font-mono text-lg font-semibold">{mA.write}</span><WinBadge win={writeWin === "a"} /></div></div>}
          b={mB ? <div><RowLabel>Написание / млн токенов</RowLabel><div className="flex items-center gap-1.5"><span className="font-mono text-lg font-semibold">{mB.write}</span><WinBadge win={writeWin === "b"} /></div></div> : <EmptyCol />}
        />

        {/* Capabilities */}
        <CompareRow
          label="Возможности"
          a={<div><RowLabel>Возможности</RowLabel><div className="flex flex-wrap gap-1.5">{mA.capabilities.map((c) => (<span key={c} className={cn("text-xs px-2.5 py-1 rounded-full border", mB?.capabilities.includes(c) ? "border-border/50 bg-muted/30 text-muted-foreground" : "border-primary/30 bg-primary/8 text-primary")}>{c}</span>))}</div></div>}
          b={mB ? <div><RowLabel>Возможности</RowLabel><div className="flex flex-wrap gap-1.5">{mB.capabilities.map((c) => (<span key={c} className={cn("text-xs px-2.5 py-1 rounded-full border", mA.capabilities.includes(c) ? "border-border/50 bg-muted/30 text-muted-foreground" : "border-primary/30 bg-primary/8 text-primary")}>{c}</span>))}</div></div> : <EmptyCol />}
        />

        {/* Description */}
        <CompareRow
          label="О модели"
          a={<div><RowLabel>О модели</RowLabel><p className="text-sm text-muted-foreground leading-relaxed">{mA.description}</p></div>}
          b={mB ? <div><RowLabel>О модели</RowLabel><p className="text-sm text-muted-foreground leading-relaxed">{mB.description}</p></div> : <EmptyCol />}
        />
      </div>
    </AppShell>
  )
}

export default function ModelComparisonPage() {
  return (
    <Suspense>
      <ModelComparisonContent />
    </Suspense>
  )
}
