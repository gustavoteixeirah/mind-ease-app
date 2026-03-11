import ListItem from "@/components/ui/list-item";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useFontScale } from "@/context/font-scale-context";
import { useTasks, type Task } from "@/context/tasks-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeAccent } from "@/hooks/use-theme-accent";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Circle, Info, Leaf, Target } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type EnergyState = "calmo" | "presente" | "focado";

const ENERGY_TO_COMPLEXITY: Record<EnergyState, string> = {
  calmo: "Baixa",
  presente: "Média",
  focado: "Alta",
};

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDashboardDate(date: Date): string {
  const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
  const dayMonth = date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
  });
  const capitalized =
    weekday.charAt(0).toUpperCase() + weekday.slice(1).replace(/\./, "");
  return `${capitalized} • ${dayMonth}`;
}

function priorityOrder(p: "baixa" | "normal" | "alta"): number {
  return p === "alta" ? 0 : p === "normal" ? 1 : 2;
}

function pickFocusTask(
  tasks: Task[],
  energy: EnergyState,
): Task | null {
  const targetComplexity = ENERGY_TO_COMPLEXITY[energy];
  const incomplete = tasks.filter((t) => !t.completed);
  const matching = incomplete.find((t) => t.complexity === targetComplexity);
  return matching ?? incomplete[0] ?? null;
}

