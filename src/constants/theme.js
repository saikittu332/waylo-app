export const colors = {
  navy: "#071E3D",
  navyDeep: "#061833",
  navySoft: "#6B7C93",
  headerBlue: "#F0F7FF",
  blue: "#2874F0",
  blueDeep: "#2874F0",
  skyBlue: "#56CCF2",
  orange: "#FF7A00",
  orangeDark: "#E86F00",
  green: "#18B875",
  background: "#F7F9FC",
  appBackground: "#F7F9FC",
  surface: "#FFFFFF",
  border: "#DDE6F0",
  text: "#172033",
  muted: "#667085",
  mutedLight: "#98A2B3",
  subtleText: "#7A879A",
  paleBlue: "#EDF6FF",
  paleOrange: "#FFF4E8",
  paleGreen: "#E8F8F1",
  paleRed: "#FEECEF",
  glass: "rgba(255,255,255,0.88)",
  red: "#EF233C",
  mapGreen: "#DDEDDC",
  mapBlue: "#D8ECFF",
  mapSand: "#F5EEDB"
};

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  fallback: "System"
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40
};

export const radii = {
  sm: 12,
  md: 18,
  lg: 20,
  xl: 24,
  pill: 999
};

export const typography = {
  hero: {
    fontFamily: fonts.bold,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 34,
    color: colors.navy
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0,
    color: colors.navy
  },
  heading: {
    fontFamily: fonts.bold,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 28,
    color: colors.text
  },
  section: {
    fontFamily: fonts.bold,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0,
    color: colors.text
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.muted
  }
};

export const shadows = {
  card: {
    shadowColor: "#102A43",
    shadowOpacity: 0.045,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  soft: {
    shadowColor: "#102A43",
    shadowOpacity: 0.035,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1
  },
  float: {
    shadowColor: "#102A43",
    shadowOpacity: 0.06,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4
  }
};

export const screen = {
  padding: 20,
  maxWidth: 430
};
