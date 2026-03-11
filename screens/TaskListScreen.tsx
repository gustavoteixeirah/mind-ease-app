import { Colors } from "@/constants/theme";
import ListItem from "@/components/ui/list-item";
import { useFontScale } from "@/context/font-scale-context";
import { useTasks, type Task } from "@/context/tasks-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeAccent } from "@/hooks/use-theme-accent";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, ArrowRight, Calendar, X } from "lucide-react-native";
import React from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
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

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateLabel(d: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dNorm = new Date(d);
  dNorm.setHours(0, 0, 0, 0);

  if (isSameDay(dNorm, today)) return "Hoje";
  if (isSameDay(dNorm, tomorrow)) return "Amanhã";
  if (isSameDay(dNorm, yesterday)) return "Ontem";
  const str = d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Retorna array de datas: de (hoje - daysBack) até (hoje + daysForward). */
function getDateRange(daysBack: number, daysForward: number): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates: Date[] = [];
  for (let i = -daysBack; i <= daysForward; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

const TaskListScreen = () => {
  const navigation = useNavigation();
  const { getTasksByDate, toggleCompleted } = useTasks();
  const [detailedMode, setDetailedMode] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [datePickerVisible, setDatePickerVisible] = React.useState(false);

  const selectDateFromPicker = (d: Date) => {
    const normalized = new Date(d);
    normalized.setHours(0, 0, 0, 0);
    setSelectedDate(normalized);
    setDatePickerVisible(false);
  };

  const selectedDateKey = formatDateKey(selectedDate);
  const tasksForSelectedDay = React.useMemo(
    () => getTasksByDate(selectedDateKey),
    [getTasksByDate, selectedDateKey],
  );

  const goToPrevDay = () => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 1);
      return next;
    });
  };

  const goToNextDay = () => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 1);
      return next;
    });
  };

  const filterByComplexity = (taskList: Task[], complexity: string) => {
    return taskList.filter((task) => task.complexity === complexity);
  };

  const complexityValues = EFFORT_ORDER.filter((c) =>
    tasksForSelectedDay.some((t) => t.complexity === c),
  );

  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const themeAccent = useThemeAccent();
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const { fs } = useFontScale();

  const headerGradientColors = isDark
    ? themeAccent.gradientDark
    : themeAccent.gradient;

  const contentBg = isDark ? Colors.dark.background : "#fff";
  const contentBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const badgeBg = isDark ? "#1e1e24" : "#F3F4F6";
  const badgeTextColor = isDark ? "#9BA1A6" : "#4B5563";
  const dateSelectedBg = isDark ? themeAccent.buttonBg : themeAccent.accent;
  const dateSelectedTextColor = isDark ? "#fff" : themeAccent.buttonBg;

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
          <TouchableOpacity
            style={styles.dateNav}
            hitSlop={12}
            onPress={goToPrevDay}
          >
            <ArrowLeft size={22} color={iconColor} />
          </TouchableOpacity>
          <Text
            style={[styles.dateTitle, { color: textColor, fontSize: fs(18) }]}
            numberOfLines={2}
          >
            {formatDateLabel(selectedDate)}
          </Text>
          <View style={styles.dateRight}>
            <TouchableOpacity
              onPress={() => setDatePickerVisible(true)}
              hitSlop={12}
              style={styles.calendarButton}
            >
              <Calendar size={20} color={iconColor} style={styles.calendarIcon} />
            </TouchableOpacity>
            <TouchableOpacity hitSlop={12} onPress={goToNextDay}>
              <ArrowRight size={22} color={iconColor} />
            </TouchableOpacity>
          </View>
        </View>

        {complexityValues.length === 0 ? (
          <Text style={[styles.emptyDayText, { color: textColor, fontSize: fs(16) }]}>
            Nenhuma tarefa para este dia.
          </Text>
        ) : (
          complexityValues.map((comp, index) => {
            const list = filterByComplexity(tasksForSelectedDay, comp);
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
                                  params?: { task: Task },
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
        })
        )}
      </View>

      <Modal
        visible={datePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDatePickerVisible(false)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: contentBg }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalHeader, { borderBottomColor: contentBorder }]}>
              <Text style={[styles.modalTitle, { color: textColor, fontSize: fs(18) }]}>
                Escolher data
              </Text>
              <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                <X size={24} color={iconColor} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dateList}>
              {getDateRange(7, 14).map((d) => {
                const isSelected = isSameDay(d, selectedDate);
                return (
                  <TouchableOpacity
                    key={d.getTime()}
                    style={[
                      styles.dateItem,
                      {
                        backgroundColor: isSelected
                          ? dateSelectedBg
                          : isDark
                            ? "#252530"
                            : "#f5f5f5",
                      },
                    ]}
                    onPress={() => selectDateFromPicker(d)}
                  >
                    <Text
                      style={[
                        styles.dateItemText,
                        {
                          color: isSelected
                            ? dateSelectedTextColor
                            : textColor,
                          fontSize: fs(15),
                        },
                      ]}
                    >
                      {formatDateLabel(d)} ({formatDateKey(d)})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
  calendarButton: {
    padding: 4,
  },
  calendarIcon: {
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontWeight: "700",
  },
  dateList: {
    padding: 16,
  },
  dateItem: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  dateItemText: {},
  emptyDayText: {
    textAlign: "center",
    paddingVertical: 24,
    opacity: 0.8,
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