function orderTodayTasksByEnergy(
  tasks: Task[],
  energy: EnergyState,
): Task[] {
  const targetComplexity = ENERGY_TO_COMPLEXITY[energy];
  return [...tasks].sort((a, b) => {
    const aMatches = a.complexity === targetComplexity ? 0 : 1;
    const bMatches = b.complexity === targetComplexity ? 0 : 1;
    if (aMatches !== bMatches) return aMatches - bMatches;
    const aDone = a.completed ? 1 : 0;
    const bDone = b.completed ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    return priorityOrder(a.priority) - priorityOrder(b.priority);
  });
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  const { getTasksByDate, toggleCompleted } = useTasks();
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const { fs } = useFontScale();

  const [energy, setEnergy] = useState<EnergyState>("presente");

  const todayKey = formatDateKey(new Date());
  const tasksForToday = useMemo(
    () => getTasksByDate(todayKey),
    [getTasksByDate, todayKey],
  );

  const focusTask = useMemo(
    () => pickFocusTask(tasksForToday, energy),
    [tasksForToday, energy],
  );
  const todayTasksOrdered = useMemo(
    () => orderTodayTasksByEnergy(tasksForToday, energy),
    [tasksForToday, energy],
  );

  const textColor = useThemeColor({}, "text");
  const secondaryText = useThemeColor({}, "icon");
  const themeAccent = useThemeAccent();

  const contentBg = isDark ? Colors.dark.background : "#fff";
  const contentBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const primaryButtonBg = isDark ? "#374151" : "#111827";

  const headerGradientColors = isDark
    ? themeAccent.gradientDark
    : themeAccent.gradient;
  const headerTextColor = "#fff";
  const headerSecondaryColor = "rgba(255,255,255,0.9)";
  const headerPillBg = "rgba(255,255,255,0.2)";
  const headerPillSelectedBg = "rgba(255,255,255,0.4)";
  const headerPillBorder = "rgba(255,255,255,0.4)";
  const headerAvatarBg = "rgba(255,255,255,0.25)";
  const headerAvatarText = "#fff";

  const displayName =
    (user?.displayName || user?.primaryEmail || "usuario")
      .split(/[@.]/)[0]
      .trim() || "usuario";
  const firstName =
    displayName.charAt(0).toUpperCase() + displayName.slice(1).toLowerCase();
  const avatarLetter = firstName.charAt(0);
  const dateLabel = formatDashboardDate(new Date());

  const goToFocusMode = (task: Task) => {
    (
      navigation.getParent() as
        | { navigate: (name: string, params?: object) => void }
        | undefined
    )?.navigate("FocusMode", {
      task: {
        id: task.id,
        title: task.title,
        complexity: task.complexity,
        time: task.time,
        subtasks: task.subtasks?.map((st) => ({ id: st.id, text: st.text })),
      },
    });
  };

  const goToAllTasks = () => {
    navigation.navigate("Tarefas" as never);
  };

  const goToProfile = () => {
    router.push("/(app)/profile");
  };

  return (
    <View style={[styles.container, { backgroundColor: contentBg }]}>
      <LinearGradient
        colors={headerGradientColors}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={goToProfile}
              style={[styles.avatar, { backgroundColor: headerAvatarBg }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.avatarText, { color: headerAvatarText }]}>
                {avatarLetter}
              </Text>
            </TouchableOpacity>
            <View style={styles.headerTextWrap}>
              <Text
                style={[
                  styles.greeting,
                  { color: headerTextColor, fontSize: fs(22) },
                ]}
              >
                Olá, {firstName}
              </Text>
              <Text
                style={[
                  styles.dateLabel,
                  { color: headerSecondaryColor, fontSize: fs(14) },
                ]}
              >
                {dateLabel}
              </Text>
            </View>
          </View>

          <View style={styles.energySection}>
            <View style={styles.energyTitleRow}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: headerTextColor, fontSize: fs(16) },
                ]}
              >
                Como está sua energia agora?
              </Text>
              <TouchableOpacity
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Info size={16} color={headerSecondaryColor} />
              </TouchableOpacity>
            </View>
            <View style={styles.pillRow}>
              <TouchableOpacity
                style={[
                  styles.pill,
                  {
                    borderColor: headerPillBorder,
                    backgroundColor:
                      energy === "calmo" ? headerPillSelectedBg : headerPillBg,
                  },
                ]}
                onPress={() => setEnergy("calmo")}
                activeOpacity={0.7}
              >
                <Leaf size={18} color={headerTextColor} />
                <Text
                  style={[
                    styles.pillLabel,
                    { color: headerTextColor, fontSize: fs(14) },
                  ]}
                >
                  Calmo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pill,
                  {
                    borderColor: headerPillBorder,
                    backgroundColor:
                      energy === "presente"
                        ? headerPillSelectedBg
                        : headerPillBg,
                  },
                ]}
                onPress={() => setEnergy("presente")}
                activeOpacity={0.7}
              >
                <Circle size={18} color={headerTextColor} strokeWidth={2} />
                <Text
                  style={[
                    styles.pillLabel,
                    { color: headerTextColor, fontSize: fs(14) },
                  ]}
                >
                  Presente
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pill,
                  {
                    borderColor: headerPillBorder,
                    backgroundColor:
                      energy === "focado" ? headerPillSelectedBg : headerPillBg,
                  },
                ]}
                onPress={() => setEnergy("focado")}
                activeOpacity={0.7}
              >
                <Target size={18} color={headerTextColor} />
                <Text
                  style={[
                    styles.pillLabel,
                    { color: headerTextColor, fontSize: fs(14) },
                  ]}
                >
                  Focado
                </Text>
              </TouchableOpacity>
            </View>
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
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: textColor, fontSize: fs(18) },
              ]}
            >
              Foque agora
            </Text>
            <Text
              style={[
                styles.sectionSubtitle,
                { color: secondaryText, fontSize: fs(14) },
              ]}
            >
              Escolhida para seu momento.
            </Text>
            {focusTask ? (
              <View style={styles.taskCardWrap}>
                <ListItem
                  title={focusTask.title}
                  completed={focusTask.completed}
                  complexity={focusTask.complexity}
                  priority={focusTask.priority}
                  time={focusTask.time}
                  showFocusIcon
                  onPress={() => toggleCompleted(focusTask.id)}
                  onFocusPress={() => goToFocusMode(focusTask)}
                />
              </View>
            ) : (
              <Text
                style={[
                  styles.emptyHint,
                  { color: secondaryText, fontSize: fs(14) },
                ]}
              >
                Nenhuma tarefa com essa dificuldade hoje.
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: textColor, fontSize: fs(18) },
              ]}
            >
              Hoje
            </Text>
            {todayTasksOrdered.map((task) => (
              <View key={task.id} style={styles.taskCardWrap}>
                <ListItem
                  title={task.title}
                  completed={task.completed}
                  complexity={task.complexity}
                  priority={task.priority}
                  time={task.time}
                  showFocusIcon={!task.completed}
                  onPress={() => toggleCompleted(task.id)}
                  onFocusPress={() => !task.completed && goToFocusMode(task)}
                />
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.verTodasButton, { backgroundColor: primaryButtonBg }]}
            onPress={goToAllTasks}
            activeOpacity={0.8}
          >
            <Text style={styles.verTodasText}>Ver todas</Text>
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
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerTextWrap: {
    marginLeft: 14,
  },
  greeting: {
    fontWeight: "700",
  },
  dateLabel: {
    marginTop: 2,
  },
  energySection: {
    marginBottom: 0,
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
    paddingTop: 24,
    paddingBottom: 16,
  },
  energyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: "700",
  },
  sectionSubtitle: {
    marginTop: 2,
    marginBottom: 12,
  },
  pillRow: {
    flexDirection: "row",
    gap: 10,
  },
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  pillLabel: {
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  taskCardWrap: {
    marginBottom: 0,
  },
  emptyHint: {
    fontStyle: "italic",
    marginTop: 4,
  },
  verTodasButton: {
    alignSelf: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 160,
    alignItems: "center",
  },
  verTodasText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
