"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"
import { ArrowUp, SquarePen, Bot, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { models } from "@/app/ai-gateway/models-data"
import { ProviderIcon } from "@/components/provider-icon"

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  model?: string
}

// ─── Mock responses ───────────────────────────────────────────────────────────

const RESPONSES = [
  "Хороший вопрос! Разберём его по шагам.\n\nВо-первых, стоит учесть контекст задачи. Во-вторых, важно понимать ограничения подхода. Если вы хотите, могу рассмотреть несколько вариантов решения и сравнить их плюсы и минусы.",
  "Понял вас. Вот что я думаю:\n\nЭта тема достаточно широкая, поэтому постараюсь ответить кратко и по существу. Главное здесь — правильно сформулировать задачу перед тем, как переходить к реализации. Нужно больше деталей?",
  "Отличный вопрос. Давайте разберёмся.\n\nСуть в том, что подход зависит от ваших конкретных требований. Для простых случаев подойдёт стандартное решение, для сложных — возможно, потребуется индивидуальная настройка. Могу предложить несколько вариантов.",
  "Конечно, помогу с этим.\n\nОсновная идея проста: нужно разбить задачу на более мелкие части и решать каждую отдельно. Это позволит избежать ошибок и сделать решение более поддерживаемым. Хотите, чтобы я показал пример?",
  "Интересная задача! Есть несколько способов подойти к ней.\n\nСамый распространённый — использовать готовые инструменты и библиотеки. Альтернатива — написать своё решение с нуля, что даёт больше контроля, но требует больше времени. Что важнее для вас: скорость разработки или гибкость?",
]

function getMockResponse() {
  return RESPONSES[Math.floor(Math.random() * RESPONSES.length)]
}

// ─── Model params ─────────────────────────────────────────────────────────────

type ParamDef = {
  key: string
  min: number
  max: number
  step: number
  defaultValue: number
  decimals: number
  hint: string
}

const PARAM_DEFS: ParamDef[] = [
  { key: "max_tokens",         min: 1,    max: 32768, step: 1,    defaultValue: 32768, decimals: 0, hint: "Максимальное количество токенов в ответе модели" },
  { key: "temperature",        min: 0,    max: 2,     step: 0.1,  defaultValue: 1.0,   decimals: 1, hint: "Случайность ответа. 0 — детерминированный, 2 — максимально случайный" },
  { key: "top_p",              min: 0,    max: 1,     step: 0.01, defaultValue: 1.0,   decimals: 2, hint: "Ядерная выборка: рассматриваются токены с суммарной вероятностью ≤ top_p" },
  { key: "min_p",              min: 0,    max: 1,     step: 0.01, defaultValue: 0,     decimals: 2, hint: "Минимальная вероятность токена относительно наиболее вероятного" },
  { key: "top_k",              min: 0,    max: 100,   step: 1,    defaultValue: 50,    decimals: 0, hint: "Рассматриваются только top_k наиболее вероятных токенов" },
  { key: "presence_penalty",   min: -2,   max: 2,     step: 0.1,  defaultValue: 0,     decimals: 1, hint: "Штраф за появление токена в тексте. Повышает разнообразие тем" },
  { key: "frequency_penalty",  min: -2,   max: 2,     step: 0.1,  defaultValue: 0,     decimals: 1, hint: "Штраф за частоту токена. Снижает повторения одних и тех же слов" },
  { key: "repetition_penalty", min: 0,    max: 2,     step: 0.1,  defaultValue: 1.0,   decimals: 1, hint: "Множитель штрафа за повторение токенов (1.0 = без штрафа)" },
]

function initParams(): Record<string, number> {
  return Object.fromEntries(PARAM_DEFS.map((p) => [p.key, p.defaultValue]))
}

