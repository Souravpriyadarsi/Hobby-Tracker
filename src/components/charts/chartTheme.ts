import { useUiStore } from '../../store/useUiStore'

export function useChartTheme() {
  const theme = useUiStore((s) => s.theme)
  const dark = theme === 'dark'
  return {
    dark,
    axis: dark ? '#64748b' : '#94a3b8',
    grid: dark ? '#1e293b' : '#e2e8f0',
    tooltipBg: dark ? '#0f172a' : '#ffffff',
    tooltipBorder: dark ? '#334155' : '#e2e8f0',
    tooltipText: dark ? '#e2e8f0' : '#0f172a',
  }
}

export const CHART_PALETTE = [
  '#6366f1',
  '#ec4899',
  '#f97316',
  '#22c55e',
  '#0ea5e9',
  '#eab308',
  '#8b5cf6',
  '#14b8a6',
  '#ef4444',
  '#64748b',
]
