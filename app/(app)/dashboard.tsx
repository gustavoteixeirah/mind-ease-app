import { useAuth } from "@/context/auth-context";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
	const { user, signOut } = useAuth();
	const router = useRouter();

	const handleSignOut = () => {
		signOut();
		router.replace("/(auth)/login");
	};

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>MindEase</Text>
				<TouchableOpacity onPress={handleSignOut} activeOpacity={0.7}>
					<Text style={styles.signOutText}>Sair</Text>
				</TouchableOpacity>
			</View>

			{/* Content */}
			<View style={styles.content}>
				<Text style={styles.welcome}>
					Olá, {user?.displayName || user?.primaryEmail || "usuário"}! 👋
				</Text>
				<Text style={styles.email}>{user?.primaryEmail}</Text>

				<View style={styles.card}>
					<Text style={styles.cardTitle}>Sua área pessoal</Text>
					<Text style={styles.cardDescription}>
						Em breve você terá acesso a recursos e ferramentas para sua jornada
						de bem-estar.
					</Text>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F9FAFB",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 24,
		paddingTop: 16,
		paddingBottom: 16,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: "#000",
	},
	signOutText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#DC2626",
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
		paddingTop: 32,
	},
	welcome: {
		fontSize: 26,
		fontWeight: "700",
		color: "#000",
		marginBottom: 4,
	},
	email: {
		fontSize: 16,
		color: "#6B7280",
		marginBottom: 32,
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#000",
		marginBottom: 8,
	},
	cardDescription: {
		fontSize: 15,
		color: "#6B7280",
		lineHeight: 22,
	},
});
