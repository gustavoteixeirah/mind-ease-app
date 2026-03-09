import { useAuth } from "@/context/auth-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STORAGE_KEYS = {
	FONT_SIZE: "@mindease_font_size",
	SUMMARY_MODE: "@mindease_summary_mode",
	HIGH_CONTRAST: "@mindease_high_contrast",
	CONDITIONS: "@mindease_conditions",
};

type FontSize = "small" | "medium" | "large";

const CONDITIONS_LIST = [
	"TDAH",
	"TEA (Autismo)",
	"Dislexia",
	"Burnout / Sobrecarga mental",
	"Dificuldade de foco e retencao",
	"Ansiedade em ambientes digitais",
	"Sobrecarga sensorial",
];

export default function ProfileScreen() {
	const { user, signOut, updateProfile } = useAuth();
	const router = useRouter();

	// User data
	const [displayName, setDisplayName] = useState(user?.displayName ?? "");
	const [isSaving, setIsSaving] = useState(false);

	// Conditions
	const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

	// Accessibility preferences
	const [fontSize, setFontSize] = useState<FontSize>("medium");
	const [summaryMode, setSummaryMode] = useState(false);
	const [highContrast, setHighContrast] = useState(false);

	// Load saved preferences on mount
	useEffect(() => {
		async function loadPreferences() {
			try {
				const [savedFont, savedSummary, savedContrast, savedConditions] =
					await Promise.all([
						AsyncStorage.getItem(STORAGE_KEYS.FONT_SIZE),
						AsyncStorage.getItem(STORAGE_KEYS.SUMMARY_MODE),
						AsyncStorage.getItem(STORAGE_KEYS.HIGH_CONTRAST),
						AsyncStorage.getItem(STORAGE_KEYS.CONDITIONS),
					]);

				if (savedFont) setFontSize(savedFont as FontSize);
				if (savedSummary) setSummaryMode(savedSummary === "true");
				if (savedContrast) setHighContrast(savedContrast === "true");
				if (savedConditions) setSelectedConditions(JSON.parse(savedConditions));
			} catch (e) {
				console.warn("Failed to load preferences:", e);
			}
		}
		loadPreferences();
	}, []);

	// Persist helpers
	const saveFontSize = useCallback(async (value: FontSize) => {
		setFontSize(value);
		await AsyncStorage.setItem(STORAGE_KEYS.FONT_SIZE, value);
	}, []);

	const saveSummaryMode = useCallback(async (value: boolean) => {
		setSummaryMode(value);
		await AsyncStorage.setItem(STORAGE_KEYS.SUMMARY_MODE, String(value));
	}, []);

	const saveHighContrast = useCallback(async (value: boolean) => {
		setHighContrast(value);
		await AsyncStorage.setItem(STORAGE_KEYS.HIGH_CONTRAST, String(value));
	}, []);

	const toggleCondition = useCallback(
		async (condition: string) => {
			const updated = selectedConditions.includes(condition)
				? selectedConditions.filter((c) => c !== condition)
				: [...selectedConditions, condition];
			setSelectedConditions(updated);
			await AsyncStorage.setItem(
				STORAGE_KEYS.CONDITIONS,
				JSON.stringify(updated),
			);
		},
		[selectedConditions],
	);

	// Save display name
	const handleSaveName = async () => {
		if (!displayName.trim()) return;
		setIsSaving(true);
		const result = await updateProfile(displayName.trim());
		setIsSaving(false);
		if (result.success) {
			Alert.alert("Sucesso", "Nome atualizado com sucesso!");
		} else {
			Alert.alert("Erro", result.error ?? "Nao foi possivel salvar.");
		}
	};

	// Logout
	const handleSignOut = () => {
		signOut();
		router.replace("/(auth)/login");
	};

	// Dynamic styles based on preferences
	const bg = highContrast ? "#000" : "#F9FAFB";
	const textColor = highContrast ? "#FFF" : "#000";
	const secondaryText = highContrast ? "#CCC" : "#6B7280";
	const cardBg = highContrast ? "#1A1A1A" : "#FFF";
	const inputBg = highContrast ? "#333" : "#FAFAFA";
	const borderColor = highContrast ? "#555" : "#E5E7EB";

	const fontSizeValue = fontSize === "small" ? 14 : fontSize === "large" ? 20 : 16;
	const titleFontSize = fontSize === "small" ? 16 : fontSize === "large" ? 22 : 18;

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
			{/* Header */}
			<View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
				<TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
					<Text style={[styles.backButton, { color: textColor }]}>← Voltar</Text>
				</TouchableOpacity>
				<Text style={[styles.headerTitle, { color: textColor }]}>Meu Perfil</Text>
				<View style={{ width: 60 }} />
			</View>

			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Section: Meus dados */}
				<Text style={[styles.sectionTitle, { color: textColor, fontSize: titleFontSize }]}>
					Meus dados
				</Text>
				<View style={[styles.card, { backgroundColor: cardBg }]}>
					<Text style={[styles.label, { color: secondaryText, fontSize: fontSizeValue }]}>
						Email
					</Text>
					<Text style={[styles.value, { color: textColor, fontSize: fontSizeValue }]}>
						{user?.primaryEmail ?? "—"}
					</Text>

					<Text style={[styles.label, { color: secondaryText, fontSize: fontSizeValue, marginTop: 16 }]}>
						Nome de exibicao
					</Text>
					<TextInput
						style={[
							styles.input,
							{
								backgroundColor: inputBg,
								color: textColor,
								borderColor,
								fontSize: fontSizeValue,
							},
						]}
						value={displayName}
						onChangeText={setDisplayName}
						placeholder="Seu nome"
						placeholderTextColor={secondaryText}
					/>
					<TouchableOpacity
						style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
						onPress={handleSaveName}
						disabled={isSaving}
						activeOpacity={0.7}
					>
						{isSaving ? (
							<ActivityIndicator color="#FFF" size="small" />
						) : (
							<Text style={[styles.saveButtonText, { fontSize: fontSizeValue }]}>Salvar</Text>
						)}
					</TouchableOpacity>
				</View>

				{/* Section: Minhas necessidades */}
				<Text style={[styles.sectionTitle, { color: textColor, fontSize: titleFontSize }]}>
					Minhas necessidades
				</Text>
				<View style={[styles.card, { backgroundColor: cardBg }]}>
					<Text style={[styles.cardDescription, { color: secondaryText, fontSize: fontSizeValue }]}>
						Selecione as condicoes que se aplicam a voce:
					</Text>
					<View style={styles.chipsContainer}>
						{CONDITIONS_LIST.map((condition) => {
							const selected = selectedConditions.includes(condition);
							return (
								<TouchableOpacity
									key={condition}
									style={[
										styles.chip,
										{
											backgroundColor: selected
												? highContrast ? "#4A90D9" : "#DBEAFE"
												: highContrast ? "#333" : "#F3F4F6",
											borderColor: selected
												? highContrast ? "#4A90D9" : "#93C5FD"
												: borderColor,
										},
									]}
									onPress={() => toggleCondition(condition)}
									activeOpacity={0.7}
								>
									<Text
										style={[
											styles.chipText,
											{
												color: selected
													? highContrast ? "#FFF" : "#1E40AF"
													: textColor,
												fontSize: fontSizeValue,
											},
										]}
									>
										{selected ? "✓ " : ""}
										{condition}
									</Text>
								</TouchableOpacity>
							);
						})}
					</View>
				</View>

				{/* Section: Acessibilidade */}
				<Text style={[styles.sectionTitle, { color: textColor, fontSize: titleFontSize }]}>
					Acessibilidade
				</Text>
				<View style={[styles.card, { backgroundColor: cardBg }]}>
					{/* Font size */}
					<Text style={[styles.label, { color: secondaryText, fontSize: fontSizeValue }]}>
						Tamanho da fonte
					</Text>
					<View style={styles.fontSizeRow}>
						{(["small", "medium", "large"] as FontSize[]).map((size) => (
							<TouchableOpacity
								key={size}
								style={[
									styles.fontSizeOption,
									{
										backgroundColor:
											fontSize === size
												? highContrast ? "#4A90D9" : "#000"
												: highContrast ? "#333" : "#F3F4F6",
										borderColor:
											fontSize === size
												? highContrast ? "#4A90D9" : "#000"
												: borderColor,
									},
								]}
								onPress={() => saveFontSize(size)}
								activeOpacity={0.7}
							>
								<Text
									style={{
										color: fontSize === size ? "#FFF" : textColor,
										fontWeight: fontSize === size ? "700" : "400",
										fontSize: size === "small" ? 13 : size === "large" ? 17 : 15,
									}}
								>
									{size === "small" ? "Pequeno" : size === "medium" ? "Medio" : "Grande"}
								</Text>
							</TouchableOpacity>
						))}
					</View>

					{/* Summary mode */}
					<View style={styles.toggleRow}>
						<Text style={[styles.toggleLabel, { color: textColor, fontSize: fontSizeValue }]}>
							Modo resumo
						</Text>
						<TouchableOpacity
							style={[
								styles.toggle,
								{
									backgroundColor: summaryMode
										? highContrast ? "#4A90D9" : "#000"
										: highContrast ? "#555" : "#D1D5DB",
								},
							]}
							onPress={() => saveSummaryMode(!summaryMode)}
							activeOpacity={0.7}
						>
							<View
								style={[
									styles.toggleKnob,
									summaryMode && styles.toggleKnobActive,
								]}
							/>
						</TouchableOpacity>
					</View>

					{/* High contrast */}
					<View style={styles.toggleRow}>
						<Text style={[styles.toggleLabel, { color: textColor, fontSize: fontSizeValue }]}>
							Contraste alto
						</Text>
						<TouchableOpacity
							style={[
								styles.toggle,
								{
									backgroundColor: highContrast
										? "#4A90D9"
										: "#D1D5DB",
								},
							]}
							onPress={() => saveHighContrast(!highContrast)}
							activeOpacity={0.7}
						>
							<View
								style={[
									styles.toggleKnob,
									highContrast && styles.toggleKnobActive,
								]}
							/>
						</TouchableOpacity>
					</View>
				</View>

				{/* Logout */}
				<TouchableOpacity
					style={styles.logoutButton}
					onPress={handleSignOut}
					activeOpacity={0.7}
				>
					<Text style={[styles.logoutText, { fontSize: fontSizeValue }]}>Sair da conta</Text>
				</TouchableOpacity>

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
	backButton: {
		fontSize: 16,
		fontWeight: "600",
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "700",
	},
	scroll: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 24,
		paddingTop: 24,
	},
	sectionTitle: {
		fontWeight: "700",
		marginBottom: 12,
		marginTop: 8,
	},
	card: {
		borderRadius: 16,
		padding: 20,
		marginBottom: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	label: {
		fontWeight: "500",
		marginBottom: 6,
	},
	value: {
		fontWeight: "600",
	},
	cardDescription: {
		marginBottom: 16,
		lineHeight: 22,
	},
	input: {
		borderWidth: 1,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
		marginBottom: 12,
	},
	saveButton: {
		backgroundColor: "#000",
		borderRadius: 12,
		paddingVertical: 14,
		alignItems: "center",
	},
	saveButtonDisabled: {
		opacity: 0.6,
	},
	saveButtonText: {
		color: "#FFF",
		fontWeight: "700",
	},
	chipsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
	},
	chip: {
		borderWidth: 1,
		borderRadius: 20,
		paddingHorizontal: 14,
		paddingVertical: 8,
	},
	chipText: {
		fontWeight: "500",
	},
	fontSizeRow: {
		flexDirection: "row",
		gap: 10,
		marginBottom: 20,
		marginTop: 4,
	},
	fontSizeOption: {
		flex: 1,
		borderWidth: 1,
		borderRadius: 12,
		paddingVertical: 10,
		alignItems: "center",
	},
	toggleRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	toggleLabel: {
		fontWeight: "500",
	},
	toggle: {
		width: 52,
		height: 30,
		borderRadius: 15,
		justifyContent: "center",
		paddingHorizontal: 3,
	},
	toggleKnob: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: "#FFF",
	},
	toggleKnobActive: {
		alignSelf: "flex-end",
	},
	logoutButton: {
		borderRadius: 12,
		paddingVertical: 14,
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#DC2626",
		marginTop: 8,
	},
	logoutText: {
		color: "#DC2626",
		fontWeight: "700",
	},
});
