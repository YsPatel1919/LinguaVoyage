import { GoogleGenAI, Modality } from "@google/genai";

interface LiveSessionConfig {
  systemInstructions: string;
  onStatusChange?: (status: string) => void;
  onAudioResponse?: (audioData: string) => void;
  onError?: (error: Error) => void;
}

interface LiveSession {
  sessionId: string;
  connection: any;
  isActive: boolean;
  responseQueue: any[];
}

export class GeminiLiveService {
  private ai: GoogleGenAI;
  private activeSessions: Map<string, LiveSession> = new Map();

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    if (!apiKey) {
      throw new Error("Gemini API key not found. Please set GEMINI_API_KEY or GOOGLE_API_KEY environment variable.");
    }
    
    this.ai = new GoogleGenAI({ apiKey });
  }

  async startLiveSession(config: LiveSessionConfig): Promise<LiveSession> {
    const sessionId = this.generateSessionId();
    
    try {
      // Use the latest Gemini Live model with native audio capabilities
      const model = 'gemini-2.5-flash-preview-native-audio-dialog';
      
      const sessionConfig = {
        responseModalities: [Modality.AUDIO],
        systemInstruction: config.systemInstructions,
        temperature: 0.7,
      };

      const responseQueue: any[] = [];

      // Start the live session
      const connection = await this.ai.live.connect({
        model: model,
        config: sessionConfig,
        callbacks: {
          onopen: () => {
            console.log(`Gemini Live session opened: ${sessionId}`);
            // Wait for setupComplete before indicating ready
          },
          onmessage: (message: any) => {
            responseQueue.push(message);
            this.handleGeminiMessage(sessionId, message, config);
          },
          onerror: (e: ErrorEvent) => {
            console.error(`Gemini Live session error: ${sessionId}`, e.message);
            config.onError?.(new Error(e.message));
            this.cleanupSession(sessionId);
          },
          onclose: (e: CloseEvent) => {
            console.log(`Gemini Live session closed: ${sessionId}`, e.reason);
            this.cleanupSession(sessionId);
          }
        }
      });

      const session: LiveSession = {
        sessionId,
        connection,
        isActive: true,
        responseQueue
      };

      this.activeSessions.set(sessionId, session);
      
      return session;

    } catch (error) {
      console.error('Failed to start Gemini Live session:', error);
      throw new Error(`Failed to start Gemini Live session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async stopLiveSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      console.warn(`Attempted to stop non-existent session: ${sessionId}`);
      return;
    }

    try {
      if (session.connection && session.isActive) {
        await session.connection.close();
      }
    } catch (error) {
      console.error(`Error closing Gemini Live session ${sessionId}:`, error);
    } finally {
      this.cleanupSession(sessionId);
    }
  }

  async sendAudioData(sessionId: string, audioData: Uint8Array): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.isActive) {
      console.warn(`Attempted to send audio to inactive session: ${sessionId}`);
      return;
    }

    try {
      // Convert audio data to base64 for the Gemini Live API
      // The API expects 16-bit PCM audio at 16kHz
      const base64Audio = Buffer.from(audioData).toString('base64');
      
      await session.connection.sendRealtimeInput({
        audio: {
          data: base64Audio,
          mimeType: "audio/pcm;rate=16000"
        }
      });
    } catch (error) {
      console.error(`Failed to send audio data to session ${sessionId}:`, error);
      throw error;
    }
  }

  private handleGeminiMessage(sessionId: string, message: any, config: LiveSessionConfig): void {
    try {
      // Handle different response types from Gemini Live API
      if (message.setupComplete) {
        console.log(`Setup complete for session ${sessionId}`);
        config.onStatusChange?.('listening');
      } else if (message.data) {
        // Audio response data
        console.log(`Audio response for session ${sessionId}:`, message.data.length, 'bytes');
        config.onAudioResponse?.(message.data);
        config.onStatusChange?.('speaking');
      } else if (message.serverContent) {
        // Handle server content updates
        if (message.serverContent.modelTurn) {
          config.onStatusChange?.('thinking');
        } else if (message.serverContent.turnComplete) {
          config.onStatusChange?.('listening');
        }
      } else {
        // Log other message types for debugging
        console.log(`Gemini Live message for ${sessionId}:`, JSON.stringify(message, null, 2));
      }
    } catch (error) {
      console.error(`Error handling Gemini message for session ${sessionId}:`, error);
      config.onError?.(error instanceof Error ? error : new Error('Unknown error handling message'));
    }
  }

  private cleanupSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      this.activeSessions.delete(sessionId);
    }
  }

  private generateSessionId(): string {
    return `gemini_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isHealthy(): boolean {
    return true; // Could implement more sophisticated health checks
  }

  getActiveSessionCount(): number {
    return this.activeSessions.size;
  }

  getActiveSessions(): string[] {
    return Array.from(this.activeSessions.keys());
  }
}
