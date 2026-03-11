import { createMMKV } from "react-native-mmkv";

const PREFERENCES_ID = "mindease-preferences";

/** Instância MMKV para preferências do app (perfil, fonte, foco, tema). */
export const preferencesStorage = createMMKV({ id: PREFERENCES_ID });

export const PreferenceKeys = {
  FONT_SCALE_MODE: "font_scale_mode",
  FOCUS_MINUTES: "focus_minutes",
  PAUSE_MINUTES: "pause_minutes",
  THEME_COLOR_INDEX: "theme_color_index",
  /** "light" | "dark" | "system" — aparência do app. Padrão: "light". */
  APPEARANCE: "appearance",
  /** JSON array de tarefas (TasksStore). */
  TASKS_JSON: "tasks_json",
} as const;

export function getPreferenceString(key: string): string | undefined {
  return preferencesStorage.getString(key);
}

export function setPreferenceString(key: string, value: string): void {
  preferencesStorage.set(key, value);
}

export function getPreferenceNumber(key: string): number | undefined {
  return preferencesStorage.getNumber(key);
}

export function setPreferenceNumber(key: string, value: number): void {
  preferencesStorage.set(key, value);
}
