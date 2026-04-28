"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type AgentSkill = {
  id: string
  config: Record<string, string>
}

export type Agent = {
  id: string
  name: string
  description: string
  model: string
  systemPrompt: string
  color: string
  skills: AgentSkill[]
  createdAt: string
}

type AgentsContextValue = {
  agents: Agent[]
  createAgent: (data: Omit<Agent, "id" | "createdAt">) => Agent
  updateAgent: (id: string, data: Partial<Omit<Agent, "id" | "createdAt">>) => void
  deleteAgent: (id: string) => void
  getAgent: (id: string) => Agent | undefined
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const AGENT_COLORS = [
  "#7c3aed", "#0ea5e9", "#10b981", "#f97316",
  "#ec4899", "#eab308", "#6366f1", "#ef4444",
]

const STORAGE_KEY = "tw-agents"

const DEFAULT_AGENTS: Agent[] = [
  {
    id: "1",
    name: "Ассистент по продажам",
    description: "Ищет лиды, отправляет письма и ведёт сделки",
    model: "openai/gpt-4o",
    systemPrompt: "Ты опытный менеджер по продажам. Помогаешь клиентам найти подходящее решение, отвечаешь на вопросы о продукте и помогаешь закрыть сделку. Общайся дружелюбно и профессионально.",
    color: "#7c3aed",
    skills: [
      { id: "web-search", config: { api_key: "" } },
      { id: "email", config: { host: "", port: "", username: "", password: "" } },
      { id: "google-calendar", config: { service_account_json: "", calendar_id: "primary" } },
      { id: "notion", config: { integration_token: "", database_id: "" } },
    ],
    createdAt: "2026-04-01",
  },
  {
    id: "2",
    name: "Контент-менеджер",
    description: "Мониторит новости и публикует посты в каналы",
    model: "anthropic/claude-3-5-sonnet",
    systemPrompt: "Ты контент-менеджер. Следишь за актуальными новостями, пишешь посты для Telegram-каналов и Slack, адаптируешь контент под аудиторию.",
    color: "#0ea5e9",
    skills: [
      { id: "news-search", config: { api_key: "" } },
      { id: "browser", config: {} },
      { id: "telegram", config: { bot_token: "", chat_id: "" } },
      { id: "slack", config: { bot_token: "", default_channel: "#content" } },
    ],
    createdAt: "2026-04-10",
  },
  {
    id: "3",
    name: "Аналитик данных",
    description: "Делает SQL-запросы, строит отчёты и пишет код",
    model: "openai/gpt-4o",
    systemPrompt: "Ты аналитик данных. Помогаешь интерпретировать данные, строить гипотезы, выбирать метрики и делать выводы. Объясняешь сложные концепции понятным языком.",
    color: "#10b981",
    skills: [
      { id: "postgres", config: { host: "", port: "", database: "", username: "", password: "" } },
      { id: "google-sheets", config: { service_account_json: "" } },
      { id: "code-exec", config: {} },
      { id: "http", config: { base_url: "", auth_header: "" } },
    ],
    createdAt: "2026-04-15",
  },
  {
    id: "4",
    name: "DevOps-ассистент",
    description: "Управляет задачами, следит за инфраструктурой",
    model: "openai/gpt-4o",
    systemPrompt: "Ты DevOps-инженер. Помогаешь управлять задачами в GitHub, мониторить сервисы через API и уведомлять команду о событиях в Slack.",
    color: "#f97316",
    skills: [
      { id: "github", config: { token: "", repo: "" } },
      { id: "slack", config: { bot_token: "", default_channel: "#dev" } },
      { id: "http", config: { base_url: "", auth_header: "" } },
      { id: "code-exec", config: {} },
    ],
    createdAt: "2026-04-18",
  },
  {
    id: "5",
    name: "Исследователь",
    description: "Ищет информацию в интернете и сохраняет в базу",
    model: "anthropic/claude-3-5-sonnet",
    systemPrompt: "Ты исследователь. Ищешь актуальную информацию в интернете, анализируешь страницы, структурируешь данные и сохраняешь их в базу знаний.",
    color: "#ec4899",
    skills: [
      { id: "web-search", config: { api_key: "" } },
      { id: "news-search", config: { api_key: "" } },
      { id: "browser", config: {} },
      { id: "notion", config: { integration_token: "", database_id: "" } },
    ],
    createdAt: "2026-04-20",
  },
]

// ─── Context ──────────────────────────────────────────────────────────────────

const AgentsContext = createContext<AgentsContextValue | null>(null)

export function AgentsProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS)
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage after mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setAgents(JSON.parse(stored))
    } catch {}
    setHydrated(true)
  }, [])

  // Persist to localStorage on change
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(agents))
    } catch {}
  }, [agents, hydrated])

  const createAgent = useCallback((data: Omit<Agent, "id" | "createdAt">): Agent => {
    const agent: Agent = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
    }
    setAgents(prev => [...prev, agent])
    return agent
  }, [])

  const updateAgent = useCallback((id: string, data: Partial<Omit<Agent, "id" | "createdAt">>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...data } : a))
  }, [])

  const deleteAgent = useCallback((id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id))
  }, [])

  const getAgent = useCallback((id: string) => {
    return agents.find(a => a.id === id)
  }, [agents])

  return (
    <AgentsContext.Provider value={{ agents, createAgent, updateAgent, deleteAgent, getAgent }}>
      {children}
    </AgentsContext.Provider>
  )
}

export function useAgents() {
  const ctx = useContext(AgentsContext)
  if (!ctx) throw new Error("useAgents must be used within AgentsProvider")
  return ctx
}
