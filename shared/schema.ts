import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  livekitSessionId: text("livekit_session_id").notNull(),
  geminiSessionId: text("gemini_session_id"),
  status: text("status").notNull().default("connecting"), // connecting, active, ended
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
  participantCount: integer("participant_count").notNull().default(1),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  startedAt: true,
  endedAt: true,
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

// Conversation state types
export interface ConversationState {
  isActive: boolean;
  status: 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking';
  hasPermission: boolean;
  isConnected: boolean;
  sessionId?: string;
  error?: string;
}

export interface AudioStatus {
  micPermission: 'granted' | 'denied' | 'prompt';
  audioQuality: string;
  apiStatus: 'ready' | 'connecting' | 'connected' | 'error';
  webrtcStatus: 'connected' | 'connecting' | 'disconnected';
}

export interface SystemStatus {
  activeSessions: number;
  maxSessions: number;
  geminiModel: string;
  sessionId?: string;
}
