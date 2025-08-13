interface LiveKitSession {
  sessionId: string;
  roomName: string;
  participantToken: string;
  isActive: boolean;
}

export class LiveKitService {
  private activeSessions: Map<string, LiveKitSession> = new Map();
  private livekitUrl: string;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.livekitUrl = process.env.LIVEKIT_URL || 'ws://localhost:7880';
    this.apiKey = process.env.LIVEKIT_API_KEY || '';
    this.apiSecret = process.env.LIVEKIT_API_SECRET || '';

    if (!this.apiKey || !this.apiSecret) {
      console.warn('LiveKit credentials not configured. Some features may not work.');
    }
  }

  async createSession(): Promise<LiveKitSession> {
    const sessionId = this.generateSessionId();
    const roomName = `portuguese_tutor_${sessionId}`;

    try {
      // Generate participant token (simplified - in production use proper LiveKit token generation)
      const participantToken = this.generateParticipantToken(roomName, sessionId);

      const session: LiveKitSession = {
        sessionId,
        roomName,
        participantToken,
        isActive: true
      };

      this.activeSessions.set(sessionId, session);
      
      console.log(`LiveKit session created: ${sessionId}`);
      return session;

    } catch (error) {
      console.error('Failed to create LiveKit session:', error);
      throw new Error(`Failed to create LiveKit session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      console.warn(`Attempted to end non-existent LiveKit session: ${sessionId}`);
      return;
    }

    try {
      // In a real implementation, you would disconnect participants and clean up the room
      session.isActive = false;
      this.activeSessions.delete(sessionId);
      
      console.log(`LiveKit session ended: ${sessionId}`);
    } catch (error) {
      console.error(`Error ending LiveKit session ${sessionId}:`, error);
      throw error;
    }
  }

  async getSessionInfo(sessionId: string): Promise<LiveKitSession | undefined> {
    return this.activeSessions.get(sessionId);
  }

  private generateSessionId(): string {
    return `lk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateParticipantToken(roomName: string, participantName: string): string {
    // This is a simplified token generation
    // In production, use the LiveKit token generation library
    // https://docs.livekit.io/realtime/client/authentication/
    
    if (!this.apiKey || !this.apiSecret) {
      return 'demo_token'; // Fallback for development
    }

    // For now, return a placeholder token
    // In production, implement proper JWT token generation with LiveKit claims
    return `${this.apiKey}_${roomName}_${participantName}`;
  }

  isHealthy(): boolean {
    // Simple health check - in production you might ping the LiveKit server
    return true;
  }

  getActiveSessionCount(): number {
    return this.activeSessions.size;
  }

  getActiveSessions(): string[] {
    return Array.from(this.activeSessions.keys());
  }

  getLiveKitUrl(): string {
    return this.livekitUrl;
  }
}