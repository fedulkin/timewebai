"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { ChevronDown, Copy, Check, Search, Star } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Mock data ────────────────────────────────────────────────────────────────

const MAX_CONTEXT = 1000
const MAX_OUTPUT  = 128

const models = [
  { id: "deepseek/deepseek-v3.2",           provider: "deepseek",   context: 164,  maxOut: 66,  read: "36₽",   write: "149₽",  rating: 4 },
  { id: "deepseek/deepseek-v3.2-thinking",  provider: "deepseek",   context: 164,  maxOut: 66,  read: "48₽",   write: "192₽",  rating: 5 },
  { id: "openai/o3-deep-research",          provider: "openai",     context: 200,  maxOut: 100, read: "120₽",  write: "480₽",  rating: 5 },
  { id: "openai/gpt-5.4-mini",              provider: "openai",     context: 128,  maxOut: 16,  read: "12₽",   write: "48₽",   rating: 3 },
  { id: "openai/gpt-5.4",                   provider: "openai",     context: 128,  maxOut: 32,  read: "60₽",   write: "240₽",  rating: 4 },
  { id: "anthropic/claude-4-opus",          provider: "anthropic",  context: 200,  maxOut: 32,  read: "90₽",   write: "450₽",  rating: 5 },
  { id: "anthropic/claude-3.5-sonnet",      provider: "anthropic",  context: 200,  maxOut: 8,   read: "18₽",   write: "90₽",   rating: 4 },
  { id: "google/gemini-2.5-pro",            provider: "google",     context: 1000, maxOut: 64,  read: "18₽",   write: "72₽",   rating: 4 },
  { id: "google/gemini-2.5-flash",          provider: "google",     context: 1000, maxOut: 64,  read: "4₽",    write: "16₽",   rating: 3 },
  { id: "mistral/mistral-large-2",          provider: "mistral",    context: 128,  maxOut: 16,  read: "24₽",   write: "72₽",   rating: 3 },
  { id: "meta/llama-3.3-70b-instruct",      provider: "meta",       context: 128,  maxOut: 32,  read: "6₽",    write: "12₽",   rating: 2 },
  { id: "qwen/qwen2.5-72b-instruct",        provider: "qwen",       context: 128,  maxOut: 8,   read: "8₽",    write: "24₽",   rating: 2 },
]

const providerColors: Record<string, string> = {
  deepseek:  "bg-blue-500",
  openai:    "bg-zinc-800 border border-white/20",
  anthropic: "bg-orange-600",
  google:    "bg-emerald-600",
  mistral:   "bg-violet-600",
  meta:      "bg-sky-600",
  qwen:      "bg-rose-600",
}

const providerInitials: Record<string, string> = {
  deepseek:  "DS",
  openai:    "OA",
  anthropic: "AN",
  google:    "GG",
  mistral:   "MI",
  meta:      "ME",
  qwen:      "QW",
}

function fmtK(k: number) {
  return k >= 1000 ? `${k / 1000} M` : `${k}K`
}

const CODE = `from openai import OpenAI

client = OpenAI(
    api_key="<YOUR_AI_PROXY_KEY>",
    base_url="https://api.timeweb.ai/v1",
)

response = client.chat.completions.create(
    model="openai/gpt-4o",
    messages=[{"role": "user", "content": "Привет!"}],
)`

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
    <div className="rounded-xl border border-border/60 overflow-hidden bg-[#0d0d10] flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Line numbers */}
        <div className="py-5 px-3 select-none text-right font-mono text-xs text-muted-foreground/40 leading-6 min-w-[2.5rem]">
          {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        {/* Code */}
        <pre className="flex-1 py-5 pr-4 text-xs font-mono leading-6 overflow-x-auto">
          {lines.map((line, i) => (
            <div key={i}>{line ? highlight(line) : " "}</div>
          ))}
        </pre>
        {/* Copy */}
        <button
          onClick={handleCopy}
          className="m-3 self-start p-1.5 rounded-md hover:bg-white/8 text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
        </button>
      </div>

      {/* Selectors */}
      <div className="flex gap-2 px-4 py-3 border-t border-border/60">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs text-muted-foreground border-border/60 bg-muted/20">
          openai/gpt-4o <ChevronDown className="size-3" />
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs text-muted-foreground border-border/60 bg-muted/20">
          Python <ChevronDown className="size-3" />
        </Button>
      </div>
    </div>
  )
}

