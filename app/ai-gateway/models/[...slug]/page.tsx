"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, Copy, Check, Columns2 } from "lucide-react"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover/title:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
    >
      {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
    </button>
  )
}
import { cn } from "@/lib/utils"
import {
  models, providerNames, fmtK, getModelById,
} from "@/app/ai-gateway/models-data"
import { ProviderIcon } from "@/components/provider-icon"

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border/60 bg-background dark:bg-transparent px-5 py-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold tracking-tight">{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  )
}

// ─── Star rating ──────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn(
          "size-4",
          i < rating ? "fill-primary text-primary" : "text-muted-foreground/20 fill-muted-foreground/10"
        )} />
      ))}
    </div>
  )
}

// ─── Code block ───────────────────────────────────────────────────────────────

type Lang = "python" | "js" | "curl"

const LANG_LABELS: Record<Lang, string> = { python: "Python", js: "JavaScript", curl: "cURL" }

function buildCode(lang: Lang, modelId: string): string {
  if (lang === "python") return `from openai import OpenAI

client = OpenAI(
    api_key="<YOUR_AI_GATEWAY_KEY>",
    base_url="https://api.timeweb.ai/v1",
)

response = client.chat.completions.create(
    model="${modelId}",
    messages=[
        {"role": "system", "content": "Отвечай кратко."},
        {"role": "user",   "content": "Привет!"},
    ],
)

print(response.choices[0].message.content)`

  if (lang === "js") return `import OpenAI from "openai"

const client = new OpenAI({
  apiKey: "<YOUR_AI_GATEWAY_KEY>",
  baseURL: "https://api.timeweb.ai/v1",
})

const response = await client.chat.completions.create({
  model: "${modelId}",
  messages: [
    { role: "system", content: "Отвечай кратко." },
    { role: "user",   content: "Привет!" },
  ],
})

console.log(response.choices[0].message.content)`

  return `curl https://api.timeweb.ai/v1/chat/completions \\
  -H "Authorization: Bearer <YOUR_AI_GATEWAY_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${modelId}",
    "messages": [
      {"role": "system", "content": "Отвечай кратко."},
      {"role": "user",   "content": "Привет!"}
    ]
  }'`
}

function highlightLine(line: string, lang: Lang) {
  // Comments
  if (line.trimStart().startsWith("#") || line.trimStart().startsWith("//")) {
    return <span className="text-slate-500">{line}</span>
  }
  // Python/JS import keywords
  if (lang !== "curl" && /^(from|import|const|await|new)\b/.test(line.trimStart())) {
    return line
      .split(/\b(from|import|const|await|new)\b/g)
      .map((part, i) =>
        /^(from|import|const|await|new)$/.test(part)
          ? <span key={i} className="text-purple-400">{part}</span>
          : highlightStrings(part)
      )
  }
  // curl flags
  if (lang === "curl" && /^\s+-[A-Za-z]/.test(line)) {
    const match = line.match(/^(\s*)(-.+?)(\s.*)$/)
    if (match) return (
      <>
        <span className="text-slate-400">{match[1]}</span>
        <span className="text-purple-400">{match[2]}</span>
        {highlightStrings(match[3])}
      </>
    )
  }
  return highlightStrings(line)
}

