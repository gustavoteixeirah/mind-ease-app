import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AppearanceProvider } from "@/context/appearance-context";
import { AuthProvider } from "@/context/auth-context";
import { FontScaleProvider } from "@/context/font-scale-context";
import { ThemeAccentProvider } from "@/context/theme-accent-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

function ThemeWrapper({ children }: { children: React.ReactNode }) {
	const colorScheme = useColorScheme();
	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			{children}
		</ThemeProvider>
	);
}

export default function RootLayout() {
	return (
		<AppearanceProvider>
		<AuthProvider>
			<FontScaleProvider>
			<ThemeAccentProvider>
			<ThemeWrapper>
				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen name="index" />
					<Stack.Screen name="(auth)" />
					<Stack.Screen name="(app)" />
				</Stack>
				<StatusBar style="auto" />
			</ThemeWrapper>
			</ThemeAccentProvider>
			</FontScaleProvider>
		</AuthProvider>
		</AppearanceProvider>
	);
}