// ─── Model icon ───────────────────────────────────────────────────────────────

function ModelIcon({ provider }: { provider: string }) {
  return (
    <span className={cn(
      "inline-flex items-center justify-center size-8 rounded-lg text-white text-xs font-bold shrink-0",
      providerColors[provider] ?? "bg-muted"
    )}>
      {providerInitials[provider] ?? "??"}
    </span>
  )
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
    <div className="flex flex-col gap-1.5 min-w-[90px]">
      <span className="font-mono text-sm text-muted-foreground">{fmtK(value)}</span>
      <div className="h-1 rounded-full bg-white/8 overflow-hidden">
        <div className="h-full rounded-full bg-primary/70" style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AIGatewayPage() {
  return (
    <AppShell>

        {/* Hero + Code */}
        <div className="grid grid-cols-2 gap-10 items-center bg-tertiary border-b border-border/60 rounded-2xl p-10 -m-10 mb-0">
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
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6">
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
                <Button variant="outline" size="sm"
                  className="gap-2 text-muted-foreground border-border/60 bg-muted/30 h-9 px-3">
                  Все типы <ChevronDown className="size-3.5 opacity-60" />
                </Button>
                <Button variant="outline" size="sm"
                  className="gap-2 text-muted-foreground border-border/60 bg-muted/30 h-9 px-3">
                  Все провайдеры <ChevronDown className="size-3.5 opacity-60" />
                </Button>
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
            <div className="overflow-x-auto">
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="sticky left-0 z-10 bg-surface-bg text-muted-foreground/60 font-normal text-xs w-[35%]">Модели</TableHead>
                    <TableHead className="text-muted-foreground/60 font-normal text-xs w-[15%]">Рейтинг</TableHead>
                    <TableHead className="text-muted-foreground/60 font-normal text-xs w-[15%]">Контекст</TableHead>
                    <TableHead className="text-muted-foreground/60 font-normal text-xs w-[15%]">Макс. ответ</TableHead>
                    <TableHead className="text-muted-foreground/60 font-normal text-xs w-[20%]">Стоимость ₽ / млн токенов</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.map((model) => (
                    <TableRow key={model.id} className="border-border/30 hover:bg-white/3 group">
                      <TableCell className="sticky left-0 z-10 bg-surface-bg group-hover:bg-[#1a1a1e] py-4 transition-colors">
                        <div className="flex items-center gap-3">
                          <ModelIcon provider={model.provider} />
                          <span className="font-mono text-sm">{model.id}</span>
                        </div>
                      </TableCell>
                      <TableCell><StarRating rating={model.rating} /></TableCell>
                      <TableCell><ProgressCell value={model.context} max={MAX_CONTEXT} /></TableCell>
                      <TableCell><ProgressCell value={model.maxOut} max={MAX_OUTPUT} /></TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground/50 w-16">Чтение</span>
                            <span className="font-mono text-muted-foreground">{model.read}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground/50 w-16">Написание</span>
                            <span className="font-mono text-muted-foreground">{model.write}</span>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="quickstart" className="mt-8">
            <p className="text-muted-foreground text-sm">Раздел в разработке.</p>
          </TabsContent>
          <TabsContent value="keys" className="mt-8">
            <p className="text-muted-foreground text-sm">Раздел в разработке.</p>
          </TabsContent>
        </Tabs>
    </AppShell>
  )
}
