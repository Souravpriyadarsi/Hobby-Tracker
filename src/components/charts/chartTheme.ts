import { useUiStore } from '../../store/useUiStore'

export { HOBBY_COLORS as CHART_PALETTE, OTHER_COLOR } from '../../lib/palette'

/** Chart chrome colours that track the active theme. */
export function useChartTheme() {
  const theme = useUiStore((s) => s.theme)
  const dark = theme === 'dark'
  return {
    dark,
    axis: dark ? '#6b6b6b' : '#949494',
    grid: dark ? '#242424' : '#ebebe9',
    accent: dark ? '#6fc3a8' : '#2e9b7f',
    tooltipBg: dark ? '#1f1f1f' : '#ffffff',
    tooltipBorder: dark ? '#333333' : '#e4e4e2',
    tooltipText: dark ? '#ededed' : '#1a1a1a',
  }
}

export function tooltipStyle(t: ReturnType<typeof useChartTheme>) {
  return {
    background: t.tooltipBg,
    border: `1px solid ${t.tooltipBorder}`,
    borderRadius: 5,
    color: t.tooltipText,
    fontSize: 12,
    padding: '6px 10px',
  }
}
