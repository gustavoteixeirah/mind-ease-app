import { useAuth } from "@/context/auth-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Tab = "login" | "signup";

export default function LoginScreen() {
	const [activeTab, setActiveTab] = useState<Tab>("login");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const { signIn, signUp } = useAuth();
	const router = useRouter();

	const switchTab = (tab: Tab) => {
		setActiveTab(tab);
		setError("");
		setEmail("");
		setPassword("");
		setDisplayName("");
		setShowPassword(false);
	};

	const handleSubmit = async () => {
		setError("");

		if (!email.trim()) {
			setError("Por favor, insira seu e-mail");
			return;
		}
		if (!password) {
			setError("Por favor, insira sua senha");
			return;
		}
		if (activeTab === "signup" && !displayName.trim()) {
			setError("Por favor, insira seu nome completo");
			return;
		}

		setLoading(true);
		try {
			const result =
				activeTab === "login"
					? await signIn(email.trim(), password)
					: await signUp(email.trim(), password, displayName.trim());

			if (result.success) {
				router.replace("/(app)/dashboard");
			} else {
				setError(result.error || "Ocorreu um erro. Tente novamente.");
			}
		} catch (e: unknown) {
			const msg =
				e instanceof Error ? e.message : "Ocorreu um erro inesperado.";
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.flex}
			>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					bounces={false}
					keyboardShouldPersistTaps="handled"
				>
					{/* Header with gradient */}
					<LinearGradient
						colors={["#D6EAF8", "#EBF5FB", "#FFFFFF"]}
						style={styles.header}
					>
						<Image
							source={require("@/assets/images/logo.png")}
							style={styles.logo}
							resizeMode="contain"
						/>
						<Text style={styles.tagline}>Menos pressão. Mais clareza.</Text>
					</LinearGradient>

					{/* White card area */}
					<View style={styles.card}>
						{/* Tab selector */}
						<View style={styles.tabContainer}>
							<TouchableOpacity
								style={[styles.tab, activeTab === "login" && styles.activeTab]}
								onPress={() => switchTab("login")}
								activeOpacity={0.7}
							>
								<Text
									style={[
										styles.tabText,
										activeTab === "login" && styles.activeTabText,
									]}
								>
									Login
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.tab, activeTab === "signup" && styles.activeTab]}
								onPress={() => switchTab("signup")}
								activeOpacity={0.7}
							>
								<Text
									style={[
										styles.tabText,
										activeTab === "signup" && styles.activeTabText,
									]}
								>
									Criar conta
								</Text>
							</TouchableOpacity>
						</View>

						{/* Title */}
						<Text style={styles.title}>
							{activeTab === "login"
								? "Bem-vindo(a) de volta."
								: "Comece sua jornada."}
						</Text>

						{/* Error message */}
						{error ? (
							<View style={styles.errorContainer}>
								<Text style={styles.errorText}>{error}</Text>
							</View>
						) : null}

						{/* Signup: Name field */}
						{activeTab === "signup" && (
							<View style={styles.fieldContainer}>
								<Text style={styles.label}>Nome completo</Text>
								<TextInput
									style={styles.input}
									placeholder="Jane Doe"
									placeholderTextColor="#A0A0A0"
									value={displayName}
									onChangeText={setDisplayName}
									autoCapitalize="words"
									editable={!loading}
								/>
							</View>
						)}

						{/* Email field */}
						<View style={styles.fieldContainer}>
							<Text style={styles.label}>E-mail</Text>
							<TextInput
								style={styles.input}
								placeholder="nome@email.com"
								placeholderTextColor="#A0A0A0"
								value={email}
								onChangeText={setEmail}
								keyboardType="email-address"
								autoCapitalize="none"
								autoComplete="email"
								editable={!loading}
							/>
						</View>

						{/* Password field */}
						<View style={styles.fieldContainer}>
							<Text style={styles.label}>Senha</Text>
							<View style={styles.passwordContainer}>
								<TextInput
									style={styles.passwordInput}
									placeholder="••••••••"
									placeholderTextColor="#A0A0A0"
									value={password}
									onChangeText={setPassword}
									secureTextEntry={!showPassword}
									autoCapitalize="none"
									editable={!loading}
								/>
								<Pressable
									onPress={() => setShowPassword(!showPassword)}
									style={styles.eyeButton}
									hitSlop={8}
								>
									<Ionicons
										name={showPassword ? "eye-off-outline" : "eye-outline"}
										size={22}
										color="#888"
									/>
								</Pressable>
							</View>
						</View>

						{/* Submit button */}
						<TouchableOpacity
							style={[
								styles.submitButton,
								loading && styles.submitButtonDisabled,
							]}
							onPress={handleSubmit}
							disabled={loading}
							activeOpacity={0.8}
						>
							{loading ? (
								<ActivityIndicator color="#fff" size="small" />
							) : (
								<Text style={styles.submitButtonText}>Entrar</Text>
							)}
						</TouchableOpacity>

						{/* Footer link */}
						<View style={styles.footer}>
							{activeTab === "login" ? (
								<Text style={styles.footerText}>
									Primeiro acesso?{" "}
									<Text
										style={styles.footerLink}
										onPress={() => switchTab("signup")}
									>
										Criar conta
									</Text>
								</Text>
							) : (
								<Text style={styles.footerText}>
									Já tem uma conta?{" "}
									<Text
										style={styles.footerLink}
										onPress={() => switchTab("login")}
									>
										Fazer login.
									</Text>
								</Text>
							)}
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	flex: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
	},
	// Header gradient area
	header: {
		paddingTop: 80,
		paddingBottom: 40,
		alignItems: "center",
	},
	logo: {
		width: 220,
		height: 72,
	},
	tagline: {
		marginTop: 8,
		fontSize: 16,
		color: "#5DADE2",
		fontWeight: "400",
	},
	// White card
	card: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		borderTopLeftRadius: 28,
		borderTopRightRadius: 28,
		paddingHorizontal: 24,
		paddingTop: 24,
		paddingBottom: 40,
		// Subtle shadow for the card top
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 5,
	},
	// Tab selector
	tabContainer: {
		flexDirection: "row",
		backgroundColor: "#F0F0F0",
		borderRadius: 25,
		padding: 4,
		marginBottom: 24,
	},
	tab: {
		flex: 1,
		paddingVertical: 10,
		borderRadius: 22,
		alignItems: "center",
	},
	activeTab: {
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
	},
	tabText: {
		fontSize: 15,
		fontWeight: "500",
		color: "#999",
	},
	activeTabText: {
		color: "#000",
		fontWeight: "600",
	},
	// Title
	title: {
		fontSize: 24,
		fontWeight: "700",
		color: "#000",
		marginBottom: 20,
	},
	// Error
	errorContainer: {
		backgroundColor: "#FEE2E2",
		borderRadius: 8,
		padding: 12,
		marginBottom: 16,
	},
	errorText: {
		color: "#DC2626",
		fontSize: 14,
		textAlign: "center",
	},
	// Form fields
	fieldContainer: {
		marginBottom: 16,
	},
	label: {
		fontSize: 14,
		fontWeight: "500",
		color: "#000",
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: "#E5E5E5",
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 16,
		color: "#000",
		backgroundColor: "#FAFAFA",
	},
	passwordContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#E5E5E5",
		borderRadius: 12,
		backgroundColor: "#FAFAFA",
	},
	passwordInput: {
		flex: 1,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 16,
		color: "#000",
	},
	eyeButton: {
		paddingHorizontal: 14,
		paddingVertical: 14,
	},
	// Submit button
	submitButton: {
		backgroundColor: "#000",
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: "center",
		marginTop: 8,
		marginBottom: 24,
	},
	submitButtonDisabled: {
		opacity: 0.6,
	},
	submitButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	// Footer
	footer: {
		alignItems: "center",
		marginTop: "auto",
		paddingBottom: 16,
	},
	footerText: {
		fontSize: 14,
		color: "#666",
	},
	footerLink: {
		fontWeight: "700",
		color: "#000",
		textDecorationLine: "underline",
	},
});
