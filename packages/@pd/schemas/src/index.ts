import { z } from 'zod';

// Session payload schema
export const SessionPayloadSchema = z.object({
  inviteId: z.string(),
  deckId: z.string(),
  exp: z.number(),
  sessionId: z.string().optional(),
});

export type SessionPayload = z.infer<typeof SessionPayloadSchema>;

// Unlock request schema
export const UnlockRequestSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  consent: z.object({
    ndaAccepted: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the NDA to continue' }),
    }),
    email: z.string().email().optional(),
    name: z.string().optional(),
  }),
});

export type UnlockRequest = z.infer<typeof UnlockRequestSchema>;

// Event schema
export const EventSchema = z.object({
  name: z.string(),
  payload: z.record(z.unknown()).optional(),
});

export type Event = z.infer<typeof EventSchema>;

// Enums matching Prisma
export enum DeckVisibility {
  PRIVATE = 'PRIVATE',
  INVITE_ONLY = 'INVITE_ONLY',
}

export enum ResourceType {
  EXEC_SUMMARY = 'EXEC_SUMMARY',
  MEMO = 'MEMO',
  USE_OF_FUNDS = 'USE_OF_FUNDS',
  ROADMAP = 'ROADMAP',
  COMPLIANCE = 'COMPLIANCE',
}

export enum TemplateKind {
  DECK = 'DECK',
  DOC = 'DOC',
}

export enum ThemeScope {
  GLOBAL = 'GLOBAL',
  WORKSPACE = 'WORKSPACE',
  PROJECT = 'PROJECT',
}

export enum WorkspaceRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}
