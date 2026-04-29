"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { SOLUTIONS } from "@/app/catalog/solutions-data"

export type DeployedStatus = "deploying" | "running" | "stopped"

export type DeployedSolution = {
  id: string
  slug: string
  name: string
  color: string
  status: DeployedStatus
  url: string
  specs: string
  tier: string
  deployedAt: string
}

type SolutionsContextType = {
  solutions: DeployedSolution[]
  deploy: (slug: string, name: string, tier: string, specs: string) => DeployedSolution
  getSolution: (id: string) => DeployedSolution | undefined
  update: (id: string, changes: Partial<Pick<DeployedSolution, "name" | "tier" | "specs">>) => void
  stop: (id: string) => void
  restart: (id: string) => void
}

const SolutionsContext = createContext<SolutionsContextType | null>(null)

export function SolutionsProvider({ children }: { children: React.ReactNode }) {
  const [solutions, setSolutions] = useState<DeployedSolution[]>([])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("tw-deployed-solutions") ?? "[]")
      setSolutions(saved)
    } catch {}
  }, [])

  function save(next: DeployedSolution[]) {
    setSolutions(next)
    localStorage.setItem("tw-deployed-solutions", JSON.stringify(next))
  }

  function deploy(slug: string, name: string, tier: string, specs: string): DeployedSolution {
    const source = SOLUTIONS.find(s => s.slug === slug)!
    const id = `sol-${Date.now()}`
    const instance: DeployedSolution = {
      id,
      slug,
      name: name || source.name,
      color: source.color,
      status: "deploying",
      url: `https://${slug}-${id.slice(-6)}.twc1.net`,
      specs,
      tier,
      deployedAt: new Date().toISOString(),
    }
    const next = [...solutions, instance]
    save(next)

    // Simulate deployment completing in ~4 seconds
    setTimeout(() => {
      setSolutions(prev => {
        const updated = prev.map(s => s.id === id ? { ...s, status: "running" as DeployedStatus } : s)
        localStorage.setItem("tw-deployed-solutions", JSON.stringify(updated))
        return updated
      })
    }, 4000)

    return instance
  }

  function getSolution(id: string) {
    return solutions.find(s => s.id === id)
  }

  function update(id: string, changes: Partial<Pick<DeployedSolution, "name" | "tier" | "specs">>) {
    save(solutions.map(s => s.id === id ? { ...s, ...changes } : s))
  }

  function stop(id: string) {
    save(solutions.map(s => s.id === id ? { ...s, status: "stopped" as DeployedStatus } : s))
  }

  function restart(id: string) {
    const deploying = solutions.map(s => s.id === id ? { ...s, status: "deploying" as DeployedStatus } : s)
    save(deploying)
    setTimeout(() => {
      setSolutions(prev => {
        const updated = prev.map(s => s.id === id ? { ...s, status: "running" as DeployedStatus } : s)
        localStorage.setItem("tw-deployed-solutions", JSON.stringify(updated))
        return updated
      })
    }, 3000)
  }

  return (
    <SolutionsContext.Provider value={{ solutions, deploy, getSolution, update, stop, restart }}>
      {children}
    </SolutionsContext.Provider>
  )
}

export function useSolutions() {
  const ctx = useContext(SolutionsContext)
  if (!ctx) throw new Error("useSolutions must be used within SolutionsProvider")
  return ctx
}
