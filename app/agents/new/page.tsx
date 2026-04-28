"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAgents, AGENT_COLORS, type AgentSkill } from "@/components/agents-provider"
import { SkillsShowcase } from "@/components/skills-showcase"
import { cn } from "@/lib/utils"

export default function NewAgentPage() {
  const router = useRouter()
  const { createAgent } = useAgents()

  const [name, setName]                 = useState("")
  const [description, setDescription]   = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [color, setColor]               = useState(AGENT_COLORS[0])
  const [skills, setSkills]             = useState<AgentSkill[]>([])

  function handleCreate() {
    if (!name.trim()) return
    const agent = createAgent({
      name: name.trim(),
      description: description.trim(),
      model: "openai/gpt-4o",
      systemPrompt,
      color,
      skills,
    })
    router.push(`/agents/${agent.id}`)
  }

  return (
    <AppShell mainClassName="pb-24">
      <div className="section-enter flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Новый агент</h1>
        <p className="text-sm text-muted-foreground">Настройте агента — он запомнит свою роль и будет отвечать в соответствии с ней.</p>
      </div>

      {/* Main settings */}
      <div className="section-enter anim-delay-1">
        <Card className="bg-background dark:bg-transparent border-border/60 py-0">
          <CardContent className="p-6 flex flex-col gap-4">
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="agent-prompt">
                Системный промпт
                <span className="ml-1.5 text-muted-foreground/50 font-normal">(необязательно)</span>
              </Label>
              <Textarea
                id="agent-prompt"
                placeholder="Опишите роль и поведение агента. Например: «Ты опытный маркетолог. Помогаешь создавать рекламные тексты и разрабатывать стратегии продвижения.»"
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
                className="min-h-[100px] resize-none text-sm leading-relaxed"
              />
            </div>

            {/* Color picker — one row */}
            <div className="flex items-center gap-3 pt-1">
              <Label className="shrink-0 text-muted-foreground">Цвет аватара</Label>
              <div className="flex items-center gap-2">
                {AGENT_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "size-6 rounded-md transition-all",
                      color === c
                        ? "ring-2 ring-offset-2 ring-offset-background scale-110"
                        : "opacity-60 hover:opacity-100"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
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

      {/* Actions — fixed bottom bar */}
      <div className="fixed bottom-0 left-0 md:left-60 right-0 z-40 bg-surface-bg border-t border-white/5 px-4 md:px-10 py-4 flex items-center gap-3">
        <Button onClick={handleCreate} disabled={!name.trim()} size="lg">
          Создать агента
        </Button>
        <Button variant="ghost" size="lg" onClick={() => router.back()} className="text-muted-foreground">
          Отмена
        </Button>
      </div>
    </AppShell>
  )
}
