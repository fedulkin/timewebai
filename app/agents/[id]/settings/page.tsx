"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAgents, type AgentSkill } from "@/components/agents-provider"
import { SkillsShowcase } from "@/components/skills-showcase"
import { Trash2 } from "lucide-react"

export default function AgentSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { getAgent, updateAgent, deleteAgent } = useAgents()
  const agent = getAgent(id)

  const [name, setName]                 = useState("")
  const [description, setDescription]   = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [skills, setSkills]             = useState<AgentSkill[]>([])

  useEffect(() => {
    if (agent) {
      setName(agent.name)
      setDescription(agent.description)
      setSystemPrompt(agent.systemPrompt)
      setSkills(agent.skills ?? [])
    }
  }, [agent])

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

  function handleSave() {
    if (!name.trim()) return
    updateAgent(id, {
      name: name.trim(),
      description: description.trim(),
      systemPrompt,
      skills,
    })
    router.push(`/agents/${id}`)
  }

  function handleDelete() {
    deleteAgent(id)
    router.push("/")
  }

  return (
    <AppShell>
      <div className="section-enter flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Настройки агента</h1>
        <p className="text-sm text-muted-foreground">Измените параметры агента — изменения применятся к новым диалогам.</p>
      </div>

      {/* Main settings */}
      <div className="section-enter anim-delay-1">
        <Card className="bg-background dark:bg-transparent border-border/60 py-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-5">
              {/* Left: name + description */}
              <div className="flex flex-col gap-4 flex-1">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="agent-name">Название</Label>
                  <Input
                    id="agent-name"
                    placeholder="Например: Ассистент по продажам"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="agent-desc">
                    Описание
                    <span className="ml-1.5 text-muted-foreground/50 font-normal">(необязательно)</span>
                  </Label>
                  <Input
                    id="agent-desc"
                    placeholder="Краткое описание назначения агента"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Right: system prompt */}
              <div className="flex flex-col gap-2 flex-1">
                <Label htmlFor="agent-prompt">
                  Системный промпт
                  <span className="ml-1.5 text-muted-foreground/50 font-normal">(необязательно)</span>
                </Label>
                <Textarea
                  id="agent-prompt"
                  placeholder="Опишите роль и поведение агента."
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  className="flex-1 min-h-[110px] resize-none text-sm leading-relaxed"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills */}
      <div className="section-enter anim-delay-2 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold">Умения</h2>
          <p className="text-sm text-muted-foreground">Выберите инструменты, которые агент сможет использовать в диалоге.</p>
        </div>
        <SkillsShowcase selected={skills} onChange={setSkills} />
      </div>

      {/* Actions — sticky bottom bar */}
      <div className="sticky bottom-0 -mx-4 md:-mx-10 -mb-4 md:-mb-10 bg-surface-bg border-t border-white/5 rounded-b-[24px] px-4 md:px-10 pt-4 pb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="lg"
          className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
        >
          <Trash2 className="size-4" />
          Удалить агента
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="lg" onClick={() => router.push(`/agents/${id}`)} className="text-muted-foreground">
            Отмена
          </Button>
          <Button size="lg" onClick={handleSave} disabled={!name.trim()}>
            Сохранить
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
