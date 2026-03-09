import { useAuth } from "@/context/auth-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Storage keys (same as profile) ---
const STORAGE_KEYS = {
	FONT_SIZE: "@mindease_font_size",
	SUMMARY_MODE: "@mindease_summary_mode",
	HIGH_CONTRAST: "@mindease_high_contrast",
};

type FontSize = "small" | "medium" | "large";

// --- Mock tasks ---
type Priority = "high" | "medium" | "low";
type Column = "now" | "later" | "whenever";

interface MockTask {
	id: string;
	title: string;
	description: string;
	priority: Priority;
	column: Column;
}

const MOCK_TASKS: MockTask[] = [
	{
		id: "1",
		title: "Revisar anotacoes de aula",
		description: "Capitulo 3 e 4 de Engenharia de Software",
		priority: "high",
		column: "now",
	},
	{
		id: "2",
		title: "Entregar atividade de banco de dados",
		description: "Modelagem ER do projeto final",
		priority: "high",
		column: "now",
	},
	{
		id: "3",
		title: "Ler artigo sobre acessibilidade",
		description: "WCAG 2.1 e design inclusivo",
		priority: "medium",
		column: "later",
	},
	{
		id: "4",
		title: "Organizar pasta de estudos",
		description: "Separar por materia e semestre",
		priority: "low",
		column: "later",
	},
	{
		id: "5",
		title: "Assistir palestra gravada",
		description: "Semana de tecnologia FIAP",
		priority: "low",
		column: "whenever",
	},
];

const PRIORITY_COLORS: Record<Priority, string> = {
	high: "#EF4444",
	medium: "#F59E0B",
	low: "#22C55E",
};

const COLUMN_LABELS: Record<Column, string> = {
	now: "Agora",
	later: "Depois",
	whenever: "Quando der",
};

function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) return "Bom dia";
	if (hour < 18) return "Boa tarde";
	return "Boa noite";
}

