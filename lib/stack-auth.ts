/**
 * Direct REST API client for Stack Auth.
 *
 * The official @stackframe/js SDK uses `new Response(body, ...)` internally
 * which breaks in React Native (ReadableStream doesn't transfer properly).
 * This module calls the REST API directly, avoiding all SDK compatibility issues.
 */

const API_BASE = 'https://api.stack-auth.com/api/v1';
const PROJECT_ID = process.env.EXPO_PUBLIC_STACK_PROJECT_ID ?? '';
const PUBLISHABLE_CLIENT_KEY = process.env.EXPO_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY ?? '';

/** Minimal user type returned by the Stack Auth API */
export interface StackUser {
  id: string;
  primary_email: string | null;
  primary_email_verified: boolean;
  display_name: string | null;
  signed_up_at_millis: number;
  has_password: boolean;
  [key: string]: unknown;
}

/** Token pair returned by sign-in / sign-up */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/** Common headers for all Stack Auth requests */
function baseHeaders(accessToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Stack-Project-Id': PROJECT_ID,
    'X-Stack-Access-Type': 'client',
    'X-Stack-Publishable-Client-Key': PUBLISHABLE_CLIENT_KEY,
  };
  if (accessToken) {
    headers['X-Stack-Access-Token'] = accessToken;
  }
  return headers;
}

/** Helper that parses the JSON body and throws on error responses */
async function request<T>(
  path: string,
  options: RequestInit,
  accessToken?: string,
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...baseHeaders(accessToken),
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const message = data?.message ?? data?.error ?? `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

/**
 * Sign up with email + password.
 * Returns access and refresh tokens.
 */
export async function signUpWithCredential(
  email: string,
  password: string,
): Promise<TokenPair> {
  const data = await request<{ access_token: string; refresh_token: string }>(
    '/auth/password/sign-up',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
  );
  return { accessToken: data.access_token, refreshToken: data.refresh_token };
}

/**
 * Sign in with email + password.
 * Returns access and refresh tokens.
 */
export async function signInWithCredential(
  email: string,
  password: string,
): Promise<TokenPair> {
  const data = await request<{ access_token: string; refresh_token: string }>(
    '/auth/password/sign-in',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
  );
  return { accessToken: data.access_token, refreshToken: data.refresh_token };
}

/**
 * Fetch the currently authenticated user.
 */
export async function getUser(accessToken: string): Promise<StackUser> {
  return request<StackUser>('/users/me', { method: 'GET' }, accessToken);
}

/**
 * Update the current user's profile (e.g. display_name).
 */
export async function updateUser(
  accessToken: string,
  patch: { display_name?: string; [key: string]: unknown },
): Promise<StackUser> {
  return request<StackUser>(
    '/users/me',
    { method: 'PATCH', body: JSON.stringify(patch) },
    accessToken,
  );
}

/**
 * Refresh access token using a refresh token.
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<TokenPair> {
  const data = await request<{ access_token: string; refresh_token?: string }>(
    '/auth/sessions/current/refresh',
    {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    },
  );
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
  };
}

/**
 * Sign out the current session.
 */
export async function signOutSession(accessToken: string): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    await request<unknown>(
      '/auth/sessions/current',
      { method: 'DELETE', signal: controller.signal },
      accessToken,
    );
  } finally {
    clearTimeout(timeout);
  }
}
