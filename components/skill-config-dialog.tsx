"use client"

import { useState, useEffect } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Search, Newspaper, Send, Mail, Hash, Database, Table2, Globe,
  CalendarDays, FileText, GitPullRequest, Code2, Monitor,
  ExternalLink, BookOpen, ChevronRight,
} from "lucide-react"
import { type Skill } from "@/app/agents/skills-data"
import { cn } from "@/lib/utils"

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Search, Newspaper, Send, Mail, Hash, Database, Table2, Globe,
  CalendarDays, FileText, GitPullRequest, Code2, Monitor,
}

function SkillIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const Icon = ICON_MAP[name]
  return Icon ? <Icon className={className} style={style} /> : null
}

// ─── Instructions renderer ────────────────────────────────────────────────────

function Instructions({ text, color }: { text: string; color: string }) {
  const lines = text.split("\n")
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith("# ")) {
      elements.push(
        <p key={i} className="text-xs font-semibold uppercase tracking-wider text-foreground/70 mt-4 first:mt-0">
          {line.slice(2)}
        </p>
      )
    } else if (/^\d+\. /.test(line)) {
      // Collect consecutive numbered lines into a list
      const items: string[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""))
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} className="flex flex-col gap-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
              <span
                className="size-5 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold mt-px"
                style={{ backgroundColor: `${color}18`, color }}
              >
                {idx + 1}
              </span>
              <span dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
            </li>
          ))}
        </ol>
      )
      continue
    } else if (line.startsWith("- ")) {
      // Collect consecutive bullet lines
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} className="flex flex-col gap-1.5">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
              <span className="mt-2 size-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
            </li>
          ))}
        </ul>
      )
      continue
    } else if (line.startsWith("> ")) {
      elements.push(
        <div
          key={i}
          className="rounded-lg px-3 py-2.5 text-xs leading-relaxed"
          style={{ backgroundColor: `${color}0f`, color: `${color}cc`, borderLeft: `2px solid ${color}40` }}
        >
          {line.slice(2)}
        </div>
      )
    } else if (line.trim() === "") {
      // skip empty lines (spacing handled by gap)
    } else {
      elements.push(
        <p key={i} className="text-sm text-muted-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderInline(line) }}
        />
      )
    }
    i++
  }

  return <div className="flex flex-col gap-3">{elements}</div>
}

function renderInline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded text-[11px] font-mono bg-muted/60">$1</code>')
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

interface SkillConfigDialogProps {
  skill: Skill | null
  open: boolean
  onOpenChange: (open: boolean) => void
  initialConfig?: Record<string, string>
  onConnect: (skillId: string, config: Record<string, string>) => void
  onDisconnect?: (skillId: string) => void
  isConnected?: boolean
}

