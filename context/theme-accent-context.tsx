import type { ThemePreset } from "@/constants/theme";
import { getThemePreset } from "@/constants/theme";
import { PreferenceKeys, getPreferenceString } from "@/lib/storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

function getInitialThemeIndex(): number {
  try {
    const saved = getPreferenceString(PreferenceKeys.THEME_COLOR_INDEX);
    if (saved !== undefined) {
      const i = parseInt(saved, 10);
      if (!Number.isNaN(i) && i >= 0 && i <= 5) return i;
    }
  } catch {}
  return 0;
}

type ThemeAccentContextValue = {
  preset: ThemePreset;
  themeColorIndex: number;
  setThemeColorIndex: (index: number) => void;
};

const ThemeAccentContext = createContext<ThemeAccentContextValue | null>(null);

const defaultPreset = getThemePreset(0);

export function ThemeAccentProvider({ children }: { children: React.ReactNode }) {
  const [themeColorIndex, setThemeColorIndexState] = useState(getInitialThemeIndex);

  const preset = useMemo(
    () => getThemePreset(themeColorIndex),
    [themeColorIndex]
  );

  const setThemeColorIndex = useCallback((index: number) => {
    setThemeColorIndexState(Math.max(0, Math.min(5, Math.floor(index))));
  }, []);

  const value = useMemo<ThemeAccentContextValue>(
    () => ({ preset, themeColorIndex, setThemeColorIndex }),
    [preset, themeColorIndex, setThemeColorIndex]
  );

  return (
    <ThemeAccentContext.Provider value={value}>
      {children}
    </ThemeAccentContext.Provider>
  );
}

export function useThemeAccent(): ThemePreset {
  const ctx = useContext(ThemeAccentContext);
  if (!ctx) return defaultPreset;
  return ctx.preset;
}

/** Retorna também setThemeColorIndex para atualizar o tema ao salvar preferências (ex.: na tela de perfil). */
export function useThemeAccentWithSetter(): ThemeAccentContextValue {
  const ctx = useContext(ThemeAccentContext);
  if (!ctx) {
    return {
      preset: defaultPreset,
      themeColorIndex: 0,
      setThemeColorIndex: () => {},
    };
  }
  return ctx;
}
