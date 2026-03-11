import { useAppearance } from "@/context/appearance-context";
import { useColorScheme as useRNColorScheme } from "react-native";

type ColorScheme = "light" | "dark" | null;

/**
 * Retorna o esquema de cores efetivo (light/dark).
 * Respeita a preferência de aparência do perfil: light, dark ou system.
 * Padrão é "light" quando a preferência não está definida.
 */
export function useColorScheme(): ColorScheme {
  const systemScheme = useRNColorScheme();
  const { appearance } = useAppearance();

  if (appearance === "system") {
    return systemScheme ?? "light";
  }
  return appearance;
}