export function SkillConfigDialog({
  skill,
  open,
  onOpenChange,
  initialConfig,
  onConnect,
  onDisconnect,
  isConnected,
}: SkillConfigDialogProps) {
  const [config, setConfig] = useState<Record<string, string>>({})
  const [showInstructions, setShowInstructions] = useState(false)

  // Reset form + panel when skill changes or dialog opens
  useEffect(() => {
    if (skill) {
      const defaults: Record<string, string> = {}
      skill.fields.forEach(f => { defaults[f.key] = initialConfig?.[f.key] ?? "" })
      setConfig(defaults)
    }
    setShowInstructions(false)
  }, [skill, open, initialConfig])

  if (!skill) return null

  const allRequiredFilled = skill.fields
    .filter(f => f.required)
    .every(f => config[f.key]?.trim())

  const canConnect = skill.fields.length === 0 || allRequiredFilled
  const currentSkill = skill
  const hasInstructions = !!skill.instructions && skill.fields.length > 0

  function handleConnect() {
    if (!canConnect) return
    onConnect(currentSkill.id, config)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden transition-[width] duration-300 ease-in-out"
        style={{
          width: showInstructions ? "860px" : "480px",
          maxWidth: "min(860px, 95vw)",
        }}
      >
        {/* Outer: height determined solely by left column */}
        <div className="relative overflow-hidden">

          {/* ── Left: config ───────────────────────────────────────────── */}
          <div className="flex flex-col w-[480px]">

            {/* Hero header */}
            <div
              className="px-6 pt-6 pb-5 flex flex-col gap-4"
              style={{ background: `linear-gradient(135deg, ${skill.color}12 0%, ${skill.color}06 100%)` }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="size-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${skill.color}20` }}
                >
                  <SkillIcon name={skill.icon} className="size-6" style={{ color: skill.color }} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0 pt-0.5">
                  <DialogTitle className="text-base font-semibold leading-tight">{skill.name}</DialogTitle>
                  <p className="text-xs text-muted-foreground font-mono">{skill.connector}</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">by {skill.author}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{skill.longDescription}</p>

              {(skill.website || skill.docs) && (
                <div className="flex items-center gap-4">
                  {skill.website && (
                    <a
                      href={skill.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
                      style={{ color: skill.color }}
                    >
                      <ExternalLink className="size-3.5" />
                      Сайт
                    </a>
                  )}
                  {skill.docs && (
                    <a
                      href={skill.docs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
                      style={{ color: skill.color }}
                    >
                      <BookOpen className="size-3.5" />
                      Документация
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Config form */}
            {skill.fields.length > 0 && (
              <div className="px-6 py-5 flex flex-col gap-4 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Настройка подключения
                  </p>
                  {hasInstructions && (
                    <button
                      onClick={() => setShowInstructions(v => !v)}
                      className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
                      style={{ color: skill.color }}
                    >
                      {showInstructions ? "Скрыть инструкцию" : "Показать инструкцию"}
                      <ChevronRight
                        className={cn("size-3.5 transition-transform", showInstructions && "rotate-180")}
                      />
                    </button>
                  )}
                </div>
                {skill.fields.map(field => (
                  <div key={field.key} className="flex flex-col gap-1.5">
                    <Label htmlFor={`skill-field-${field.key}`} className="text-sm">
                      {field.label}
                      {field.required && <span className="ml-1 text-destructive">*</span>}
                    </Label>
                    {field.type === "textarea" ? (
                      <Textarea
                        id={`skill-field-${field.key}`}
                        placeholder={field.placeholder}
                        value={config[field.key] ?? ""}
                        onChange={e => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="min-h-[90px] resize-none text-sm font-mono leading-relaxed"
                      />
                    ) : (
                      <Input
                        id={`skill-field-${field.key}`}
                        type={field.type === "password" ? "password" : "text"}
                        placeholder={field.placeholder}
                        value={config[field.key] ?? ""}
                        onChange={e => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* No config needed */}
            {skill.fields.length === 0 && (
              <div className="px-6 py-5 border-t border-border/40 flex-1">
                <p className="text-sm text-muted-foreground">Это умение не требует дополнительной настройки.</p>
              </div>
            )}

            {/* Footer */}
            <div className={cn(
              "px-6 py-4 flex items-center gap-3 border-t border-border/40 shrink-0",
              isConnected ? "justify-between" : "justify-end"
            )}>
              {isConnected && onDisconnect && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                  onClick={() => { onDisconnect(currentSkill.id); onOpenChange(false) }}
                >
                  Отключить
                </Button>
              )}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                  Отмена
                </Button>
                <Button
                  size="sm"
                  disabled={!canConnect}
                  onClick={handleConnect}
                  style={canConnect ? { backgroundColor: skill.color, color: "#fff" } : undefined}
                >
                  {isConnected ? "Сохранить" : "Подключить"}
                </Button>
              </div>
            </div>
          </div>

          {/* ── Right: instructions — absolute so it never affects dialog height ── */}
          <div
            className="absolute top-0 right-0 bottom-0 overflow-hidden transition-[width] duration-300"
            style={{
              width: showInstructions && skill.instructions ? "380px" : "0px",
              borderLeft: showInstructions && skill.instructions
                ? "1px solid hsl(var(--border) / 0.4)"
                : "none",
            }}
          >
            <div className="flex flex-col h-full" style={{ width: "380px" }}>
              <div className="px-5 py-4 border-b border-border/40 shrink-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Инструкция</p>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                {skill.instructions && <Instructions text={skill.instructions} color={skill.color} />}
              </div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
