/**
 * Hobby accents, which double as chart series colours.
 *
 * Six slots, assigned in fixed order and never cycled — a seventh hobby folds
 * into "Other" in charts rather than reusing a hue. The set was validated for
 * OKLCH lightness band, chroma floor, colour-blind (protan/deutan/tritan)
 * separation between adjacent slots, and contrast against both the light and
 * dark card surfaces. Re-run that check before changing any value: an earlier,
 * airier pastel set had two hobby colours only ΔE 3.2 apart, which is
 * indistinguishable even with full colour vision.
 *
 * Order alternates blue-leaning and yellow-leaning hues, which is what buys the
 * separation under red-green colour blindness.
 */
export const HOBBY_COLORS = [
  '#3CA0CA', // sky
  '#D7735E', // coral
  '#17A8A9', // teal
  '#B88C19', // ochre
  '#CD7397', // rose
  '#7BA24F', // sage
] as const

export const DEFAULT_HOBBY_COLOR = HOBBY_COLORS[0]

/** Fallback for anything beyond the six slots, and for unknown hobbies. */
export const OTHER_COLOR = '#6B6B6B'

