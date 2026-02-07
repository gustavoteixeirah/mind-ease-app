import {
    getUser,
    refreshAccessToken,
    signInWithCredential,
    signOutSession,
    signUpWithCredential,
    type StackUser,
    type TokenPair,
    updateUser,
} from "@/lib/stack-auth";
import * as SecureStore from "expo-secure-store";
import type React from "react";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

// Keys for SecureStore
const ACCESS_TOKEN_KEY = "stack_access_token";
const REFRESH_TOKEN_KEY = "stack_refresh_token";

/** Simplified user object exposed to components */
export interface AppUser {
	id: string;
	primaryEmail: string | null;
	displayName: string | null;
}

function toAppUser(u: StackUser): AppUser {
	return {
		id: u.id,
		primaryEmail: u.primary_email,
		displayName: u.display_name,
	};
}

interface AuthContextValue {
	user: AppUser | null;
	isLoading: boolean;
	signIn: (
		email: string,
		password: string,
	) => Promise<{ success: boolean; error?: string }>;
	signUp: (
		email: string,
		password: string,
		displayName: string,
	) => Promise<{ success: boolean; error?: string }>;
	signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
	user: null,
	isLoading: true,
	signIn: async () => ({ success: false }),
	signUp: async () => ({ success: false }),
	signOut: () => {},
});

export function useAuth() {
	return useContext(AuthContext);
}

async function persistTokens(tokens: TokenPair) {
	try {
		await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
		await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
	} catch (e) {
		console.warn("Failed to persist tokens:", e);
	}
}

async function clearTokens() {
	try {
		await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
		await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
	} catch (e) {
		console.warn("Failed to clear tokens:", e);
	}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<AppUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const tokensRef = useRef<TokenPair | null>(null);

	// Restore session on mount
	useEffect(() => {
		let cancelled = false;

		async function restoreSession() {
			try {
				const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
				const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

				if (accessToken && refreshToken) {
					tokensRef.current = { accessToken, refreshToken };

					try {
						const stackUser = await getUser(accessToken);
						if (!cancelled) {
							setUser(toAppUser(stackUser));
						}
					} catch {
						// Access token may be expired — try refresh
						try {
							const newTokens = await refreshAccessToken(refreshToken);
							tokensRef.current = newTokens;
							await persistTokens(newTokens);

							const stackUser = await getUser(newTokens.accessToken);
							if (!cancelled) {
								setUser(toAppUser(stackUser));
							}
						} catch {
							// Refresh also failed — clear everything
							await clearTokens();
							tokensRef.current = null;
						}
					}
				}
			} catch (e) {
				console.warn("Failed to restore session:", e);
				await clearTokens();
				tokensRef.current = null;
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		restoreSession();
		return () => {
			cancelled = true;
		};
	}, []);

	const signIn = useCallback(async (email: string, password: string) => {
		try {
			const tokens = await signInWithCredential(email, password);
			tokensRef.current = tokens;

			const stackUser = await getUser(tokens.accessToken);
			setUser(toAppUser(stackUser));

			persistTokens(tokens).catch(() => {});
			return { success: true };
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : "Erro ao fazer login";
			return { success: false, error: msg };
		}
	}, []);

	const signUp = useCallback(
		async (email: string, password: string, displayName: string) => {
			try {
				const tokens = await signUpWithCredential(email, password);
				tokensRef.current = tokens;

				// Update display name
				await updateUser(tokens.accessToken, { display_name: displayName });

				const stackUser = await getUser(tokens.accessToken);
				setUser(toAppUser(stackUser));

				persistTokens(tokens).catch(() => {});
				return { success: true };
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : "Erro ao criar conta";
				return { success: false, error: msg };
			}
		},
		[],
	);

	const signOutFn = useCallback(() => {
		// Clear local state immediately (synchronous)
		const token = tokensRef.current?.accessToken;
		tokensRef.current = null;
		setUser(null);

		// Background cleanup — don't block UI
		clearTokens().catch(() => {});
		if (token) {
			signOutSession(token).catch(() => {});
		}
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user,
				isLoading,
				signIn,
				signUp,
				signOut: signOutFn,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
