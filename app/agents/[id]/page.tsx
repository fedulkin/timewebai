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

// ─── Mock histories ───────────────────────────────────────────────────────────

const MOCK_HISTORIES: Record<string, { role: "user" | "assistant"; content: string }[]> = {
  "1": [
    { role: "user", content: "Привет! Нужно составить коммерческое предложение для компании «Альфа Трейд» — они занимаются оптовой торговлей электроникой." },
    { role: "assistant", content: "Привет! Уже ищу информацию о компании «Альфа Трейд».\n\nНашёл: компания работает с 2015 года, оборот ~800 млн ₽ в год, основные категории — смартфоны, ноутбуки, периферия. Закупают у 12 поставщиков.\n\nСоставил КП с акцентом на эксклюзивные условия для оптовиков: скидка 7% от 500 единиц, отсрочка платежа 30 дней, персональный менеджер. Отправить на почту контактного лица?" },
    { role: "user", content: "Да, отправь на ivan.petrov@alfatrade.ru и продублируй в Notion в базу сделок." },
    { role: "assistant", content: "Готово!\n\n✉️ Письмо отправлено на ivan.petrov@alfatrade.ru с темой «Коммерческое предложение — эксклюзивные условия для оптовых партнёров».\n\n📝 Запись создана в Notion → База сделок → «Альфа Трейд», статус «Отправлено КП», дата follow-up — через 3 дня.\n\nПоставить напоминание в календарь на 2 мая в 10:00?" },
    { role: "user", content: "Да, поставь." },
    { role: "assistant", content: "Напоминание создано: «Follow-up: Альфа Трейд» — 2 мая, 10:00. Если не ответят, подготовлю повторное письмо с альтернативным оффером." },
  ],
  "2": [
    { role: "user", content: "Промониторь новости про AI за сегодня и подготовь дайджест для Telegram-канала." },
    { role: "assistant", content: "Сканирую новостные источники...\n\nТоп-3 новости за сегодня:\n\n1. **OpenAI выпустила GPT-4o mini** — более быстрая и дешёвая версия модели, ориентирована на разработчиков.\n2. **Google DeepMind анонсировал Gemini 2.0** — улучшенное понимание видео и аудио в реальном времени.\n3. **Яндекс запустил YandexGPT 4** — новая версия с поддержкой 128k токенов контекста.\n\nСоставить пост в формате дайджеста?" },
    { role: "user", content: "Да, пиши и сразу публикуй в канал #ai-news." },
    { role: "assistant", content: "Пост опубликован в канал #ai-news 🚀\n\n---\n**🤖 AI-дайджест | 29 апреля**\n\n• OpenAI представила GPT-4o mini — быстрее, дешевле, для разработчиков\n• Google DeepMind: Gemini 2.0 понимает видео и аудио в реальном времени\n• Яндекс обновил YandexGPT до версии 4 с контекстом 128k токенов\n\n#ИИ #дайджест\n---\n\n142 подписчика получат уведомление." },
  ],
  "3": [
    { role: "user", content: "Сделай выборку активных клиентов из базы за последние 30 дней и покажи топ-5 по сумме заказов." },
    { role: "assistant", content: "Выполняю запрос к базе данных...\n\n```sql\nSELECT client_name, SUM(amount) as total\nFROM orders\nWHERE created_at >= NOW() - INTERVAL '30 days'\n  AND status = 'completed'\nGROUP BY client_name\nORDER BY total DESC\nLIMIT 5;\n```\n\nРезультат (42 активных клиента, показываю топ-5):\n\n| Клиент | Сумма |\n|---|---|\n| ООО «Мегастрой» | 1 840 000 ₽ |\n| ИП Соколов А.В. | 920 000 ₽ |\n| АО «ТехноПром» | 780 000 ₽ |\n| ООО «Ритейл Плюс» | 640 000 ₽ |\n| ЗАО «СтройГрупп» | 510 000 ₽ |\n\nЗагрузить в Google Sheets?" },
    { role: "user", content: "Да, загрузи в таблицу CRM_Клиенты_Апрель и построй график." },
    { role: "assistant", content: "Готово!\n\n📊 Данные загружены в CRM_Клиенты_Апрель — добавлено 5 строк в лист «Топ клиентов».\n\nПостроил столбчатый график с суммами заказов — добавлен на второй лист «Визуализация». «Мегастрой» выбивается в лидеры с двукратным отрывом от второго места, стоит обратить внимание на этот аккаунт." },
  ],
  "4": [
    { role: "user", content: "Создай issue в репозитории backend по бaг-репорту: при расчёте скидки для заказов свыше 100 единиц применяется неверный коэффициент." },
    { role: "assistant", content: "Создаю issue в mycompany/backend...\n\n✅ **Issue #142 создан**\n\n**Заголовок:** Bug: неверный коэффициент скидки для заказов >100 единиц\n**Лейблы:** `bug`, `priority: high`, `module: billing`\n**Assignee:** @backend-team\n\nТакже нашёл похожий issue #98 от февраля (закрыт) — похоже на регрессию после мержа PR #134. Добавил ссылку в описание. Уведомить команду в Slack?" },
    { role: "user", content: "Да, напиши в #dev." },
    { role: "assistant", content: "Отправил в #dev:\n\n> 🐛 **Новый баг в billing** — Issue #142\n> При заказах >100 единиц применяется неверный коэффициент скидки. Похоже на регрессию с PR #134.\n> 🔗 github.com/mycompany/backend/issues/142\n\n3 участника канала онлайн, пинганул @backend-team." },
  ],
  "5": [
    { role: "user", content: "Найди последние исследования про влияние LLM на продуктивность разработчиков." },
    { role: "assistant", content: "Ищу в интернете и новостных источниках...\n\nНашёл 4 релевантных материала:\n\n1. **GitHub (2024)** — разработчики с Copilot выполняют задачи на 55% быстрее\n2. **McKinsey (2024)** — AI-инструменты сокращают время на рутинный код на 40–60%\n3. **Stack Overflow Survey 2024** — 76% разработчиков используют AI-инструменты, 62% довольны результатом\n4. **MIT Sloan (2025)** — наибольший эффект у джунов, у сеньоров прирост меньше, но качество кода выше\n\nСохранить в Notion?" },
    { role: "user", content: "Да, сохрани в базу знаний в раздел «Исследования»." },
    { role: "assistant", content: "Сохранено в Notion → База знаний → Исследования → «LLM и продуктивность разработчиков».\n\nДобавил краткое резюме, ссылки на источники и тег `#ai-productivity`. Страница доступна для всей команды.\n\nЕсть ещё один свежий материал от Stanford — изучить его тоже?" },
  ],
}

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

  const [messages, setMessages] = useState<Message[]>(() =>
    (MOCK_HISTORIES[id] ?? []).map((m, i) => ({ ...m, id: String(i) }))
  )
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
