import { useAppearance } from "@/context/appearance-context";
import { useEffect, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

/**
 * Web: suporta hidratação estática e preferência de aparência (light/dark/system).
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const systemScheme = useRNColorScheme();
  const { appearance } = useAppearance();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) return "light";

  if (appearance === "system") {
    return systemScheme ?? "light";
  }
  return appearance;
}
