import { type Session, type InsertSession } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  endSession(id: string): Promise<Session | undefined>;
  getActiveSessions(): Promise<Session[]>;
  getActiveSessionCount(): Promise<number>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, Session>;

  constructor() {
    this.sessions = new Map();
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = { 
      ...insertSession, 
      id,
      status: insertSession.status || 'connecting',
      geminiSessionId: insertSession.geminiSessionId || null,
      participantCount: insertSession.participantCount || 1,
      startedAt: new Date(),
      endedAt: null
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async endSession(id: string): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (session) {
      const updatedSession: Session = {
        ...session,
        status: 'ended',
        endedAt: new Date()
      };
      this.sessions.set(id, updatedSession);
      return updatedSession;
    }
    return undefined;
  }

  async getActiveSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(
      session => session.status === 'active' || session.status === 'connecting'
    );
  }

  async getActiveSessionCount(): Promise<number> {
    const activeSessions = await this.getActiveSessions();
    return activeSessions.length;
  }
}

export const storage = new MemStorage();
