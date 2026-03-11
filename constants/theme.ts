/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

/** Modo de tamanho de fonte baseado no perfil */
export type FontSizeMode = 'compacto' | 'conforto' | 'acessivel';

/** Fator de escala por modo: compacto (pequena), conforto (normal), acessível (maior) */
export const FONT_SCALE: Record<FontSizeMode, number> = {
  compacto: 0.9,
  conforto: 1,
  acessivel: 1.15,
};

/** Cores dos swatches de tema no perfil (índice = theme_color_index no MMKV) */
export const THEME_COLORS = [
  "#CBE4F7", // 0 azul claro
  "#D8D1F5", // 1 lavanda
  "#ECBED5", // 2 rosa
  "#F8EECF", // 3 amarelo/creme
  "#FAD5BE", // 4 pêssego
  "#B6DFCE", // 5 verde menta
] as const;

export type ThemePreset = {
  /** Cor de destaque (seleção, pills, avatar) */
  accent: string;
  /** Gradiente para header no tema claro [início, meio, fim] */
  gradient: [string, string, ...string[]];
  /** Gradiente para header no tema escuro (tons escuros da mesma cor) */
  gradientDark: [string, string, ...string[]];
  /** Cor de fundo para botões primários (Ver todas, Salvar) */
  buttonBg: string;
  /** Cor da borda do estado selecionado */
  selectedBorder: string;
};

/** Presets em tons pastel: gradientes e botões suaves, coerentes com os swatches. */
const THEME_PRESETS: ThemePreset[] = [
  { accent: "#CBE4F7", gradient: ["#6B9BC4", "#7BAED4", "#8FC4E0"], gradientDark: ["#2d3d52", "#3d4d62", "#4d5d72"], buttonBg: "#6B9BC4", selectedBorder: "#7BAED4" },
  { accent: "#D8D1F5", gradient: ["#8B7FC4", "#9B8FCE", "#A89DD9"], gradientDark: ["#3d3852", "#4d4862", "#5d5872"], buttonBg: "#8B7FC4", selectedBorder: "#9B8FCE" },
  { accent: "#ECBED5", gradient: ["#B87A9A", "#C98BA8", "#D9A3BC"], gradientDark: ["#4a3540", "#5a4550", "#6a5560"], buttonBg: "#B87A9A", selectedBorder: "#C98BA8" },
  { accent: "#F8EECF", gradient: ["#B8A05A", "#C9B87A", "#D9C98B"], gradientDark: ["#4a4535", "#5a5545", "#6a6555"], buttonBg: "#B8A05A", selectedBorder: "#C9B87A" },
  { accent: "#FAD5BE", gradient: ["#B8825A", "#C99B7A", "#D9AF8F"], gradientDark: ["#4a3d35", "#5a4d45", "#6a5d55"], buttonBg: "#B8825A", selectedBorder: "#C99B7A" },
  { accent: "#B6DFCE", gradient: ["#5A9A7A", "#6BAB8A", "#7BB89F"], gradientDark: ["#2d4035", "#3d5045", "#4d6055"], buttonBg: "#5A9A7A", selectedBorder: "#6BAB8A" },
];

/** Retorna o preset do tema pelo índice salvo nas preferências (0–5). */
export function getThemePreset(index: number): ThemePreset {
  const i = Math.max(0, Math.min(5, Math.floor(index)));
  return THEME_PRESETS[i] ?? THEME_PRESETS[0];
}

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
