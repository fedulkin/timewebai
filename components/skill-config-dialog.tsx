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

  // Reset form when skill changes or dialog opens
  useEffect(() => {
    if (skill) {
      const defaults: Record<string, string> = {}
      skill.fields.forEach(f => { defaults[f.key] = initialConfig?.[f.key] ?? "" })
      setConfig(defaults)
    }
  }, [skill, open, initialConfig])

  if (!skill) return null

  const hasRequiredFields = skill.fields.filter(f => f.required).length > 0
  const allRequiredFilled = skill.fields
    .filter(f => f.required)
    .every(f => config[f.key]?.trim())

  const canConnect = skill.fields.length === 0 || allRequiredFilled
  const currentSkill = skill

  function handleConnect() {
    if (!canConnect) return
    onConnect(currentSkill.id, config)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-0 gap-0 overflow-hidden">
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

          {/* Tools */}
          {skill.tools.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skill.tools.map(tool => (
                <span
                  key={tool}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono border"
                  style={{
                    borderColor: `${skill.color}30`,
                    color: skill.color,
                    backgroundColor: `${skill.color}0d`,
                  }}
                >
                  {tool}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Config form */}
        {skill.fields.length > 0 && (
          <div className="px-6 py-5 flex flex-col gap-4 border-t border-border/40">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Настройка подключения</p>
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
          <div className="px-6 py-5 border-t border-border/40">
            <p className="text-sm text-muted-foreground">Это умение не требует дополнительной настройки.</p>
          </div>
        )}

        {/* Footer */}
        <div className={cn(
          "px-6 py-4 flex items-center gap-3 border-t border-border/40",
          isConnected ? "justify-between" : "justify-end"
        )}>
          {isConnected && onDisconnect && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
              onClick={() => { onDisconnect(skill.id); onOpenChange(false) }}
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
      </DialogContent>
    </Dialog>
  )
}
