import { FastifyRequest } from 'fastify';

// Extend FastifyRequest with user information
declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
  }
}

// Content idea types
export interface ContentIdea {
  id?: string;
  title: string;
  format: string;
  description: string;
  date: string | null;
  keywords?: string[];
}

// User settings types
export interface UserPreferences {
  defaultStyle?: 'casual' | 'professional';
  calendarView?: 'month' | 'week' | 'list';
  defaultKeywordMode?: 'exact' | 'balanced' | 'related';
}

export interface UserSettings {
  userId: string;
  preferences: UserPreferences;
}

// Subscription types
export interface SubscriptionStatus {
  userId: string;
  isPremium: boolean;
  planType: 'free' | 'premium';
  limits?: {
    dailySearches: number;
    remainingSearches: number;
    resetAt: string;
  };
}

// ContentERP integration types
export interface ContentERPConnection {
  userId: string;
  connected: boolean;
  connectedAt?: string;
  lastSync?: string;
  exportsCount?: number;
}

// API response types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  error?: unknown;
}

// Additional type for content generation parameters
export interface ContentGenerationParams {
  keywords: string;
  days?: number;
  style?: 'casual' | 'professional';
  premium?: boolean;
} 