type ThemeVariables = Record<`--${string}`, string>;

export const appTheme = {
  brand: {
    name: "MediConnect",
    monogram: "MC",
    tagline: "Specialty medication care coordination",
  },
  seo: {
    description:
      "MediConnect simplifies specialty medication onboarding, adherence, and provider follow-up for patients and care teams.",
    socialDescription:
      "Patient-first specialty medication guidance, reminders, and provider follow-up in one care coordination app.",
    keywords: [
      "MediConnect",
      "specialty medication",
      "patient onboarding",
      "medication adherence",
      "care coordination",
      "provider follow-up",
      "healthcare app",
    ],
  },
  palette: {
    background: "#e8f2ec",
    backgroundWarm: "#f2e4d4",
    backgroundCool: "#d7eae4",
    foreground: "#27414a",
    foregroundStrong: "#17313b",
    muted: "#607179",
    eyebrow: "#2d6b63",
    card: "rgba(245, 250, 247, 0.74)",
    cardStrong: "rgba(247, 251, 249, 0.88)",
    cardSubtle: "rgba(232, 241, 237, 0.82)",
    softPanel: "rgba(238, 246, 242, 0.9)",
    cardBorder: "rgba(23, 49, 59, 0.12)",
    cardBorderStrong: "rgba(23, 49, 59, 0.18)",
    brand: "#2b6171",
    brandDeep: "#214c5a",
    brandDeeper: "#173844",
    brandContrast: "#eef7f6",
    brandContrastMuted: "rgba(238, 247, 246, 0.72)",
    accent: "#2f746a",
    accentSoft: "rgba(47, 116, 106, 0.16)",
    accentBorder: "rgba(47, 116, 106, 0.22)",
    accentGlow: "rgba(47, 116, 106, 0.24)",
    accentText: "#1f5c54",
    secondary: "#ba744d",
    secondarySoft: "rgba(186, 116, 77, 0.16)",
    success: "#3a7d59",
    successSoft: "rgba(58, 125, 89, 0.16)",
    successBorder: "rgba(58, 125, 89, 0.22)",
    warning: "#b7862d",
    warningSoft: "rgba(183, 134, 45, 0.18)",
    warningBorder: "rgba(183, 134, 45, 0.24)",
    danger: "#bf5c6c",
    dangerSoft: "rgba(191, 92, 108, 0.16)",
    dangerBorder: "rgba(191, 92, 108, 0.24)",
    buttonSecondary: "rgba(238, 246, 242, 0.88)",
    buttonSecondaryHover: "rgba(244, 249, 247, 0.96)",
    inputBg: "rgba(245, 250, 247, 0.86)",
    inputBorder: "rgba(23, 49, 59, 0.12)",
    focusRing: "rgba(47, 116, 106, 0.12)",
    gridLine: "rgba(23, 49, 59, 0.04)",
    gridLineLight: "rgba(255, 255, 255, 0.16)",
    selection: "rgba(47, 116, 106, 0.22)",
    glowTopLeft: "rgba(47, 116, 106, 0.2)",
    glowTopRight: "rgba(186, 116, 77, 0.18)",
    glowBottom: "rgba(58, 125, 89, 0.12)",
    shadow: "rgba(21, 39, 49, 0.3)",
    shadowStrong: "rgba(21, 39, 49, 0.42)",
  },
  layout: {
    pageFrame: "px-4 py-5 sm:px-6 lg:px-8",
    container: "mx-auto max-w-6xl",
    main: "space-y-6 pb-12",
  },
  ui: {
    headerCard:
      "surface-card-strong mb-6 flex flex-col gap-4 rounded-[28px] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between",
    heroCard: "surface-card spotlight-panel rounded-[36px] p-8 md:p-10",
    heroSectionCard: "spotlight-panel rounded-[36px] p-8 md:p-10",
    sectionCard: "surface-card rounded-[28px] p-6 md:p-7",
    authCard: "surface-card-strong rounded-[32px] p-6 sm:p-8 md:p-10",
    authInfoCard: "theme-soft-panel rounded-[24px] p-4 sm:p-5",
    metricTile: "metric-tile rounded-[24px] p-4",
    subtlePanel: "theme-subtle-panel rounded-[22px] p-4",
    softPanel: "theme-soft-panel rounded-[24px] p-5",
    darkPanel: "theme-panel-dark rounded-[24px] p-5",
    logoBadge:
      "theme-logo-badge flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold",
    navLink:
      "theme-nav-link inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition",
    navLinkActive:
      "theme-nav-link theme-nav-link-active inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition",
    chip:
      "theme-chip-muted inline-flex h-10 items-center rounded-full px-4 text-xs font-semibold uppercase tracking-[0.2em]",
    primaryButton:
      "theme-button-primary inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
    primaryButtonCompact:
      "theme-button-primary inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
    secondaryButton:
      "theme-button-secondary inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition",
    secondaryButtonCompact:
      "theme-button-secondary inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold transition",
    input: "theme-input w-full rounded-[20px] px-4 py-3 text-sm outline-none transition",
    segmented: "theme-segmented grid grid-cols-2 gap-2 rounded-[24px] p-2",
    segmentedOption:
      "theme-segmented-option rounded-[18px] px-4 py-3 text-sm font-semibold capitalize transition",
    segmentedOptionActive:
      "theme-segmented-option theme-segmented-option-active rounded-[18px] px-4 py-3 text-sm font-semibold capitalize transition",
    feedbackError:
      "theme-feedback theme-feedback-error rounded-[20px] px-4 py-3 text-sm leading-6",
    feedbackSuccess:
      "theme-feedback theme-feedback-success rounded-[20px] px-4 py-3 text-sm leading-6",
    text: {
      eyebrow: "theme-eyebrow text-xs font-semibold uppercase tracking-[0.24em]",
      label: "theme-muted text-xs font-semibold uppercase tracking-[0.2em]",
      headingHero:
        "theme-heading text-4xl font-semibold tracking-[-0.05em] md:text-6xl",
      headingSection:
        "theme-heading text-2xl font-semibold tracking-[-0.03em]",
      headingCard: "theme-heading text-lg font-semibold",
      headingPanel:
        "theme-heading text-xl font-semibold tracking-[-0.03em]",
      headingMetric:
        "theme-heading text-2xl font-semibold tracking-[-0.04em]",
      formLabel: "theme-copy-strong mb-2 block text-sm font-semibold",
      body: "theme-copy text-sm leading-6",
      bodyLarge: "theme-copy text-lg leading-8",
      bodyStrong: "theme-copy-strong font-semibold",
      link: "theme-link font-semibold underline decoration-2 underline-offset-4 transition",
      onDarkLabel:
        "theme-on-dark-muted text-xs font-semibold uppercase tracking-[0.2em]",
      onDarkHeading: "theme-on-dark text-lg font-semibold",
      onDarkHero:
        "theme-on-dark text-xl font-semibold tracking-[-0.03em]",
      onDarkBody: "theme-on-dark text-sm leading-7",
    },
  },
} as const;

