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
    <AppShell>
      <div className="section-enter flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Новый агент</h1>
        <p className="text-sm text-muted-foreground">Настройте агента — он запомнит свою роль и будет отвечать в соответствии с ней.</p>
      </div>

      {/* Main settings */}
      <div className="section-enter anim-delay-1">
        <Card className="bg-background dark:bg-transparent border-border/60 py-0">
          <CardContent className="p-6 flex flex-col gap-5">
            <div className="flex flex-col md:flex-row gap-5">
              {/* Name + description */}
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

              {/* Color + preview */}
              <div className="flex flex-col gap-4 md:w-56 shrink-0">
                <div className="flex flex-col gap-2">
                  <Label>Цвет аватара</Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {AGENT_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={cn(
                          "size-7 rounded-lg transition-all",
                          color === c
                            ? "ring-2 ring-offset-2 ring-offset-background scale-110"
                            : "opacity-60 hover:opacity-100"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {name && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
                    <div
                      className="size-9 rounded-lg flex items-center justify-center shrink-0 font-semibold text-white text-sm"
                      style={{ backgroundColor: color }}
                    >
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="text-sm font-medium truncate">{name}</p>
                      {description && <p className="text-xs text-muted-foreground truncate">{description}</p>}
                    </div>
                  </div>
                )}
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

      {/* System prompt — secondary */}
      <div className="section-enter anim-delay-3 flex flex-col gap-2">
        <Label htmlFor="agent-prompt" className="text-sm text-muted-foreground">
          Системный промпт
          <span className="ml-1.5 font-normal opacity-50">(необязательно)</span>
        </Label>
        <Textarea
          id="agent-prompt"
          placeholder="Опишите роль и поведение агента. Например: «Ты опытный маркетолог. Помогаешь создавать рекламные тексты и разрабатывать стратегии продвижения.»"
          value={systemPrompt}
          onChange={e => setSystemPrompt(e.target.value)}
          className="min-h-[100px] resize-none text-sm leading-relaxed bg-background dark:bg-transparent"
        />
      </div>

      {/* Actions */}
      <div className="section-enter anim-delay-4 flex items-center gap-3">
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
