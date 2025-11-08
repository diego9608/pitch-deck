import type { Event } from '@pd/schemas';

export interface LogContext {
  workspaceId?: string;
  projectId?: string;
  deckId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Log an event - in production this writes to DB via API route
 * In development, logs to console
 */
export async function logEvent(
  event: Event,
  context?: LogContext
): Promise<void> {
  const payload = {
    ...event,
    ...context,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', payload);
  }

  // In production, send to API
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  }
}

/**
 * Client-side event tracking helper
 */
export function trackEvent(name: string, payload?: Record<string, unknown>) {
  return logEvent({ name, payload });
}
