import {
  PreferenceKeys,
  getPreferenceString,
  setPreferenceString,
} from "@/lib/storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AppearanceMode = "light" | "dark" | "system";

const STORAGE_KEY = PreferenceKeys.APPEARANCE;
const DEFAULT_APPEARANCE: AppearanceMode = "light";

function getInitialAppearance(): AppearanceMode {
  const saved = getPreferenceString(STORAGE_KEY);
  if (saved === "light" || saved === "dark" || saved === "system") return saved;
  return DEFAULT_APPEARANCE;
}

type AppearanceContextValue = {
  appearance: AppearanceMode;
  setAppearance: (mode: AppearanceMode) => void;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [appearance, setAppearanceState] = useState<AppearanceMode>(
    getInitialAppearance
  );

  const setAppearance = useCallback((mode: AppearanceMode) => {
    setAppearanceState(mode);
    setPreferenceString(STORAGE_KEY, mode);
  }, []);

  const value = useMemo(
    () => ({ appearance, setAppearance }),
    [appearance, setAppearance]
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance(): AppearanceContextValue {
  const ctx = useContext(AppearanceContext);
  if (!ctx) {
    return {
      appearance: DEFAULT_APPEARANCE,
      setAppearance: () => {},
    };
  }
  return ctx;
}
