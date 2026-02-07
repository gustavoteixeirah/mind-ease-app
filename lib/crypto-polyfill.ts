/**
 * Polyfill for the Web Crypto API in React Native.
 *
 * React Native doesn't provide `globalThis.crypto`, which is required by
 * @stackframe/js (Stack Auth SDK). This polyfill bridges the gap using
 * expo-crypto's native implementation.
 *
 * MUST be imported before any Stack Auth code.
 */
import { getRandomValues as expoGetRandomValues } from 'expo-crypto';

if (typeof globalThis.crypto === 'undefined') {
  // @ts-expect-error -- partial polyfill, only what Stack Auth needs
  globalThis.crypto = {};
}

if (typeof globalThis.crypto.getRandomValues === 'undefined') {
  // @ts-expect-error -- expo-crypto types differ slightly from Web Crypto
  globalThis.crypto.getRandomValues = expoGetRandomValues;
}
