import { Colors } from "@/constants/theme";
import { useFontScale } from "@/context/font-scale-context";
import { useTasks } from "@/context/tasks-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeAccent } from "@/hooks/use-theme-accent";
import { useThemeColor } from "@/hooks/use-theme-color";
import { PreferenceKeys, getPreferenceString } from "@/lib/storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Check, Circle, Pause, Play } from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle as SvgCircle } from "react-native-svg";

const RING_SIZE = 200;
const RING_RADIUS = 92;
const STROKE_WIDTH = 8;

const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_PAUSE_MINUTES = 5;
const DEFAULT_LONG_PAUSE_MINUTES = 15;
const DEFAULT_CYCLES_TOTAL = 4;

type Phase = "work" | "shortBreak" | "longBreak";

export type PomodoroConfig = {
  focusMinutes: number;
  pauseMinutes: number;
  longPauseMinutes: number;
  cyclesTotal: number;
};

/** Converte tempo da tarefa (ex: "30m", "1h", "1h30m") em minutos. */
function parseTaskTimeToMinutes(timeStr: string | undefined): number | null {
  if (!timeStr || typeof timeStr !== "string" || timeStr.trim() === "")
    return null;
  const s = timeStr.trim().toLowerCase();
  let total = 0;
  const hMatch = s.match(/(\d+)\s*h(?:oras?)?/);
  const mMatch = s.match(/(\d+)\s*m(?:in(?:utos?)?)?/);
  if (hMatch) total += parseInt(hMatch[1], 10) * 60;
  if (mMatch) total += parseInt(mMatch[1], 10);
  if (total > 0) return total;
  const onlyNum = s.match(/^(\d+)\s*(m|h)?$/);
  if (onlyNum) {
    const n = parseInt(onlyNum[1], 10);
    const unit = onlyNum[2];
    return unit === "h" ? n * 60 : n;
  }
  return null;
}

/** Calcula quantos ciclos de foco cabem no tempo da tarefa. */
function getCyclesTotalFromTask(
  taskTimeMinutes: number | null,
  focusMinutes: number,
): number {
  if (taskTimeMinutes == null || taskTimeMinutes <= 0)
    return DEFAULT_CYCLES_TOTAL;
  return Math.max(1, Math.ceil(taskTimeMinutes / focusMinutes));
}

/** Duração em segundos do ciclo de trabalho N (1-based). Último ciclo pode ser menor. */
function getWorkCycleSeconds(
  cycleIndex: number,
  cyclesTotal: number,
  focusMinutes: number,
  taskTotalMinutes: number | null,
): number {
  if (taskTotalMinutes == null || taskTotalMinutes <= 0)
    return focusMinutes * 60;
  const remainder = taskTotalMinutes % focusMinutes;
  if (cycleIndex === cyclesTotal && remainder > 0) return remainder * 60;
  return focusMinutes * 60;
}

function getPhaseLabel(phase: Phase): string {
  switch (phase) {
    case "work":
      return "Em foco";
    case "shortBreak":
      return "Pausa curta";
    case "longBreak":
      return "Pausa longa";
  }
}

export type FocusModeTask = {
  id: string;
  title: string;
  complexity?: string;
  time?: string;
  category?: string[];
  date?: string;
  subtasks?: { id: string; text: string; completed?: boolean }[];
};

export type FocusModeParams = {
  task?: FocusModeTask;
  /** Minutos de foco (perfil). Padrão 25. */
  focusMinutes?: number;
  /** Minutos de pausa curta (perfil). Padrão 5. */
  pauseMinutes?: number;
  /** Minutos de pausa longa (perfil). Padrão 15. */
  longPauseMinutes?: number;
};

function getSavedFocusMinutes(): number {
  try {
    const v = getPreferenceString(PreferenceKeys.FOCUS_MINUTES);
    if (v) {
      const n = parseInt(v, 10);
      if (n >= 1 && n <= 60) return n;
    }
  } catch {}
  return DEFAULT_FOCUS_MINUTES;
}

function getSavedPauseMinutes(): number {
  try {
    const v = getPreferenceString(PreferenceKeys.PAUSE_MINUTES);
    if (v) {
      const n = parseInt(v, 10);
      if (n >= 1 && n <= 30) return n;
    }
  } catch {}
  return DEFAULT_PAUSE_MINUTES;
}

