import { useFontScale } from "@/context/font-scale-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Check, Circle, Focus } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const EFFORT_LABELS: Record<string, string> = {
  Baixa: "Leve",
  Média: "Normal",
  Alta: "Exigente",
};

const PRIORITY_LABELS: Record<string, string> = {
  baixa: "Baixa",
  normal: "Normal",
  alta: "Alta",
};

const ListItem = ({
  title,
  onPress,
  onFocusPress,
  completed,
  complexity,
  priority,
  time,
  category,
  tags,
  detailedMode = false,
  showFocusIcon = false,
}: {
  title: string;
  onPress?: () => void;
  onFocusPress?: () => void;
  completed: boolean;
  complexity: string;
  priority?: "baixa" | "normal" | "alta";
  time?: string;
  category?: string[];
  tags?: string[];
  detailedMode?: boolean;
  showFocusIcon?: boolean;
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const { fs } = useFontScale();

  const priorityLabel = PRIORITY_LABELS[priority ?? "normal"] ?? "Normal";

  const cardBg = isDark ? "#1e1e24" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB";
  const tagBg = isDark ? "#312e81" : "#E0E7FF";
  const tagText = isDark ? "#C7D2FE" : "#3730A3";
  const categoryBadgeBg = isDark ? "#2d2d2d" : "#F3F4F6";
  const categoryBadgeText = isDark ? "#9BA1A6" : "#6B7280";
  const titleCompletedColor = isDark ? "#9BA1A6" : "#6B7280";
  const checkBg = "#3B82F6";
  const checkIconColor = isDark ? "#fff" : "#111827";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: cardBg, borderColor: cardBorder },
      ]}
      activeOpacity={0.7}
    >
      {detailedMode && tags != null && tags.length > 0 && (
        <View style={styles.tagsRow}>
          {tags.map((tag, index) => (
            <View
              key={index}
              style={[styles.tagBadge, { backgroundColor: tagBg }]}
            >
              <Text
                style={[
                  styles.tagBadgeText,
                  { color: tagText, fontSize: fs(12) },
                ]}
              >
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}
      {category != null && category.length > 0 && (
        <View style={styles.categoryRow}>
          {category.map((cat, index) => (
            <View
              key={index}
              style={[
                styles.categoryBadge,
                { backgroundColor: categoryBadgeBg },
              ]}
            >
              <Text
                style={[
                  styles.categoryBadgeText,
                  { color: categoryBadgeText, fontSize: fs(12) },
                ]}
              >
                {cat}
              </Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.titleRow}>
        {!completed && <Circle size={22} color={iconColor} strokeWidth={2} />}
        {completed && (
          <View style={[styles.checkboxChecked, { backgroundColor: checkBg }]}>
            <Check size={14} color={checkIconColor} strokeWidth={3} />
          </View>
        )}
        <Text
          style={[
            styles.title,
            { color: textColor, fontSize: fs(16) },
            completed && [
              styles.titleCompleted,
              { color: titleCompletedColor },
            ],
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {showFocusIcon && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onFocusPress?.();
            }}
            style={styles.focusIconTouch}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Focus size={20} color={iconColor} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.metaRow}>
        {detailedMode ? (
          <View style={styles.metaLeft}>
            <Text
              style={[styles.metaText, { color: iconColor, fontSize: fs(14) }]}
            >
              {priorityLabel}
            </Text>
          </View>
        ) : (
          <View style={styles.metaLeft} />
        )}
        <View style={styles.metaRight}>
          {detailedMode && time != null && time !== "" && (
            <Text
              style={[styles.metaText, { color: iconColor, fontSize: fs(14) }]}
            >
              {time}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = {
  container: {
    flexDirection: "column" as const,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 6,
    marginBottom: 8,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagBadgeText: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  categoryRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 6,
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  titleRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 6,
  },
  checkboxChecked: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  title: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "500" as const,
    flex: 1,
  },
  titleCompleted: {
    textDecorationLine: "line-through" as const,
    opacity: 0.7,
  },
  metaRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  metaLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  metaText: {
    fontSize: 14,
  },
  metaRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  focusIconTouch: {
    padding: 4,
  },
};

export default ListItem;
