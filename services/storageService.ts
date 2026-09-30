import { ChatSession, STORAGE_KEY, SESSION_TIMEOUT_MS, Message } from '../types';

// Simple XOR encryption for local storage (obfuscation at rest)
// We use a session-based key so it's lost when the tab closes, adding security.
const getSessionKey = (): string => {
  let key = sessionStorage.getItem('grid_safety_key');
  if (!key) {
    key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('grid_safety_key', key);
  }
  return key;
};

const xorEncryptDecrypt = (input: string, key: string): string => {
  let output = '';
  for (let i = 0; i < input.length; i++) {
    output += String.fromCharCode(input.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return output;
};

export const saveSession = (messages: Message[]) => {
  const session: ChatSession = {
    lastUpdated: Date.now(),
    messages,
  };
  try {
    const jsonString = JSON.stringify(session);
    // Encode to URI component to ensure all characters are ASCII before XOR
    const asciiString = encodeURIComponent(jsonString);
    const encrypted = xorEncryptDecrypt(asciiString, getSessionKey());
    // Base64 encode to safely store in localStorage
    localStorage.setItem(STORAGE_KEY, btoa(encrypted));
  } catch (e) {
    console.error("Failed to save session", e);
  }
};

export const loadSession = (): Message[] | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const decrypted = xorEncryptDecrypt(atob(stored), getSessionKey());
    const jsonString = decodeURIComponent(decrypted);
    const session: ChatSession = JSON.parse(jsonString);
    const now = Date.now();

    // Check if session is expired (older than 1 hour)
    if (now - session.lastUpdated > SESSION_TIMEOUT_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return session.messages;
  } catch (e) {
    // If decryption fails (e.g., new tab, lost session key), clear it silently
    // This is expected behavior for security purposes.
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem('grid_safety_key');
};