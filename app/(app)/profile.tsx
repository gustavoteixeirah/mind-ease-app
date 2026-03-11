import type { FontSizeMode } from "@/constants/theme";
import { Colors, THEME_COLORS, getThemePreset } from "@/constants/theme";
import type { AppearanceMode } from "@/context/appearance-context";
import { useAppearance } from "@/context/appearance-context";
import { useAuth } from "@/context/auth-context";
import { useFontScale } from "@/context/font-scale-context";
import { useThemeAccentWithSetter } from "@/context/theme-accent-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  PreferenceKeys,
  getPreferenceString,
  setPreferenceString,
} from "@/lib/storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FOCUS_OPTIONS = [25, 30, 35] as const;
const PAUSE_OPTIONS = [2, 5, 10] as const;

const FONT_MODE_OPTIONS: { mode: FontSizeMode; label: string; icon: string }[] = [
  { mode: "compacto", label: "Compacto", icon: "A↓" },
  { mode: "conforto", label: "Conforto", icon: "AA" },
  { mode: "acessivel", label: "Acessível", icon: "A↑" },
];

const APPEARANCE_OPTIONS: { id: AppearanceMode; label: string }[] = [
  { id: "light", label: "Claro" },
  { id: "dark", label: "Escuro" },
  { id: "system", label: "Sistema" },
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const { mode: fontSizeMode, setMode: setFontSizeMode, fs } = useFontScale();
  const { setThemeColorIndex: setGlobalThemeIndex } = useThemeAccentWithSetter();
  const { appearance: savedAppearance, setAppearance: setGlobalAppearance } = useAppearance();

  const [focusMinutes, setFocusMinutes] = useState(25);
  const [pauseMinutes, setPauseMinutes] = useState(5);
  const [themeColorIndex, setThemeColorIndex] = useState(0);
  const [appearanceMode, setAppearanceMode] = useState<AppearanceMode>(savedAppearance);

  const themePreset = getThemePreset(themeColorIndex);
  const contentBg = isDark ? Colors.dark.background : "#fff";
  const contentBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const cardBg = isDark ? "#1e1e24" : "#FFF";
  const textColor = isDark ? "#ECEDEE" : "#111827";
  const secondaryText = isDark ? "#9BA1A6" : "#6B7280";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB";
  const selectedBg = isDark ? themePreset.buttonBg : themePreset.accent;
  const selectedBorder = themePreset.selectedBorder;

  const headerGradientColors = isDark
    ? themePreset.gradientDark
    : themePreset.gradient;
  const headerTextColor = "#fff";
  const headerSecondaryColor = "rgba(255,255,255,0.9)";
  const headerAvatarBg = "rgba(255,255,255,0.25)";
  const headerAvatarText = "#fff";

  useEffect(() => {
    try {
      const savedFocus = getPreferenceString(PreferenceKeys.FOCUS_MINUTES);
      const savedPause = getPreferenceString(PreferenceKeys.PAUSE_MINUTES);
      const savedTheme = getPreferenceString(PreferenceKeys.THEME_COLOR_INDEX);
      if (savedFocus) {
        const n = parseInt(savedFocus, 10);
        if (FOCUS_OPTIONS.includes(n as 25 | 30 | 35)) setFocusMinutes(n);
      }
      if (savedPause) {
        const n = parseInt(savedPause, 10);
        if (PAUSE_OPTIONS.includes(n as 2 | 5 | 10)) setPauseMinutes(n);
      }
      if (savedTheme !== undefined) {
        const i = parseInt(savedTheme, 10);
        if (i >= 0 && i < THEME_COLORS.length) setThemeColorIndex(i);
      }
      const savedApp = getPreferenceString(PreferenceKeys.APPEARANCE);
      if (savedApp === "light" || savedApp === "dark" || savedApp === "system") {
        setAppearanceMode(savedApp);
      }
    } catch (e) {
      console.warn("Failed to load profile preferences:", e);
    }
  }, []);

  const handleSavePreferences = useCallback(() => {
    try {
      setPreferenceString(PreferenceKeys.FONT_SCALE_MODE, fontSizeMode);
      setPreferenceString(PreferenceKeys.FOCUS_MINUTES, String(focusMinutes));
      setPreferenceString(PreferenceKeys.PAUSE_MINUTES, String(pauseMinutes));
      setPreferenceString(PreferenceKeys.THEME_COLOR_INDEX, String(themeColorIndex));
      setPreferenceString(PreferenceKeys.APPEARANCE, appearanceMode);
      setGlobalThemeIndex(themeColorIndex);
      setGlobalAppearance(appearanceMode);
      Alert.alert("Sucesso", "Preferências salvas.");
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar as preferências.");
    }
  }, [fontSizeMode, focusMinutes, pauseMinutes, themeColorIndex, appearanceMode, setGlobalThemeIndex, setGlobalAppearance]);

  const handleSignOut = useCallback(() => {
    signOut();
    router.replace("/(auth)/login");
  }, [signOut, router]);

  const displayName =
    (user?.displayName || user?.primaryEmail || "usuário")
      .split(/[@.]/)[0]
      .trim() || "usuário";
  const nameToShow =
    displayName.charAt(0).toUpperCase() + displayName.slice(1).toLowerCase();
  const avatarLetter = nameToShow.charAt(0);

  return (
    <View style={[styles.container, { backgroundColor: contentBg }]}>
      <LinearGradient
        colors={headerGradientColors}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          {/* Linha: Perfil + Sair */}
          <View style={styles.headerRow}>
            <Text
              style={[
                styles.headerTitle,
                { color: headerTextColor, fontSize: fs(22) },
              ]}
            >
              Perfil
            </Text>
            <TouchableOpacity onPress={handleSignOut} activeOpacity={0.7}>
              <Text
                style={[
                  styles.sairButton,
                  { color: headerTextColor, fontSize: fs(16) },
                ]}
              >
                Sair
              </Text>
            </TouchableOpacity>
          </View>
          {/* Avatar + nome (sem caixa) */}
          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: headerAvatarBg }]}>
              <Text
                style={[styles.avatarText, { color: headerAvatarText }]}
              >
                {avatarLetter}
              </Text>
            </View>
            <Text
              style={[
                styles.userName,
                {
                  color: headerTextColor,
                  fontSize: fs(18),
                  textDecorationLine: "underline",
                },
              ]}
            >
              {nameToShow}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View
        style={[
          styles.content,
          {
            backgroundColor: contentBg,
            borderTopColor: contentBorder,
            shadowColor: isDark ? "#000" : "#000",
          },
        ]}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Título Preferências */}
          <Text
            style={[
              styles.sectionTitle,
              { color: textColor, fontSize: fs(20), marginBottom: 12 },
            ]}
          >
            Preferências
          </Text>

            {/* Tamanho do texto */}
          <Text style={[styles.label, { color: textColor, fontSize: fs(16) }]}>
            Tamanho do texto
          </Text>
          <View style={styles.pillsRow}>
            {FONT_MODE_OPTIONS.map(({ mode, label, icon }) => {
              const selected = fontSizeMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: selected ? selectedBg : cardBg,
                      borderColor: selected ? selectedBorder : borderColor,
                    },
                  ]}
                  onPress={() => setFontSizeMode(mode)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pillText,
                      {
                        color: textColor,
                        fontSize: fs(14),
                        fontWeight: selected ? "700" : "500",
                      },
                    ]}
                  >
                    {label} {icon}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quantos minutos de foco? */}
          <Text style={[styles.label, { color: textColor, fontSize: fs(16), marginTop: 20 }]}>
            Quantos minutos de foco?
          </Text>
          <View style={styles.pillsRow}>
            {FOCUS_OPTIONS.map((m) => {
              const selected = focusMinutes === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: selected ? selectedBg : cardBg,
                      borderColor: selected ? selectedBorder : borderColor,
                    },
                  ]}
                  onPress={() => setFocusMinutes(m)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pillText,
                      {
                        color: textColor,
                        fontSize: fs(14),
                        fontWeight: selected ? "700" : "500",
                      },
                    ]}
                  >
                    {m}m
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quantos minutos de pausa? */}
          <Text style={[styles.label, { color: textColor, fontSize: fs(16), marginTop: 20 }]}>
            Quantos minutos de pausa?
          </Text>
          <View style={styles.pillsRow}>
            {PAUSE_OPTIONS.map((m) => {
              const selected = pauseMinutes === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: selected ? selectedBg : cardBg,
                      borderColor: selected ? selectedBorder : borderColor,
                    },
                  ]}
                  onPress={() => setPauseMinutes(m)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pillText,
                      {
                        color: textColor,
                        fontSize: fs(14),
                        fontWeight: selected ? "700" : "500",
                      },
                    ]}
                  >
                    {m}m
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Aparência */}
          <Text style={[styles.label, { color: textColor, fontSize: fs(16), marginTop: 20 }]}>
            Aparência
          </Text>
          <View style={styles.pillsRow}>
            {APPEARANCE_OPTIONS.map((opt) => {
              const selected = appearanceMode === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: selected ? selectedBg : cardBg,
                      borderColor: selected ? selectedBorder : borderColor,
                    },
                  ]}
                  onPress={() => setAppearanceMode(opt.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.pillText,
                      {
                        color: textColor,
                        fontSize: fs(14),
                        fontWeight: selected ? "700" : "500",
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tema de cor */}
          <Text style={[styles.label, { color: textColor, fontSize: fs(16), marginTop: 20 }]}>
            Tema de cor
          </Text>
          <View style={styles.swatchesRow}>
            {THEME_COLORS.map((color, i) => {
              const selected = themeColorIndex === i;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setThemeColorIndex(i)}
                  style={[
                    styles.swatch,
                    {
                      backgroundColor: color,
                      borderWidth: selected ? 2 : 0,
                      borderColor: isDark ? "#ECEDEE" : "#111827",
                    },
                  ]}
                  activeOpacity={0.8}
                />
              );
            })}
          </View>

          {/* Salvar preferências */}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: isDark ? "#374151" : "#111827" }]}
            onPress={handleSavePreferences}
            activeOpacity={0.8}
          >
            <Text style={[styles.saveButtonText, { fontSize: fs(16) }]}>
              Salvar preferências
            </Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientHeader: {
    paddingBottom: 28,
  },
  headerSafe: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontWeight: "700",
  },
  sairButton: {
    fontWeight: "600",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700",
  },
  userName: {
    marginLeft: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    marginTop: -20,
    paddingTop: 16,
    paddingHorizontal: 24,
    overflow: "hidden",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  sectionTitle: {
    fontWeight: "700",
  },
  label: {
    fontWeight: "600",
    marginBottom: 10,
  },
  pillsRow: {
    flexDirection: "row",
    gap: 10,
  },
  pill: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: {
  },
  swatchesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 4,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  saveButton: {
    marginTop: 32,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFF",
    fontWeight: "700",
  },
});