export default function FocusModeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params ?? {}) as FocusModeParams;
  const taskFromParams = params.task;
  const { tasks } = useTasks();
  const fullTaskFromContext = useMemo(
    () =>
      taskFromParams?.id ? tasks.find((t) => t.id === taskFromParams.id) : null,
    [tasks, taskFromParams?.id],
  );
  const task = useMemo(() => {
    const base = fullTaskFromContext ?? taskFromParams;
    if (!base) return null;
    const fromContext = fullTaskFromContext?.subtasks;
    const fromParams = taskFromParams?.subtasks;
    const subtasks =
      (fromContext?.length ? fromContext : fromParams) ?? [];
    return { ...base, subtasks };
  }, [fullTaskFromContext, taskFromParams]);

  const [savedFocusMinutes, setSavedFocusMinutes] =
    useState(getSavedFocusMinutes);
  const [savedPauseMinutes, setSavedPauseMinutes] =
    useState(getSavedPauseMinutes);

  const pomodoroConfig = useMemo((): PomodoroConfig => {
    const focusMinutes = Math.max(
      1,
      params.focusMinutes ?? savedFocusMinutes ?? DEFAULT_FOCUS_MINUTES,
    );
    const pauseMinutes = Math.max(
      1,
      params.pauseMinutes ?? savedPauseMinutes ?? DEFAULT_PAUSE_MINUTES,
    );
    const longPauseMinutes = Math.max(
      1,
      params.longPauseMinutes ?? DEFAULT_LONG_PAUSE_MINUTES,
    );
    const taskMinutes = parseTaskTimeToMinutes(task?.time ?? undefined);
    const cyclesTotal = getCyclesTotalFromTask(taskMinutes, focusMinutes);
    return {
      focusMinutes,
      pauseMinutes,
      longPauseMinutes,
      cyclesTotal,
    };
  }, [
    params.focusMinutes,
    params.pauseMinutes,
    params.longPauseMinutes,
    task?.time,
    savedFocusMinutes,
    savedPauseMinutes,
  ]);

  const initialWorkSeconds = useMemo(
    () =>
      getWorkCycleSeconds(
        1,
        pomodoroConfig.cyclesTotal,
        pomodoroConfig.focusMinutes,
        parseTaskTimeToMinutes(task?.time ?? undefined),
      ),
    [pomodoroConfig.cyclesTotal, pomodoroConfig.focusMinutes, task?.time],
  );

  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const { fs } = useFontScale();

  const [phase, setPhase] = useState<Phase>("work");
  const [workCycle, setWorkCycle] = useState(1);
  const [remainingSeconds, setRemainingSeconds] = useState(initialWorkSeconds);
  const [totalPhaseSeconds, setTotalPhaseSeconds] =
    useState(initialWorkSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress =
    totalPhaseSeconds > 0 ? remainingSeconds / totalPhaseSeconds : 0;
  const elapsedRatio = 1 - progress;
  const isZero = remainingSeconds <= 0;
  const circumference = 2 * Math.PI * RING_RADIUS;
  const themeAccent = useThemeAccent();
  const trackColor = isDark ? "rgba(255,255,255,0.15)" : themeAccent.accent;
  const progressArcColor = themeAccent.buttonBg;

  const taskTotalMinutes = parseTaskTimeToMinutes(task?.time ?? undefined);

  const startNextPhase = useCallback(() => {
    if (phase === "work") {
      if (workCycle >= pomodoroConfig.cyclesTotal) {
        setPhase("longBreak");
        const longSec = pomodoroConfig.longPauseMinutes * 60;
        setRemainingSeconds(longSec);
        setTotalPhaseSeconds(longSec);
      } else {
        setPhase("shortBreak");
        const shortSec = pomodoroConfig.pauseMinutes * 60;
        setRemainingSeconds(shortSec);
        setTotalPhaseSeconds(shortSec);
      }
    } else {
      const nextCycle = phase === "longBreak" ? 1 : workCycle + 1;
      const nextWorkSec = getWorkCycleSeconds(
        nextCycle,
        pomodoroConfig.cyclesTotal,
        pomodoroConfig.focusMinutes,
        taskTotalMinutes,
      );
      setPhase("work");
      setWorkCycle(nextCycle);
      setRemainingSeconds(nextWorkSec);
      setTotalPhaseSeconds(nextWorkSec);
    }
    setIsRunning(true);
  }, [
    phase,
    workCycle,
    pomodoroConfig.cyclesTotal,
    pomodoroConfig.focusMinutes,
    pomodoroConfig.pauseMinutes,
    pomodoroConfig.longPauseMinutes,
    taskTotalMinutes,
  ]);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const togglePausePlay = () => {
    if (isZero) {
      startNextPhase();
    } else {
      setIsRunning((r) => !r);
    }
  };

  const addFiveMinutes = () => {
    const extra = 5 * 60;
    setRemainingSeconds((prev) => Math.min(prev + extra, 99 * 60 + 59));
    setTotalPhaseSeconds((prev) => prev + extra);
  };

  const timeRemaining = {
    min: Math.floor(remainingSeconds / 60),
    sec: remainingSeconds % 60,
  };
  const nextPhaseLabel =
    phase === "work"
      ? workCycle >= pomodoroConfig.cyclesTotal
        ? "Pausa longa"
        : "Pausa curta"
      : "Trabalho";
  const cycleLabel = `Ciclo ${workCycle}/${pomodoroConfig.cyclesTotal}`;

  const initialSubtasks = useMemo(() => {
    if (task?.subtasks?.length) {
      return task.subtasks.map((st) => ({
        id: st.id,
        text: st.text,
        completed: "completed" in st ? (st.completed ?? false) : false,
      }));
    }
    return [];
  }, [task?.subtasks]);

  const [subtasks, setSubtasks] = useState(initialSubtasks);
  const taskTitle = task?.title ?? "Tarefa";

  useEffect(() => {
    if (task?.subtasks?.length) {
      setSubtasks(
        task.subtasks.map((st) => ({
          id: st.id,
          text: st.text,
          completed: "completed" in st ? (st.completed ?? false) : false,
        })),
      );
    } else {
      setSubtasks([]);
    }
  }, [task?.id, task?.subtasks]);

  const headerGradientColors = isDark
    ? themeAccent.gradientDark
    : themeAccent.gradient;

  const contentBg = isDark ? Colors.dark.background : "#fff";
  const contentBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const cardBg = isDark ? "#1e1e24" : "#fafafa";
  const ringColor = themeAccent.buttonBg;

  const toggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)),
    );
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: contentBg }]}>
      <LinearGradient
        colors={headerGradientColors}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { fontSize: fs(18) }]}>
              Modo Foco
            </Text>
            <View style={styles.backButton} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View
        style={[
          styles.contentBox,
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
          <View style={styles.card}>
            <Text
              style={[styles.taskTitle, { color: textColor, fontSize: fs(20) }]}
            >
              {taskTitle}
            </Text>
            {task?.time != null && task.time !== "" && (
              <Text
                style={[
                  styles.taskMeta,
                  { color: iconColor, fontSize: fs(14) },
                ]}
              >
                Tempo estimado: {task.time}
              </Text>
            )}

            <View style={styles.timerRingWrapper}>
              <Svg width={RING_SIZE} height={RING_SIZE} style={styles.timerSvg}>
                <SvgCircle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  stroke={trackColor}
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                />
                <SvgCircle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  stroke={progressArcColor}
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                  strokeDasharray={`${circumference * elapsedRatio} ${circumference * (1 - elapsedRatio)}`}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                />
              </Svg>
              <View style={[styles.timerRing, styles.timerInnerAbsolute]}>
                <View style={styles.timerInner}>
                  <Text
                    style={[
                      styles.timerText,
                      { color: textColor, fontSize: fs(42) },
                    ]}
                  >
                    {String(timeRemaining.min).padStart(2, "0")}:
                    {String(timeRemaining.sec).padStart(2, "0")}
                  </Text>
                  <Text
                    style={[
                      styles.timerStatus,
                      { color: iconColor, fontSize: fs(14) },
                    ]}
                  >
                    {getPhaseLabel(phase)}
                  </Text>
                </View>
              </View>
            </View>

            <Text
              style={[styles.nextPhase, { color: iconColor, fontSize: fs(14) }]}
            >
              Próximo: {nextPhaseLabel} · {cycleLabel}
            </Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.addMinutesBtn}
                onPress={addFiveMinutes}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.addMinutesText,
                    {
                      color: textColor,
                      textDecorationLine: "underline",
                      fontSize: fs(15),
                    },
                  ]}
                >
                  + 5 minutos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={togglePausePlay}
                style={[
                  styles.pauseButton,
                  { backgroundColor: isDark ? "#374151" : "#111827" },
                ]}
                activeOpacity={0.8}
              >
                {isRunning ? (
                  <Pause size={24} color="#fff" fill="#fff" />
                ) : (
                  <Play size={24} color="#fff" fill="#fff" />
                )}
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.sectionTitle,
                { color: textColor, fontSize: fs(16) },
              ]}
            >
              Sub-tarefas
            </Text>
            {subtasks.map((st) => (
              <TouchableOpacity
                key={st.id}
                style={[
                  styles.subtaskItem,
                  {
                    backgroundColor: cardBg,
                    borderColor: isDark ? "#333" : "#e5e7eb",
                  },
                ]}
                onPress={() => toggleSubtask(st.id)}
                activeOpacity={0.7}
              >
                {st.completed ? (
                  <View
                    style={[
                      styles.checkboxChecked,
                      { backgroundColor: ringColor },
                    ]}
                  >
                    <Check size={14} color="#fff" strokeWidth={3} />
                  </View>
                ) : (
                  <Circle size={22} color={iconColor} strokeWidth={2} />
                )}
                <Text
                  style={[
                    styles.subtaskItemText,
                    { color: textColor, fontSize: fs(16) },
                    st.completed && styles.subtaskItemTextCompleted,
                  ]}
                >
                  {st.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  gradientHeader: { paddingBottom: 28 },
  headerSafe: { paddingHorizontal: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  contentBox: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 20,
    paddingHorizontal: 20,
    overflow: "hidden",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  card: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  taskMeta: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  timerRingWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignSelf: "center",
    marginBottom: 16,
  },
  timerSvg: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  timerRing: {
    width: 200,
    height: 200,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  timerInnerAbsolute: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  timerInner: {
    alignItems: "center",
  },
  timerText: {
    fontSize: 42,
    fontWeight: "700",
  },
  timerStatus: {
    fontSize: 14,
    marginTop: 4,
  },
  nextPhase: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  addMinutesBtn: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  addMinutesText: {
    fontSize: 15,
    fontWeight: "600",
  },
  pauseButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  subtaskItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  checkboxChecked: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  subtaskItemText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  subtaskItemTextCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.7,
  },
});