function highlightStrings(text: string) {
  return text
    .split(/(\"[^\"]*\"|\'[^\']*\'|`[^`]*`)/g)
    .map((part, i) =>
      /^["'`]/.test(part)
        ? <span key={i} className="text-emerald-400">{part}</span>
        : <span key={i} className="text-slate-200">{part}</span>
    )
}

function ModelCodeBlock({ modelId }: { modelId: string }) {
  const [lang, setLang] = useState<Lang>("python")
  const [copied, setCopied] = useState(false)

  const code = buildCode(lang, modelId)
  const lines = code.split("\n")

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0d10] overflow-hidden flex flex-col">
      {/* Language tabs */}
      <div className="flex items-center gap-1 px-4 pt-3 pb-0">
        {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              lang === l
                ? "bg-white/10 text-white/90"
                : "text-white/30 hover:text-white/60 hover:bg-white/5"
            )}
          >
            {LANG_LABELS[l]}
          </button>
        ))}
      </div>

      {/* Code */}
      <div className="flex items-start">
        <div className="py-4 px-3 select-none text-right font-mono text-xs text-white/20 leading-6 min-w-[2.5rem]">
          {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <pre className="flex-1 py-4 text-xs font-mono leading-6 overflow-x-auto">
          {lines.map((line, i) => (
            <div key={i}>{line ? highlightLine(line, lang) : " "}</div>
          ))}
        </pre>
        <button
          onClick={handleCopy}
          className="m-2.5 self-start p-1.5 rounded-md hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors"
        >
          {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ModelPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = use(params)
  const modelId = slug.join("/")
  const model = getModelById(modelId)
  const router = useRouter()

  if (!model) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p className="text-muted-foreground">Модель не найдена</p>
          <Button variant="outline" onClick={() => router.push("/ai-gateway")}>
            Вернуться к моделям
          </Button>
        </div>
      </AppShell>
    )
  }

  const providerName = providerNames[model.provider]

  return (
    <AppShell>
      {/* Back */}
      <button
        onClick={() => router.push("/ai-gateway")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit -mt-2"
      >
        <ArrowLeft className="size-4" />
        Назад к моделям
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-5">
          <ProviderIcon provider={model.provider} className="size-14 rounded-2xl" />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 group/title">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight font-mono">{model.id}</h1>
              <CopyButton text={model.id} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{providerName}</span>
              <span className="text-border/60">·</span>
              <StarRating rating={model.rating} />
            </div>
          </div>
        </div>

        <TooltipProvider delayDuration={200}>
          <div className="flex items-center gap-2 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push(`/model-comparison?a=${encodeURIComponent(model.id)}`)}
                  className="border-border/60"
                >
                  <Columns2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Сравнить с другими моделями</TooltipContent>
            </Tooltip>
            <Button
              size="lg"
              onClick={() => router.push(`/chat?model=${encodeURIComponent(model.id)}`)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 sm:flex-none"
            >
              Попробовать в плейграунде
            </Button>
          </div>
        </TooltipProvider>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Контекст" value={fmtK(model.context)} sub="токенов" />
        <StatCard label="Макс. ответ" value={fmtK(model.maxOut)} sub="токенов" />
        <StatCard label="Чтение" value={model.read} sub="за млн токенов" />
        <StatCard label="Написание" value={model.write} sub="за млн токенов" />
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left */}
        <div className="flex flex-col gap-8">
          {/* Description */}
          <div className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">О модели</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{model.description}</p>
          </div>

          {/* Best for */}
          <div className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">Лучше всего подходит для</h2>
            <div className="flex flex-col gap-2">
              {model.bestFor.map((use, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-primary/60 shrink-0" />
                  {use}
                </div>
              ))}
            </div>
          </div>

          {/* Capabilities + Modalities */}
          <div className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">Возможности</h2>
            <div className="flex flex-wrap gap-2">
              {model.capabilities.map((cap) => (
                <span key={cap}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-border/60 bg-muted/30 text-muted-foreground">
                  {cap}
                </span>
              ))}
            </div>
          </div>

          {/* Specs table */}
          <div className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">Характеристики</h2>
            <div className="rounded-xl border border-border/60 overflow-hidden divide-y divide-border/40">
              {[
                { label: "Провайдер",     value: providerName },
                { label: "Лицензия",      value: model.license },
                { label: "Параметры",     value: model.params ?? "Не раскрыто" },
                { label: "Год выпуска",   value: model.released },
                { label: "Скорость",      value: model.speed },
                { label: "Модальности",   value: model.modalities.join(", ") },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Other models from same provider */}
          <div className="flex flex-col gap-3">
            <h2 className="text-base font-semibold">Другие модели {providerName}</h2>
            <div className="flex flex-col gap-1">
              {models
                .filter((m) => m.provider === model.provider && m.id !== model.id)
                .map((m) => (
                  <button
                    key={m.id}
                    onClick={() => router.push(`/ai-gateway/models/${m.id}`)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/40 transition-colors text-left group"
                  >
                    <span className="font-mono text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {m.id}
                    </span>
                    <span className="text-xs text-muted-foreground/60">{m.read} / {m.write}</span>
                  </button>
                ))}
              {models.filter((m) => m.provider === model.provider && m.id !== model.id).length === 0 && (
                <p className="text-sm text-muted-foreground/60 px-3">Нет других моделей</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: code — sticky */}
        <div className="flex flex-col gap-3 sticky top-6">
          <h2 className="text-base font-semibold">Пример использования</h2>
          <ModelCodeBlock modelId={model.id} />
        </div>
      </div>
    </AppShell>
  )
}