export const themeClassNames = appTheme.ui;
export const themeLayoutClasses = appTheme.layout;

export const themeCssVariables: ThemeVariables = {
  "--background": appTheme.palette.background,
  "--background-warm": appTheme.palette.backgroundWarm,
  "--background-cool": appTheme.palette.backgroundCool,
  "--foreground": appTheme.palette.foreground,
  "--foreground-strong": appTheme.palette.foregroundStrong,
  "--muted": appTheme.palette.muted,
  "--eyebrow": appTheme.palette.eyebrow,
  "--card": appTheme.palette.card,
  "--card-strong": appTheme.palette.cardStrong,
  "--card-subtle": appTheme.palette.cardSubtle,
  "--soft-panel": appTheme.palette.softPanel,
  "--card-border": appTheme.palette.cardBorder,
  "--card-border-strong": appTheme.palette.cardBorderStrong,
  "--brand": appTheme.palette.brand,
  "--brand-deep": appTheme.palette.brandDeep,
  "--brand-deeper": appTheme.palette.brandDeeper,
  "--brand-contrast": appTheme.palette.brandContrast,
  "--brand-contrast-muted": appTheme.palette.brandContrastMuted,
  "--accent": appTheme.palette.accent,
  "--accent-soft": appTheme.palette.accentSoft,
  "--accent-border": appTheme.palette.accentBorder,
  "--accent-glow": appTheme.palette.accentGlow,
  "--accent-text": appTheme.palette.accentText,
  "--secondary": appTheme.palette.secondary,
  "--secondary-soft": appTheme.palette.secondarySoft,
  "--success": appTheme.palette.success,
  "--success-soft": appTheme.palette.successSoft,
  "--success-border": appTheme.palette.successBorder,
  "--warning": appTheme.palette.warning,
  "--warning-soft": appTheme.palette.warningSoft,
  "--warning-border": appTheme.palette.warningBorder,
  "--danger": appTheme.palette.danger,
  "--danger-soft": appTheme.palette.dangerSoft,
  "--danger-border": appTheme.palette.dangerBorder,
  "--button-secondary": appTheme.palette.buttonSecondary,
  "--button-secondary-hover": appTheme.palette.buttonSecondaryHover,
  "--input-bg": appTheme.palette.inputBg,
  "--input-border": appTheme.palette.inputBorder,
  "--focus-ring": appTheme.palette.focusRing,
  "--grid-line": appTheme.palette.gridLine,
  "--grid-line-light": appTheme.palette.gridLineLight,
  "--selection": appTheme.palette.selection,
  "--glow-top-left": appTheme.palette.glowTopLeft,
  "--glow-top-right": appTheme.palette.glowTopRight,
  "--glow-bottom": appTheme.palette.glowBottom,
  "--shadow": appTheme.palette.shadow,
  "--shadow-strong": appTheme.palette.shadowStrong,
};

export const statusToneClasses = {
  neutral: "theme-status theme-status-neutral",
  accent: "theme-status theme-status-accent",
  success: "theme-status theme-status-success",
  warning: "theme-status theme-status-warning",
  danger: "theme-status theme-status-danger",
} as const;

export function cx(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}