export default function DashboardScreen() {
	const { user } = useAuth();
	const router = useRouter();

	// Accessibility preferences (loaded from AsyncStorage)
	const [fontSize, setFontSize] = useState<FontSize>("medium");
	const [summaryMode, setSummaryMode] = useState(false);
	const [highContrast, setHighContrast] = useState(false);

	// Load preferences on mount and on focus
	const loadPreferences = useCallback(async () => {
		try {
			const [savedFont, savedSummary, savedContrast] = await Promise.all([
				AsyncStorage.getItem(STORAGE_KEYS.FONT_SIZE),
				AsyncStorage.getItem(STORAGE_KEYS.SUMMARY_MODE),
				AsyncStorage.getItem(STORAGE_KEYS.HIGH_CONTRAST),
			]);
			if (savedFont) setFontSize(savedFont as FontSize);
			if (savedSummary !== null) setSummaryMode(savedSummary === "true");
			if (savedContrast !== null) setHighContrast(savedContrast === "true");
		} catch (e) {
			console.warn("Failed to load preferences:", e);
		}
	}, []);

	useEffect(() => {
		loadPreferences();
	}, [loadPreferences]);

	// Quick-settings handlers (local + persist)
	const cycleFontSize = async () => {
		const next: FontSize =
			fontSize === "small" ? "medium" : fontSize === "medium" ? "large" : "small";
		setFontSize(next);
		await AsyncStorage.setItem(STORAGE_KEYS.FONT_SIZE, next);
	};

	const toggleSummary = async () => {
		const next = !summaryMode;
		setSummaryMode(next);
		await AsyncStorage.setItem(STORAGE_KEYS.SUMMARY_MODE, String(next));
	};

	const toggleContrast = async () => {
		const next = !highContrast;
		setHighContrast(next);
		await AsyncStorage.setItem(STORAGE_KEYS.HIGH_CONTRAST, String(next));
	};

	// Dynamic theming
	const bg = highContrast ? "#000" : "#F9FAFB";
	const textColor = highContrast ? "#FFF" : "#000";
	const secondaryText = highContrast ? "#CCC" : "#6B7280";
	const cardBg = highContrast ? "#1A1A1A" : "#FFF";
	const borderColor = highContrast ? "#555" : "#E5E7EB";
	const accentBg = highContrast ? "#4A90D9" : "#000";

	const fontSizeValue = fontSize === "small" ? 14 : fontSize === "large" ? 20 : 16;
	const titleFontSize = fontSize === "small" ? 18 : fontSize === "large" ? 28 : 24;
	const sectionFontSize = fontSize === "small" ? 15 : fontSize === "large" ? 20 : 17;

	const fontLabel = fontSize === "small" ? "Pequeno" : fontSize === "large" ? "Grande" : "Medio";

	const displayName = user?.displayName || user?.primaryEmail || "usuario";

	const tasksByColumn = (col: Column) => MOCK_TASKS.filter((t) => t.column === col);

	const renderTaskCard = (task: MockTask) => (
		<TouchableOpacity
			key={task.id}
			style={[styles.taskCard, { backgroundColor: cardBg }]}
			onPress={() =>
				Alert.alert(
					task.title,
					`${task.description}\n\nPrioridade: ${task.priority === "high" ? "Alta" : task.priority === "medium" ? "Media" : "Baixa"}`,
				)
			}
			activeOpacity={0.7}
		>
			<View style={styles.taskCardHeader}>
				<View
					style={[
						styles.priorityDot,
						{ backgroundColor: PRIORITY_COLORS[task.priority] },
					]}
				/>
				<Text
					style={[styles.taskTitle, { color: textColor, fontSize: fontSizeValue }]}
					numberOfLines={2}
				>
					{task.title}
				</Text>
			</View>
			{!summaryMode && (
				<Text
					style={[styles.taskDescription, { color: secondaryText, fontSize: fontSizeValue - 2 }]}
					numberOfLines={2}
				>
					{task.description}
				</Text>
			)}
		</TouchableOpacity>
	);

	const renderColumn = (col: Column) => {
		const tasks = tasksByColumn(col);
		return (
			<View key={col} style={styles.column}>
				<Text style={[styles.columnTitle, { color: textColor, fontSize: fontSizeValue }]}>
					{COLUMN_LABELS[col]}
				</Text>
				{tasks.map(renderTaskCard)}
			</View>
		);
	};

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
			{/* Header */}
			<View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
				<Text style={[styles.headerTitle, { color: textColor }]}>MindEase</Text>
				<TouchableOpacity
					onPress={() => router.push("/(app)/profile")}
					activeOpacity={0.7}
					style={[styles.profileButton, { borderColor }]}
				>
					<Text style={[styles.profileButtonText, { color: textColor }]}>
						{displayName.charAt(0).toUpperCase()}
					</Text>
				</TouchableOpacity>
			</View>

			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Greeting */}
				<Text style={[styles.greeting, { color: textColor, fontSize: titleFontSize }]}>
					{getGreeting()}, {displayName}!
				</Text>

				{/* Focus mode button */}
				<TouchableOpacity
					style={[styles.focusButton, { backgroundColor: accentBg }]}
					onPress={() => Alert.alert("Modo Foco", "Em breve!")}
					activeOpacity={0.7}
				>
					<Text style={[styles.focusButtonText, { fontSize: fontSizeValue + 2 }]}>
						Modo Foco
					</Text>
				</TouchableOpacity>

				{/* Quick settings */}
				<Text style={[styles.sectionTitle, { color: textColor, fontSize: sectionFontSize }]}>
					Ajustes rapidos
				</Text>
				<View style={[styles.settingsRow, { backgroundColor: cardBg }]}>
					<TouchableOpacity
						style={[styles.settingChip, { borderColor }]}
						onPress={cycleFontSize}
						activeOpacity={0.7}
					>
						<Text style={[styles.settingChipLabel, { color: secondaryText, fontSize: fontSizeValue - 2 }]}>
							Fonte
						</Text>
						<Text style={[styles.settingChipValue, { color: textColor, fontSize: fontSizeValue }]}>
							{fontLabel}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[
							styles.settingChip,
							{
								borderColor: summaryMode ? accentBg : borderColor,
								backgroundColor: summaryMode
									? highContrast ? "#1A3A5C" : "#F0F0F0"
									: "transparent",
							},
						]}
						onPress={toggleSummary}
						activeOpacity={0.7}
					>
						<Text style={[styles.settingChipLabel, { color: secondaryText, fontSize: fontSizeValue - 2 }]}>
							Resumo
						</Text>
						<Text style={[styles.settingChipValue, { color: textColor, fontSize: fontSizeValue }]}>
							{summaryMode ? "Ligado" : "Desligado"}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[
							styles.settingChip,
							{
								borderColor: highContrast ? "#4A90D9" : borderColor,
								backgroundColor: highContrast ? "#1A3A5C" : "transparent",
							},
						]}
						onPress={toggleContrast}
						activeOpacity={0.7}
					>
						<Text style={[styles.settingChipLabel, { color: secondaryText, fontSize: fontSizeValue - 2 }]}>
							Contraste
						</Text>
						<Text style={[styles.settingChipValue, { color: textColor, fontSize: fontSizeValue }]}>
							{highContrast ? "Alto" : "Normal"}
						</Text>
					</TouchableOpacity>
				</View>

				{/* Tasks kanban */}
				<Text style={[styles.sectionTitle, { color: textColor, fontSize: sectionFontSize }]}>
					Minhas Tarefas
				</Text>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.kanbanContainer}
				>
					{(["now", "later", "whenever"] as Column[]).map(renderColumn)}
				</ScrollView>

				<View style={{ height: 40 }} />
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 24,
		paddingTop: 16,
		paddingBottom: 16,
		borderBottomWidth: 1,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "700",
	},
	profileButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		borderWidth: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	profileButtonText: {
		fontSize: 16,
		fontWeight: "700",
	},
	scroll: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 24,
		paddingTop: 24,
	},
	greeting: {
		fontWeight: "700",
		marginBottom: 20,
	},
	focusButton: {
		borderRadius: 16,
		paddingVertical: 18,
		alignItems: "center",
		marginBottom: 28,
	},
	focusButtonText: {
		color: "#FFF",
		fontWeight: "700",
	},
	sectionTitle: {
		fontWeight: "700",
		marginBottom: 12,
	},
	settingsRow: {
		flexDirection: "row",
		gap: 10,
		marginBottom: 28,
		borderRadius: 16,
		padding: 12,
	},
	settingChip: {
		flex: 1,
		borderWidth: 1,
		borderRadius: 12,
		paddingVertical: 10,
		paddingHorizontal: 8,
		alignItems: "center",
	},
	settingChipLabel: {
		fontWeight: "500",
		marginBottom: 2,
	},
	settingChipValue: {
		fontWeight: "700",
	},
	kanbanContainer: {
		gap: 12,
		paddingBottom: 8,
	},
	column: {
		width: 200,
	},
	columnTitle: {
		fontWeight: "700",
		marginBottom: 10,
		textAlign: "center",
	},
	taskCard: {
		borderRadius: 12,
		padding: 14,
		marginBottom: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 3,
		elevation: 2,
	},
	taskCardHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	priorityDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	taskTitle: {
		fontWeight: "600",
		flex: 1,
	},
	taskDescription: {
		marginTop: 6,
		lineHeight: 18,
	},
});