function ParamSlider({
  def,
  value,
  onChange,
}: {
  def: ParamDef
  value: number
  onChange: (v: number) => void
}) {
  const fmt = (v: number) => v.toFixed(def.decimals)

  function handleInput(raw: string) {
    const n = parseFloat(raw)
    if (!isNaN(n)) onChange(Math.min(def.max, Math.max(def.min, n)))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <span className="text-xs font-mono text-foreground/80">{def.key}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                <Info className="size-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[200px] text-xs">
              {def.hint}
            </TooltipContent>
          </Tooltip>
        </div>
        <Input
          type="number"
          value={fmt(value)}
          onChange={(e) => handleInput(e.target.value)}
          min={def.min}
          max={def.max}
          step={def.step}
          className="h-6 w-16 px-2 text-xs font-mono text-right bg-muted/30 border-border/60 shrink-0"
        />
      </div>
      <Slider
        min={def.min}
        max={def.max}
        step={def.step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  )
}

// ─── Model icon (small) ───────────────────────────────────────────────────────

function ModelIcon({ provider, size = "sm" }: { provider: string; size?: "sm" | "md" }) {
  return <ProviderIcon provider={provider} className={size === "sm" ? "size-6 rounded-lg" : "size-8 rounded-lg"} />
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator({ provider }: { provider: string }) {
  return (
    <div className="flex items-start gap-3 max-w-[80%]">
      <ModelIcon provider={provider} />
      <div className="bg-muted/60 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: "900ms" }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Message ──────────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"
  const provider = message.model?.split("/")[0] ?? "openai"

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 max-w-[80%]">
      <ModelIcon provider={provider} />
      <div className="bg-muted/60 rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
        {message.content}
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ model }: { model: string }) {
  const provider = model.split("/")[0]
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
      <ProviderIcon provider={provider} className="size-16 rounded-2xl" />
      <div className="flex flex-col gap-1.5">
        <p className="font-semibold">{model}</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Начните диалог — введите любой вопрос в поле ниже
        </p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const searchParams = useSearchParams()
  const [selectedModel, setSelectedModel] = useState(() => {
    const m = searchParams.get("model")
    return m && models.find((x) => x.id === m) ? m : models[0].id
  })
  const [systemPrompt, setSystemPrompt] = useState("")
  const [params, setParams] = useState<Record<string, number>>(initParams)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  function setParam(key: string, value: number) {
    setParams((prev) => ({ ...prev, [key]: value }))
  }
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentProvider = selectedModel.split("/")[0]

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  // Auto-resize textarea
  function resizeTextarea() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 160) + "px"
  }

  function handleNewChat() {
    setMessages([])
    setInput("")
  }

  function handleSend() {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      model: selectedModel,
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
    setIsLoading(true)

    const delay = 1200 + Math.random() * 1000
    setTimeout(() => {
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: getMockResponse(),
        model: selectedModel,
      }
      setMessages((prev) => [...prev, assistantMsg])
      setIsLoading(false)
    }, delay)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <AppShell mainClassName="p-0 gap-0 overflow-hidden flex-1 min-h-0" fullHeight>
      <div className="flex h-full min-h-0">

        {/* ── Left panel ── */}
        <TooltipProvider delayDuration={300}>
        <div className="w-80 shrink-0 border-r border-border/60 flex flex-col gap-0 overflow-y-auto">
          <div className="flex flex-col gap-5 p-5">

            {/* Model */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Модель
              </Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="h-9 bg-muted/30 border-border/60 text-sm w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {models.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <ModelIcon provider={m.provider} size="sm" />
                        <span className="font-mono text-xs truncate">{m.id}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* System prompt */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Мастер-промпт
              </Label>
              <Textarea
                placeholder="Например: Ты — помощник разработчика. Отвечай кратко и с примерами кода."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="min-h-[100px] resize-none bg-muted/30 border-border/60 text-sm leading-relaxed"
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-border/60" />

            {/* Parameters */}
            <div className="flex flex-col gap-4">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Параметры
              </Label>
              {PARAM_DEFS.map((def) => (
                <ParamSlider
                  key={def.key}
                  def={def}
                  value={params[def.key]}
                  onChange={(v) => setParam(def.key, v)}
                />
              ))}
            </div>
          </div>

          {/* New chat button */}
          <div className="p-4 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewChat}
              className="w-full gap-2 border-border/60 text-muted-foreground hover:text-foreground"
            >
              <SquarePen className="size-3.5" />
              Очистить чат
            </Button>
          </div>
        </div>
        </TooltipProvider>

        {/* ── Chat area ── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {messages.length === 0 && !isLoading ? (
              <EmptyState model={selectedModel} />
            ) : (
              <div className="flex flex-col gap-4 px-6 py-6">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                {isLoading && <TypingIndicator provider={currentProvider} />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="border-t border-border/60 px-6 py-4">
            <div className="flex items-end gap-3 rounded-2xl border border-border/60 bg-background dark:bg-muted/20 px-4 py-3 focus-within:ring-1 focus-within:ring-primary/50 transition-shadow">
              <Textarea
                ref={textareaRef}
                placeholder="Напишите сообщение…"
                value={input}
                onChange={(e) => { setInput(e.target.value); resizeTextarea() }}
                onKeyDown={handleKeyDown}
                rows={1}
                className="flex-1 resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 text-sm leading-relaxed min-h-[24px] max-h-[160px] outline-none"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="size-8 shrink-0 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-30"
              >
                <ArrowUp className="size-4" />
              </Button>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  )
}
