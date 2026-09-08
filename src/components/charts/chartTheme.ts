import { useUiStore } from '../../store/useUiStore'

export { CHART_PALETTE } from '../../lib/palette'

/** Chart chrome colours that track the active theme. */
export function useChartTheme() {
  const theme = useUiStore((s) => s.theme)
  const dark = theme === 'dark'
  return {
    dark,
    axis: dark ? '#b8ada0' : '#6d6459',
    grid: dark ? '#3b362e' : '#ded5c8',
    tooltipBg: dark ? '#2d2922' : '#ffffff',
    tooltipBorder: dark ? '#3b362e' : '#ded5c8',
    tooltipText: dark ? '#ece5da' : '#221e19',
  }
}

export function tooltipStyle(t: ReturnType<typeof useChartTheme>) {
  return {
    background: t.tooltipBg,
    border: `1px solid ${t.tooltipBorder}`,
    borderRadius: 12,
    color: t.tooltipText,
    fontSize: 12,
    boxShadow: '0 4px 12px rgb(60 50 35 / 0.12)',
  }
}
