// Theme Color Palettes - Professional presentation themes
export interface ThemeColors {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textSecondary: string;
  background: string;
  surface: string;
  overlay: string;
}

// Classic Blue - Professional and trustworthy
export const ClassicBlueTheme: ThemeColors = {
  name: "Classic Blue",
  primary: "#1e3a8a", // Deep blue
  secondary: "#3b82f6", // Medium blue
  accent: "#f59e0b", // Warm amber
  text: "#ffffff",
  textSecondary: "#e2e8f0",
  background: "#0f172a", // Dark slate
  surface: "#1e293b",
  overlay: "rgba(15, 23, 42, 0.8)"
};

// Warm Sunset - Energetic and inspiring
export const WarmSunsetTheme: ThemeColors = {
  name: "Warm Sunset",
  primary: "#dc2626", // Rich red
  secondary: "#f97316", // Orange
  accent: "#fbbf24", // Golden yellow
  text: "#ffffff",
  textSecondary: "#fef3c7",
  background: "#7c2d12", // Dark orange-red
  surface: "#9a3412",
  overlay: "rgba(124, 45, 18, 0.8)"
};

// Forest Green - Natural and calming
export const ForestGreenTheme: ThemeColors = {
  name: "Forest Green",
  primary: "#14532d", // Deep forest green
  secondary: "#16a34a", // Medium green
  accent: "#84cc16", // Lime green
  text: "#ffffff",
  textSecondary: "#dcfce7",
  background: "#052e16", // Very dark green
  surface: "#166534",
  overlay: "rgba(5, 46, 22, 0.8)"
};

// Royal Purple - Luxurious and sophisticated
export const RoyalPurpleTheme: ThemeColors = {
  name: "Royal Purple",
  primary: "#581c87", // Deep purple
  secondary: "#8b5cf6", // Medium purple
  accent: "#f472b6", // Pink accent
  text: "#ffffff",
  textSecondary: "#f3e8ff",
  background: "#2e1065", // Dark purple
  surface: "#4c1d95",
  overlay: "rgba(46, 16, 101, 0.8)"
};

// Midnight Navy - Dark and professional
export const MidnightNavyTheme: ThemeColors = {
  name: "Midnight Navy",
  primary: "#0c4a6e", // Deep navy
  secondary: "#0284c7", // Sky blue
  accent: "#06d6a0", // Teal
  text: "#ffffff",
  textSecondary: "#cffafe",
  background: "#0f172a", // Almost black
  surface: "#1e293b",
  overlay: "rgba(15, 23, 42, 0.8)"
};

// Burgundy Wine - Elegant and sophisticated
export const BurgundyWineTheme: ThemeColors = {
  name: "Burgundy Wine",
  primary: "#7c2d12", // Deep burgundy
  secondary: "#b91c1c", // Red
  accent: "#fbbf24", // Gold
  text: "#ffffff",
  textSecondary: "#fef3c7",
  background: "#450a0a", // Very dark red
  surface: "#7f1d1d",
  overlay: "rgba(69, 10, 10, 0.8)"
};

// Modern Slate - Contemporary and clean
export const ModernSlateTheme: ThemeColors = {
  name: "Modern Slate",
  primary: "#475569", // Slate gray
  secondary: "#64748b", // Light slate
  accent: "#06b6d4", // Cyan
  text: "#ffffff",
  textSecondary: "#e2e8f0",
  background: "#0f172a", // Dark blue-gray
  surface: "#1e293b",
  overlay: "rgba(15, 23, 42, 0.8)"
};

// Autumn Warmth - Cozy and inviting
export const AutumnWarmthTheme: ThemeColors = {
  name: "Autumn Warmth",
  primary: "#92400e", // Brown
  secondary: "#d97706", // Orange
  accent: "#fbbf24", // Golden yellow
  text: "#ffffff",
  textSecondary: "#fef3c7",
  background: "#451a03", // Dark brown
  surface: "#78350f",
  overlay: "rgba(69, 26, 3, 0.8)"
};

// Export all themes
export const PresentationThemes = {
  classicBlue: ClassicBlueTheme,
  warmSunset: WarmSunsetTheme,
  forestGreen: ForestGreenTheme,
  royalPurple: RoyalPurpleTheme,
  midnightNavy: MidnightNavyTheme,
  burgundyWine: BurgundyWineTheme,
  modernSlate: ModernSlateTheme,
  autumnWarmth: AutumnWarmthTheme,
};

export type ThemeType = keyof typeof PresentationThemes;

// Helper function to get theme by name
export const getThemeByName = (themeName: ThemeType): ThemeColors => {
  return PresentationThemes[themeName] || ClassicBlueTheme;
};

// Helper function to get all theme names
export const getAllThemeNames = (): ThemeType[] => {
  return Object.keys(PresentationThemes) as ThemeType[];
};
