import type { FontSizeMode } from "@/constants/theme";
import { FONT_SCALE } from "@/constants/theme";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type FontScaleContextValue = {
  mode: FontSizeMode;
  setMode: (mode: FontSizeMode) => void;
  scale: number;
  /** Retorna tamanho de fonte escalado (arredondado). Use para fontSize em estilos. */
  fs: (baseSize: number) => number;
};

const FontScaleContext = createContext<FontScaleContextValue | null>(null);

export function FontScaleProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<FontSizeMode>("conforto");
  const scale = FONT_SCALE[mode];
  const setMode = useCallback((newMode: FontSizeMode) => {
    setModeState(newMode);
  }, []);
  const fs = useCallback(
    (baseSize: number) => Math.round(baseSize * scale),
    [scale]
  );
  const value = useMemo<FontScaleContextValue>(
    () => ({ mode, setMode, scale, fs }),
    [mode, setMode, scale, fs]
  );
  return (
    <FontScaleContext.Provider value={value}>
      {children}
    </FontScaleContext.Provider>
  );
}

export function useFontScale(): FontScaleContextValue {
  const ctx = useContext(FontScaleContext);
  if (!ctx) {
    return {
      mode: "conforto",
      setMode: () => {},
      scale: 1,
      fs: (n) => Math.round(n),
    };
  }
  return ctx;
}
