"use client"

import { useState, useRef, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAgents } from "@/components/agents-provider"
import { ChatArtifacts } from "@/components/chat-artifacts"
import { ArrowUp, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

// ─── Mock responses ───────────────────────────────────────────────────────────

const RESPONSES = [
  "Хороший вопрос! Разберём его по шагам.\n\nВо-первых, стоит учесть контекст задачи. Во-вторых, важно понимать ограничения подхода. Если хотите, могу рассмотреть несколько вариантов решения.",
  "Понял вас. Вот что я думаю:\n\nЭта тема достаточно широкая, поэтому постараюсь ответить кратко и по существу. Главное — правильно сформулировать задачу перед тем, как переходить к реализации.",
  "Отличный вопрос. Давайте разберёмся.\n\nСуть в том, что подход зависит от ваших конкретных требований. Для простых случаев подойдёт стандартное решение, для сложных — потребуется индивидуальная настройка.",
  "Конечно, помогу с этим.\n\nОсновная идея проста: нужно разбить задачу на более мелкие части и решать каждую отдельно. Это позволит избежать ошибок и сделать решение более поддерживаемым.",
  "Интересная задача! Есть несколько способов подойти к ней.\n\nСамый распространённый — использовать готовые инструменты. Альтернатива — написать своё решение, что даёт больше контроля. Что важнее для вас?",
]


function getMockResponse() {
  return RESPONSES[Math.floor(Math.random() * RESPONSES.length)]
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AgentChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()
  const { getAgent } = useAgents()
  const agent = getAgent(id)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const bottomRef   = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  function sendMessage() {
    const text = input.trim()
    if (!text || isTyping) return

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getMockResponse(),
      }
      setMessages(prev => [...prev, assistantMsg])
      setIsTyping(false)
    }, 900 + Math.random() * 600)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!agent) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center flex-1 gap-3">
          <p className="text-muted-foreground">Агент не найден</p>
          <Button variant="outline" onClick={() => router.push("/")}>На главную</Button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell fullHeight mainClassName="p-0 md:p-0 gap-0 md:gap-0 overflow-hidden flex-1 min-h-0">
      <div className="flex flex-col h-full min-h-0">
        {/* Shared header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="size-8 rounded-lg flex items-center justify-center shrink-0 font-semibold text-white text-sm"
              style={{ backgroundColor: agent.color }}
            >
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col gap-0">
              <p className="text-sm font-medium leading-tight">{agent.name}</p>
              {(agent.skills ?? []).length > 0 && (
                <p className="text-xs text-muted-foreground/60 leading-tight">
                  {(agent.skills ?? []).length} {(agent.skills ?? []).length === 1 ? "умение" : (agent.skills ?? []).length < 5 ? "умения" : "умений"}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => router.push(`/agents/${id}/settings`)}
          >
            <Settings2 className="size-4" />
          </Button>
        </div>

        {/* Chat + sidebar row */}
        <div className="flex flex-1 min-h-0">
        {/* ── Chat ── */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center min-h-[300px]">
              <div
                className="size-12 rounded-2xl flex items-center justify-center font-bold text-white text-lg"
                style={{ backgroundColor: agent.color }}
              >
                {agent.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-medium text-foreground">{agent.name}</p>
                <p className="text-sm text-muted-foreground max-w-[360px]">
                  {agent.description || "Напишите что-нибудь, чтобы начать диалог"}
                </p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              {msg.role === "assistant" && (
                <div
                  className="size-7 rounded-lg flex items-center justify-center shrink-0 font-semibold text-white text-[11px] mt-0.5"
                  style={{ backgroundColor: agent.color }}
                >
                  {agent.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div
                className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted/60 text-foreground rounded-tl-sm"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div
                className="size-7 rounded-lg flex items-center justify-center shrink-0 font-semibold text-white text-[11px]"
                style={{ backgroundColor: agent.color }}
              >
                {agent.name.charAt(0).toUpperCase()}
              </div>
              <div className="bg-muted/60 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-6 pb-6 pt-2 shrink-0">
          <div className="relative flex items-end gap-2 rounded-2xl border border-border/60 bg-background px-4 py-3 focus-within:border-border transition-colors">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напишите сообщение..."
              className="flex-1 border-0 bg-transparent p-0 text-sm resize-none min-h-[24px] max-h-[200px] focus-visible:ring-0 shadow-none leading-relaxed"
              rows={1}
            />
            <Button
              size="icon"
              className="size-8 shrink-0 rounded-lg"
              disabled={!input.trim() || isTyping}
              onClick={sendMessage}
            >
              <ArrowUp className="size-4" />
            </Button>
          </div>
        </div>
        </div>{/* end chat column */}

        {/* ── Artifacts sidebar ── */}
        {(agent.skills ?? []).length > 0 && (
          <ChatArtifacts skills={agent.skills ?? []} />
        )}
        </div>{/* end chat+sidebar row */}
      </div>{/* end outer flex col */}

    </AppShell>
  )
}
