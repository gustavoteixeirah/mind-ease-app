import { Colors } from "@/constants/theme";
import { useFontScale } from "@/context/font-scale-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WHEN_OPTIONS = [
  { id: "agora", label: "Agora" },
  { id: "hoje", label: "Hoje" },
  { id: "amanha", label: "Amanhã" },
  { id: "qualquer", label: "Qualquer dia" },
  { id: "escolher", label: "Escolher data" },
] as const;

const EFFORT_OPTIONS = [
  { id: "leve", label: "Leve" },
  { id: "normal", label: "Normal" },
  { id: "exigente", label: "Exigente" },
] as const;

const PRIORITY_OPTIONS = [
  { id: "baixa", label: "Baixa" },
  { id: "normal", label: "Normal" },
  { id: "alta", label: "Alta" },
] as const;

function getNextDays(count: number): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateLabel(d: Date): string {
  return d.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function parseEstimatedMinutes(value: string): number | null {
  const v = value.trim().toLowerCase().replace(/\s/g, "");
  if (!v) return null;
  const minMatch = v.match(/^(\d+)\s*(?:min|m|minutos?)?$/);
  if (minMatch) return parseInt(minMatch[1], 10);
  const hourMatch = v.match(/^(\d+)\s*(?:h|hr|hora)s?$/);
  if (hourMatch) return parseInt(hourMatch[1], 10) * 60;
  const num = parseInt(v, 10);
  if (!Number.isNaN(num)) return num;
  return null;
}

export default function AddEditTaskScreen() {
  const params = useLocalSearchParams<{ taskId?: string }>();
  const navigation = useNavigation();
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const strongTextColor = isDark ? "#ECEDEE" : "#11181C";

  const [title, setTitle] = useState("");
  const [when, setWhen] = useState<(typeof WHEN_OPTIONS)[number]["id"]>("hoje");
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [effort, setEffort] =
    useState<(typeof EFFORT_OPTIONS)[number]["id"]>("normal");
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [subtasks, setSubtasks] = useState<{ id: string; text: string }[]>([]);
  const [subtaskSectionVisible, setSubtaskSectionVisible] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [priority, setPriority] = useState<
    (typeof PRIORITY_OPTIONS)[number]["id"] | ""
  >("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTagText, setNewTagText] = useState("");
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const isEdit = Boolean(params?.taskId);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      (navigation.getParent() as { navigate: (name: string) => void } | undefined)
        ?.navigate("Tarefas");
    }
  };

  const addSubtaskFromTop = () => {
    const text = newSubtaskText.trim();
    if (!text) return;
    setSubtasks((prev) => [...prev, { id: String(Date.now()), text }]);
    setNewSubtaskText("");
  };

  const removeSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const addTag = () => {
    const t = newTagText.trim();
    if (!t || tags.includes(t)) return;
    setTags((prev) => [...prev, t]);
    setNewTagText("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((x) => x !== tag));
  };

  const estimatedMinutes = parseEstimatedMinutes(estimatedTime);
  const isExigente = effort === "exigente";
  const isAltaAgora = priority === "alta" && when === "agora";
  const isMenosDe30Min = estimatedMinutes !== null && estimatedMinutes < 30;
  const showFocusSuggestion =
    isExigente || isAltaAgora || isMenosDe30Min || (isExigente && isAltaAgora);

  const selectDate = (d: Date) => {
    setCustomDate(d);
    setWhen("escolher");
    setDatePickerVisible(false);
  };

  const headerGradientColors = isDark
    ? (["#1a1a2e", "#16213e", "#0f3460"] as const)
    : (["#667eea", "#764ba2", "#5a67d8"] as const);

  const contentBg = isDark ? Colors.dark.background : "#fff";
  const contentBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const { fs } = useFontScale();

  return (
    <View style={[styles.wrapper, { backgroundColor: contentBg }]}>
      <LinearGradient
        colors={headerGradientColors}
        style={styles.gradientHeader}
      >
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { fontSize: fs(18) }]}>
              {isEdit ? "Editar tarefa" : "Criar nova tarefa"}
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.sectionLabel, { color: textColor, fontSize: fs(14) }]}>
              Tarefa
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: textColor,
                  backgroundColor: isDark ? "#252530" : "#f5f5f5",
                  borderColor: isDark ? "#333" : "#e0e0e0",
                },
              ]}
              placeholder="O que precisa ser feito?"
              placeholderTextColor={iconColor}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={[styles.sectionLabel, { color: textColor, fontSize: fs(14) }]}>
              Para quando deve ser feito?
            </Text>
            <View style={styles.chipRow}>
              {WHEN_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => {
                    if (opt.id === "escolher") setDatePickerVisible(true);
                    else setWhen(opt.id);
                  }}
                  style={[
                    styles.chip,
                    when === opt.id && {
                      backgroundColor: isDark ? "#5a67d8" : "#667eea",
                    },
                    !(when === opt.id) && {
                      backgroundColor: isDark ? "#252530" : "#f0f0f0",
                    },
                  ]}
                >
                  {opt.id === "escolher" && (
                    <Calendar
                      size={14}
                      color={when === opt.id ? "#fff" : iconColor}
                      style={styles.chipIcon}
                    />
                  )}
                  <Text
                    style={[
                      styles.chipText,
                      { color: when === opt.id ? "#fff" : textColor },
                    ]}
                  >
                    {opt.id === "escolher"
                      ? customDate
                        ? formatDateLabel(customDate)
                        : opt.label
                      : opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: textColor, fontSize: fs(14) }]}>
              Esforço mental
            </Text>
            <View style={styles.chipRow}>
              {EFFORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setEffort(opt.id)}
                  style={[
                    styles.chip,
                    effort === opt.id && {
                      backgroundColor: isDark ? "#5a67d8" : "#667eea",
                    },
                    !(effort === opt.id) && {
                      backgroundColor: isDark ? "#252530" : "#f0f0f0",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: effort === opt.id ? "#fff" : textColor },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.subtaskTrigger}
              onPress={() => setSubtaskSectionVisible((v) => !v)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.subtaskTriggerContent,
                  { borderBottomColor: textColor },
                ]}
              >
                <Plus size={20} color={isDark ? "#9BA1A6" : "#667eea"} />
                <Text style={[styles.subtaskTriggerText, { color: textColor }]}>
                  Criar sub-tarefa
                </Text>
              </View>
            </TouchableOpacity>

            {subtaskSectionVisible && (
              <>
                <View
                  style={[
                    styles.subtaskBox,
                    {
                      borderColor: isDark ? "#333" : "#e0e0e0",
                      backgroundColor: isDark ? "#252530" : "#fafafa",
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.subtaskInput,
                      styles.subtaskInputFullWidth,
                      {
                        color: strongTextColor,
                        backgroundColor: "transparent",
                        fontWeight: "500",
                      },
                    ]}
                    placeholder="Nome da sub-tarefa"
                    placeholderTextColor={iconColor}
                    value={newSubtaskText}
                    onChangeText={setNewSubtaskText}
                    onSubmitEditing={addSubtaskFromTop}
                    returnKeyType="done"
                  />
                </View>
                {subtasks.map((st) => (
                  <View
                    key={st.id}
                    style={[
                      styles.subtaskBox,
                      {
                        borderColor: isDark ? "#333" : "#e0e0e0",
                        backgroundColor: isDark ? "#252530" : "#fafafa",
                      },
                    ]}
                  >
                    <View style={styles.subtaskRow}>
                      <Text
                        style={[
                          styles.subtaskCardText,
                          { color: strongTextColor },
                        ]}
                        numberOfLines={2}
                      >
                        {st.text}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeSubtask(st.id)}
                        style={styles.removeSubtask}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <X size={20} color={iconColor} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}

            <View
              style={[
                styles.detailsBox,
                {
                  borderColor: isDark ? "#333" : "#e0e0e0",
                  backgroundColor: isDark ? "#1c1c1e" : "#fafafa",
                },
              ]}
            >
              <TouchableOpacity
                style={styles.detailsHeader}
                onPress={() => setDetailsExpanded((e) => !e)}
                activeOpacity={0.7}
              >
                <Text style={[styles.detailsHeaderText, { color: iconColor }]}>
                  Mais detalhes
                </Text>
                {detailsExpanded ? (
                  <ChevronUp size={20} color={iconColor} />
                ) : (
                  <ChevronDown size={20} color={iconColor} />
                )}
              </TouchableOpacity>

              {detailsExpanded && (
                <View style={styles.detailsContent}>
                  <Text style={[styles.sectionLabel, { color: textColor, fontSize: fs(14) }]}>
                    Prioridade
                  </Text>
                  <View style={styles.chipRow}>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt.id}
                        onPress={() => setPriority(opt.id)}
                        style={[
                          styles.chip,
                          priority === opt.id && {
                            backgroundColor: isDark ? "#5a67d8" : "#667eea",
                          },
                          !(priority === opt.id) && {
                            backgroundColor: isDark ? "#252530" : "#f0f0f0",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            { color: priority === opt.id ? "#fff" : textColor },
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={[styles.sectionLabel, { color: textColor, fontSize: fs(14) }]}>
                    Tempo estimado
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: textColor,
                        backgroundColor: isDark ? "#252530" : "#f5f5f5",
                        borderColor: isDark ? "#333" : "#e0e0e0",
                      },
                    ]}
                    placeholder="ex: 25min, 1h, 2h"
                    placeholderTextColor={iconColor}
                    value={estimatedTime}
                    onChangeText={setEstimatedTime}
                  />

                  <Text style={[styles.sectionLabel, { color: textColor, fontSize: fs(14) }]}>
                    Descrição
                  </Text>
                  <TextInput
                    style={[
                      styles.descriptionInput,
                      {
                        color: textColor,
                        backgroundColor: isDark ? "#252530" : "#f5f5f5",
                        borderColor: isDark ? "#333" : "#e0e0e0",
                      },
                    ]}
                    placeholder="Deixe mais contexto..."
                    placeholderTextColor={iconColor}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                  />

                  <Text style={[styles.sectionLabel, { color: textColor, fontSize: fs(14) }]}>
                    Tags
                  </Text>
                  <View
                    style={[
                      styles.tagInputBox,
                      {
                        borderColor: isDark ? "#333" : "#e0e0e0",
                        backgroundColor: isDark ? "#252530" : "#f5f5f5",
                      },
                    ]}
                  >
                    <TextInput
                      style={[
                        styles.tagInputInner,
                        {
                          color: textColor,
                        },
                      ]}
                      placeholder="Nome da tag"
                      placeholderTextColor={iconColor}
                      value={newTagText}
                      onChangeText={setNewTagText}
                      onSubmitEditing={addTag}
                      returnKeyType="done"
                    />
                    <View style={styles.tagRow}>
                      {tags.map((tag) => (
                        <View
                          key={tag}
                          style={[
                            styles.tagPill,
                            {
                              backgroundColor: isDark ? "#333" : "#e5e7eb",
                            },
                          ]}
                        >
                          <Text
                            style={[styles.tagPillText, { color: textColor }]}
                          >
                            {tag}
                          </Text>
                          <TouchableOpacity
                            onPress={() => removeTag(tag)}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          >
                            <X size={14} color={iconColor} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </View>

            {showFocusSuggestion && (
              <>
                <View style={styles.focusSuggestionRow}>
                  <View
                    style={[
                      styles.focusSuggestionIcon,
                      {
                        borderColor: isDark ? "#555" : "#d1d5db",
                        backgroundColor: isDark ? "#252530" : "#f0f0f0",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.focusSuggestionIconInner,
                        { backgroundColor: iconColor },
                      ]}
                    />
                  </View>
                  <Text
                    style={[styles.focusSuggestionText, { color: iconColor }]}
                  >
                    Essa tarefa combina com o modo foco.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.createTaskFocusButton,
                    {
                      backgroundColor: isDark ? "#252530" : "#fff",
                      borderColor: isDark ? "#444" : "#e0e0e0",
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.createTaskFocusButtonText,
                      { color: iconColor },
                    ]}
                  >
                    {isEdit ? "Salvar tarefa + Foco" : "Criar tarefa + Foco"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[
                styles.createTaskButton,
                {
                  backgroundColor: isDark ? "#1a1a1a" : "#111827",
                },
              ]}
              activeOpacity={0.8}
            >
              <Text style={styles.createTaskButtonText}>
                {isEdit ? "Salvar tarefa" : "Criar tarefa"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
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
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Escolher data
              </Text>
              <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                <X size={24} color={textColor} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dateList}>
              {getNextDays(14).map((d) => (
                <TouchableOpacity
                  key={d.getTime()}
                  style={[
                    styles.dateItem,
                    { backgroundColor: isDark ? "#252530" : "#f5f5f5" },
                  ]}
                  onPress={() => selectDate(d)}
                >
                  <Text style={[styles.dateItemText, { color: textColor }]}>
                    {formatDateLabel(d)} ({formatDateKey(d)})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
  keyboardView: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  detailsBox: {
    marginTop: 24,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    paddingHorizontal: 16,
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingRight: 4,
  },
  detailsHeaderText: {
    fontSize: 15,
    fontWeight: "500",
  },
  detailsContent: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  tagInputBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    minHeight: 48,
  },
  tagInputInner: {
    paddingVertical: 8,
    paddingHorizontal: 0,
    fontSize: 15,
    borderWidth: 0,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagPillText: {
    fontSize: 14,
    fontWeight: "500",
  },
  focusSuggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 32,
    gap: 10,
  },
  focusSuggestionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  focusSuggestionIconInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  focusSuggestionText: {
    fontSize: 15,
    flex: 1,
  },
  createTaskFocusButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  createTaskFocusButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  createTaskButton: {
    marginTop: 12,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  createTaskButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  chipIcon: { marginRight: 4 },
  chipText: { fontSize: 14, fontWeight: "500" },
  subtaskTrigger: {
    marginTop: 20,
    paddingVertical: 10,
    paddingRight: 8,
    alignSelf: "flex-start",
  },
  subtaskTriggerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 2,
    paddingBottom: 2,
  },
  subtaskTriggerText: {
    fontSize: 16,
    fontWeight: "600",
  },
  subtaskBox: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 8,
    overflow: "hidden",
  },
  subtaskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 4,
  },
  subtaskInput: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  subtaskCardText: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "500",
  },
  subtaskInputFullWidth: {
    width: "100%",
  },
  removeSubtask: { padding: 8 },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: "top",
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
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  dateList: { padding: 16 },
  dateItem: { padding: 14, borderRadius: 12, marginBottom: 8 },
  dateItemText: { fontSize: 15 },
});
