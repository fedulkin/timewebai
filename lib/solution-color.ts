"use client"

import { useTheme } from "next-themes"

/** Pick color or darkColor based on resolved theme */
export function resolveColor(
  color: string,
  darkColor: string | undefined,
  isDark: boolean,
): string {
  return isDark && darkColor ? darkColor : color
}

/** For buttons: returns #000 on light colors, #fff on dark colors */
export function contrastText(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) || 0
  const g = parseInt(hex.slice(3, 5), 16) || 0
  const b = parseInt(hex.slice(5, 7), 16) || 0
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? "#000000" : "#ffffff"
}

/** Hook: resolves the correct brand color for the current theme */
export function useSolutionColor(color: string, darkColor?: string): string {
  const { resolvedTheme } = useTheme()
  return resolveColor(color, darkColor, resolvedTheme === "dark")
}
