type ThemeVariables = Record<`--${string}`, string>;

export const appTheme = {
  brand: {
    name: "MediConnect",
    monogram: "MC",
    tagline: "AI-guided specialty care clarity",
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
    background: "#f7f9ff",
    backgroundWarm: "#ffffff",
    backgroundCool: "#eef3ff",
    foreground: "#5f6b85",
    foregroundStrong: "#10162f",
    muted: "#73809c",
    eyebrow: "#4f6bff",
    card: "rgba(255, 255, 255, 0.82)",
    cardStrong: "rgba(255, 255, 255, 0.94)",
    cardSubtle: "rgba(244, 247, 255, 0.96)",
    softPanel: "rgba(247, 249, 255, 0.98)",
    cardBorder: "rgba(88, 116, 255, 0.12)",
    cardBorderStrong: "rgba(88, 116, 255, 0.18)",
    brand: "#3366ff",
    brandDeep: "#2954eb",
    brandDeeper: "#1f43c2",
    brandContrast: "#ffffff",
    brandContrastMuted: "rgba(255, 255, 255, 0.76)",
    accent: "#5f83ff",
    accentSoft: "rgba(95, 131, 255, 0.12)",
    accentBorder: "rgba(95, 131, 255, 0.22)",
    accentGlow: "rgba(91, 122, 255, 0.2)",
    accentText: "#3252d6",
    secondary: "#10b981",
    secondarySoft: "rgba(16, 185, 129, 0.12)",
    success: "#16a34a",
    successSoft: "rgba(22, 163, 74, 0.12)",
    successBorder: "rgba(22, 163, 74, 0.22)",
    warning: "#f59e0b",
    warningSoft: "rgba(245, 158, 11, 0.12)",
    warningBorder: "rgba(245, 158, 11, 0.22)",
    danger: "#ef4444",
    dangerSoft: "rgba(239, 68, 68, 0.12)",
    dangerBorder: "rgba(239, 68, 68, 0.22)",
    buttonSecondary: "rgba(255, 255, 255, 0.94)",
    buttonSecondaryHover: "rgba(243, 247, 255, 1)",
    inputBg: "rgba(255, 255, 255, 0.96)",
    inputBorder: "rgba(88, 116, 255, 0.16)",
    focusRing: "rgba(95, 131, 255, 0.16)",
    gridLine: "rgba(51, 102, 255, 0.04)",
    gridLineLight: "rgba(255, 255, 255, 0.2)",
    selection: "rgba(95, 131, 255, 0.2)",
    glowTopLeft: "rgba(95, 131, 255, 0.12)",
    glowTopRight: "rgba(147, 197, 253, 0.12)",
    glowBottom: "rgba(51, 102, 255, 0.08)",
    shadow: "rgba(34, 56, 120, 0.12)",
    shadowStrong: "rgba(35, 56, 128, 0.22)",
  },
  layout: {
    pageFrame: "px-4 py-5 sm:px-6 lg:px-8",
    container: "mx-auto max-w-7xl",
    main: "space-y-6 pb-16",
  },
  ui: {
    headerCard:
      "surface-card-strong mb-6 flex flex-col gap-4 rounded-[28px] px-5 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between",
    heroCard: "surface-card-strong rounded-[36px] p-7 md:p-9 lg:p-10",
    heroSectionCard: "surface-card-strong rounded-[34px] p-7 md:p-9",
    sectionCard: "surface-card rounded-[28px] p-6 md:p-7",
    sidebarCard: "surface-card-strong rounded-[28px] p-5",
    authCard: "surface-card-strong rounded-[34px] p-6 sm:p-8 md:p-10",
    authInfoCard: "theme-soft-panel rounded-[24px] p-4 sm:p-5",
    metricTile: "metric-tile rounded-[22px] p-4",
    subtlePanel: "theme-subtle-panel rounded-[20px] p-4",
    softPanel: "theme-soft-panel rounded-[22px] p-5",
    darkPanel: "theme-panel-dark rounded-[28px] p-5",
    workspaceStrip: "theme-soft-panel rounded-[999px] px-4 py-3",
    logoBadge:
      "theme-logo-badge flex h-12 w-12 items-center justify-center rounded-[20px] text-sm font-semibold",
    navLink:
      "theme-nav-link inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition",
    navLinkActive:
      "theme-nav-link theme-nav-link-active inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition",
    sidebarLink:
      "theme-sidebar-link flex items-start gap-3 rounded-[24px] px-3 py-3 text-left transition",
    sidebarLinkActive:
      "theme-sidebar-link theme-sidebar-link-active flex items-start gap-3 rounded-[24px] px-3 py-3 text-left transition",
    chip:
      "theme-chip-muted inline-flex h-10 items-center rounded-full px-4 text-xs font-semibold uppercase tracking-[0.2em]",
    primaryButton:
      "theme-button-primary inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
    primaryButtonCompact:
      "theme-button-primary inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
    secondaryButton:
      "theme-button-secondary inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition",
    secondaryButtonCompact:
      "theme-button-secondary inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition",
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
        "theme-heading text-4xl font-semibold tracking-[-0.06em] md:text-6xl lg:text-7xl",
      headingSection:
        "theme-heading text-2xl font-semibold tracking-[-0.04em] md:text-[2rem]",
      headingCard: "theme-heading text-lg font-semibold tracking-[-0.02em]",
      headingPanel:
        "theme-heading text-xl font-semibold tracking-[-0.03em] md:text-2xl",
      headingMetric:
        "theme-heading text-2xl font-semibold tracking-[-0.04em] md:text-[2rem]",
      formLabel: "theme-copy-strong mb-2 block text-sm font-semibold",
      body: "theme-copy text-sm leading-6 md:text-[15px]",
      bodyLarge: "theme-copy text-lg leading-8 md:text-xl",
      bodyStrong: "theme-copy-strong font-semibold",
      link: "theme-link font-semibold underline decoration-2 underline-offset-4 transition",
      onDarkLabel:
        "theme-on-dark-muted text-xs font-semibold uppercase tracking-[0.2em]",
      onDarkHeading: "theme-on-dark text-lg font-semibold",
      onDarkHero:
        "theme-on-dark text-xl font-semibold tracking-[-0.03em] md:text-2xl",
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
