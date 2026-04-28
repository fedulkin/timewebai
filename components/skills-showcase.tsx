"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Search, Newspaper, Send, Mail, Hash, Database, Table2, Globe,
  CalendarDays, FileText, GitPullRequest, Code2, Monitor,
} from "lucide-react"
import { SKILLS, CATEGORY_LABELS, CATEGORIES, type Skill } from "@/app/agents/skills-data"
import { SkillConfigDialog } from "@/components/skill-config-dialog"
import { type AgentSkill } from "@/components/agents-provider"
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

// ─── Skill card ───────────────────────────────────────────────────────────────

function SkillCard({
  skill,
  connected,
  onClick,
}: {
  skill: Skill
  connected: boolean
  onClick: () => void
}) {
  return (
    <Card
      className={cn(
        "bg-background dark:bg-transparent border-border/60 py-0 cursor-pointer transition-all",
        connected && "border-primary/50 bg-primary/3 dark:bg-primary/5"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div
            className="size-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${skill.color}18` }}
          >
            <SkillIcon name={skill.icon} className="size-4" style={{ color: skill.color } as React.CSSProperties} />
          </div>
          {connected && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-primary/10 text-primary shrink-0">
              добавлено
            </span>
          )}
        </div>

        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium leading-tight">{skill.name}</p>
          <p className="text-xs text-muted-foreground/70 font-mono">{skill.connector}</p>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {skill.description}
        </p>
      </CardContent>
    </Card>
  )
}

// ─── Skills showcase ──────────────────────────────────────────────────────────

interface SkillsShowcaseProps {
  selected: AgentSkill[]
  onChange: (skills: AgentSkill[]) => void
}

export function SkillsShowcase({ selected, onChange }: SkillsShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<Skill["category"] | "all">("all")
  const [onlyAdded, setOnlyAdded] = useState(false)
  const [dialogSkill, setDialogSkill] = useState<Skill | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const selectedIds = selected.map(s => s.id)

  function openDialog(skill: Skill) {
    setDialogSkill(skill)
    setDialogOpen(true)
  }

  function handleConnect(skillId: string, config: Record<string, string>) {
    const existing = selected.find(s => s.id === skillId)
    if (existing) {
      onChange(selected.map(s => s.id === skillId ? { ...s, config } : s))
    } else {
      onChange([...selected, { id: skillId, config }])
    }
  }

  function handleDisconnect(skillId: string) {
    onChange(selected.filter(s => s.id !== skillId))
  }

  const filtered = SKILLS
    .filter(s => activeCategory === "all" || s.category === activeCategory)
    .filter(s => !onlyAdded || selectedIds.includes(s.id))

  return (
    <div className="flex flex-col gap-4">
      {/* Category tabs + added filter */}
      <div className="flex items-center gap-1 flex-wrap">
        <button
          onClick={() => { setActiveCategory("all"); setOnlyAdded(false) }}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            activeCategory === "all" && !onlyAdded
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          Все
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setOnlyAdded(false) }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              activeCategory === cat && !onlyAdded
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}

        {/* Divider */}
        {selected.length > 0 && (
          <>
            <span className="w-px h-4 bg-border/60 mx-1" />
            <button
              onClick={() => { setOnlyAdded(v => !v); setActiveCategory("all") }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                onlyAdded
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Добавленные · {selected.length}
            </button>
          </>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {filtered.map(skill => (
          <SkillCard
            key={skill.id}
            skill={skill}
            connected={selectedIds.includes(skill.id)}
            onClick={() => openDialog(skill)}
          />
        ))}
      </div>

      {/* Config dialog */}
      <SkillConfigDialog
        skill={dialogSkill}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialConfig={dialogSkill ? selected.find(s => s.id === dialogSkill.id)?.config : undefined}
        isConnected={dialogSkill ? selectedIds.includes(dialogSkill.id) : false}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />
    </div>
  )
}
