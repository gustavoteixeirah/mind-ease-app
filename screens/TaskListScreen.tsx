import { Colors } from "@/constants/theme";
import ListItem from "@/components/ui/list-item";
import { useFontScale } from "@/context/font-scale-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react-native";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Esforço mental: Leve, Normal, Exigente (agrupamento das tarefas) */
const EFFORT_LABELS: Record<string, string> = {
  Baixa: "Leve",
  Média: "Normal",
  Alta: "Exigente",
};

const EFFORT_ORDER = ["Baixa", "Média", "Alta"] as const;

type TaskItem = {
  id: string;
  title: string;
  completed: boolean;
  complexity: string;
  priority: "baixa" | "normal" | "alta";
  time: string;
  tags?: string[];
  date: string;
  focusModeEnabled: boolean;
};

const INITIAL_TASKS: TaskItem[] = [
  {
    id: "1",
    title: "Escrever dissertação",
    completed: false,
    complexity: "Média",
    priority: "alta",
    time: "1h30m",
    tags: ["Trabalho", "Escola"],
    date: "2026-06-01",
    focusModeEnabled: true,
  },
  {
    id: "2",
    title: "Ler 3 capítulos",
    completed: false,
    complexity: "Baixa",
    priority: "normal",
    time: "2h",
    tags: ["Estudo"],
    date: "2026-06-02",
    focusModeEnabled: true,
  },
  {
    id: "3",
    title: "Responder e-mails",
    completed: true,
    complexity: "Baixa",
    priority: "baixa",
    time: "30m",
    tags: [],
    date: "2026-02-17",
    focusModeEnabled: true,
  },
  {
    id: "4",
    title: "Escrever dissertação",
    completed: false,
    complexity: "Alta",
    priority: "alta",
    time: "45m",
    tags: ["Internet"],
    date: "2026-06-04",
    focusModeEnabled: false,
  },
];

const TaskListScreen = () => {
  const navigation = useNavigation();
  const [detailedMode, setDetailedMode] = React.useState(false);
  const [tasks, setTasks] = React.useState<TaskItem[]>(INITIAL_TASKS);

  const toggleCompleted = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const filterByComplexity = (taskList: typeof tasks, complexity: string) => {
    return taskList.filter((task) => task.complexity === complexity);
  };

  const complexityValues = EFFORT_ORDER.filter((c) =>
    tasks.some((t) => t.complexity === c),
  );

  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const { fs } = useFontScale();

  const headerGradientColors = isDark
    ? (["#1a1a2e", "#16213e", "#0f3460"] as [string, string, ...string[]])
    : (["#667eea", "#764ba2", "#5a67d8"] as [string, string, ...string[]]);

  const contentBg = isDark ? Colors.dark.background : "#fff";
  const contentBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const badgeBg = isDark ? "#1e1e24" : "#F3F4F6";
  const badgeTextColor = isDark ? "#9BA1A6" : "#4B5563";

  return (
    <View style={[styles.container, { backgroundColor: contentBg }]}>
      <LinearGradient
        colors={headerGradientColors}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, { fontSize: fs(20) }]}>Suas tarefas</Text>
            <View style={styles.toggleRow}>
              <Switch
                value={detailedMode}
                onValueChange={setDetailedMode}
                trackColor={{
                  false: "rgba(255,255,255,0.4)",
                  true: "rgba(255,255,255,0.6)",
                }}
                thumbColor="#fff"
              />
              <Text style={[styles.headerToggleLabel, { fontSize: fs(14) }]}>Ver detalhes</Text>
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
        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.dateNav} hitSlop={12}>
            <ArrowLeft size={22} color={iconColor} />
          </TouchableOpacity>
          <Text style={[styles.dateTitle, { color: textColor, fontSize: fs(18) }]}>Hoje</Text>
          <View style={styles.dateRight}>
            <Calendar size={20} color={iconColor} style={styles.calendarIcon} />
            <TouchableOpacity hitSlop={12}>
              <ArrowRight size={22} color={iconColor} />
            </TouchableOpacity>
          </View>
        </View>

        {complexityValues.map((comp, index) => {
          const list = filterByComplexity(tasks, comp);
          const count = list.length;
          const label = EFFORT_LABELS[comp] ?? comp;
          return (
            <View key={comp + index} style={styles.section}>
              <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                <Text style={[styles.badgeText, { color: badgeTextColor, fontSize: fs(14) }]}>
                  {label} ({count})
                </Text>
              </View>
              <FlatList
                data={list}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <ListItem
                    {...item}
                    detailedMode={detailedMode}
                    onPress={() => toggleCompleted(item.id)}
                    onFocusPress={
                      item.focusModeEnabled && !item.completed
                        ? () =>
                            (
                              navigation.getParent() as {
                                navigate: (
                                  name: string,
                                  params?: { task: TaskItem },
                                ) => void;
                              }
                            )?.navigate("FocusMode", { task: item })
                        : undefined
                    }
                    showFocusIcon={Boolean(
                      item.focusModeEnabled && !item.completed,
                    )}
                  />
                )}
                keyExtractor={(item) => item.id}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientHeader: {
    paddingBottom: 28,
  },
  headerSafe: {
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerToggleLabel: {
    fontSize: 14,
    color: "#fff",
    marginLeft: 8,
    opacity: 0.95,
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    marginTop: -20,
    paddingTop: 16,
    paddingHorizontal: 16,
    overflow: "hidden",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dateNav: {
    padding: 4,
  },
  dateTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  dateRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  calendarIcon: {
    marginRight: 4,
  },
  section: {
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default TaskListScreen;
