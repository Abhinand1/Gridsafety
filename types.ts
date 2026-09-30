export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export interface EmailDraft {
  to: string;
  subject: string;
  body: string;
}

export interface TakedownStep {
  id: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
  icon: string; // FontAwesome class
}

export interface SecurityGuide {
  ios: string[];
  android: string[];
}

export interface ProtectionStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'password' | '2fa' | 'device' | 'privacy';
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
  emailDraft?: EmailDraft;
  takedownGuide?: TakedownStep[];
  securityGuide?: SecurityGuide;
  protectionGuide?: ProtectionStep[];
  widget?: 'email-scanner' | 'none';
  evidenceHash?: string;
  fileName?: string;
}

export interface ChatSession {
  lastUpdated: number;
  messages: Message[];
}

export const STORAGE_KEY = 'grid_safety_session_v1';
export const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 1 Hour