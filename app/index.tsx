import { useAuth } from "@/context/auth-context";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function Index() {
	const { user, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (isLoading) return;

		if (user) {
			router.replace("/(app)/dashboard");
		} else {
			router.replace("/(auth)/login");
		}
	}, [user, isLoading, router]);

	return (
		<View style={styles.container}>
			<ActivityIndicator size="large" color="#000" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#fff",
	},
});
