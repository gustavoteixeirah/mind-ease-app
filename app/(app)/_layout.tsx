import { useAuth } from "@/context/auth-context";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

export default function AppLayout() {
	const { user, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !user) {
			router.replace("/(auth)/login");
		}
	}, [user, isLoading, router]);

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="dashboard" />
		</Stack>
	);
}
