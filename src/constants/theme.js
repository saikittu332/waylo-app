export const colors = {
  navy: "#234765",
  navyDeep: "#17324D",
  navySoft: "#5D7E9B",
  headerBlue: "#EEF6FF",
  blue: "#2F80ED",
  skyBlue: "#56CCF2",
  orange: "#F97316",
  orangeDark: "#EA580C",
  green: "#12B886",
  background: "#F8FAFC",
  appBackground: "#F7F9FC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  text: "#1D2939",
  muted: "#6B778C",
  mutedLight: "#98A2B3",
  paleBlue: "#EDF6FF",
  paleOrange: "#FFF4E8",
  paleGreen: "#E8F8F1",
  red: "#EF233C",
  mapGreen: "#DDEDDC",
  mapBlue: "#D8ECFF"
};

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  fallback: "System"
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32
};

export const radii = {
  sm: 8,
  md: 14,
  lg: 22,
  xl: 28,
  pill: 999
};

export const typography = {
  hero: {
    fontFamily: fonts.semibold,
    fontSize: 28,
    fontWeight: "600",
    letterSpacing: 0,
    lineHeight: 36,
    color: colors.navy
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 30,
    fontWeight: "600",
    letterSpacing: 0,
    color: colors.navy
  },
  heading: {
    fontFamily: fonts.semibold,
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: 0,
    lineHeight: 30,
    color: colors.text
  },
  section: {
    fontFamily: fonts.medium,
    fontSize: 18,
    fontWeight: "500",
    letterSpacing: 0,
    color: colors.text
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 23,
    color: colors.text
  },
  caption: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted
  }
};

export const shadows = {
  card: {
    shadowColor: "#102A43",
    shadowOpacity: 0.045,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  soft: {
    shadowColor: "#102A43",
    shadowOpacity: 0.035,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1
  }
};

export const screen = {
  padding: 18,
  maxWidth: 430
};
