import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { GeminiLiveService } from "./services/geminiLive";
import { LiveKitService } from "./services/livekitService.js";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize services
  const geminiService = new GeminiLiveService();
  const livekitService = new LiveKitService();
  
  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });

  // Track active connections and sessions
  const activeConnections = new Map<string, WebSocket>();
  const activeSessions = new Map<string, any>();

  wss.on('connection', async (ws: WebSocket) => {
    const connectionId = generateConnectionId();
    activeConnections.set(connectionId, ws);
    
    console.log(`WebSocket connected: ${connectionId}`);
    
    // Send initial system status
    sendSystemStatus(ws);

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'start_conversation':
            await handleStartConversation(ws, connectionId, message);
            break;
          case 'stop_conversation':
            await handleStopConversation(ws, connectionId, message);
            break;
          case 'audio_data':
            await handleAudioData(ws, connectionId, message);
            break;
          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message'
        }));
      }
    });

    ws.on('close', (code, reason) => {
      console.log(`WebSocket disconnected: ${connectionId}, code: ${code}, reason: ${reason}`);
      activeConnections.delete(connectionId);
      
      // Clean up any active sessions for this connection
      if (activeSessions.has(connectionId)) {
        cleanupSession(connectionId);
      }
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for ${connectionId}:`, error);
      activeConnections.delete(connectionId);
      if (activeSessions.has(connectionId)) {
        cleanupSession(connectionId);
      }
    });
  });

  async function handleStartConversation(ws: WebSocket, connectionId: string, message: any) {
    try {
      // Check session limits
      if (activeSessions.size >= 30) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Maximum concurrent sessions reached. Please try again later.'
        }));
        return;
      }

      // Send connecting status
      ws.send(JSON.stringify({
        type: 'conversation_status',
        status: 'connecting'
      }));

      // Create LiveKit session
      const livekitSession = await livekitService.createSession();
      
      // Start Gemini Live session
      let sessionId = 'connecting';
      const geminiSession = await geminiService.startLiveSession({
        systemInstructions: getPortugueseTutorPrompt(),
        onStatusChange: (status: string) => {
          console.log(`Status change for session ${sessionId}: ${status}`);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'conversation_status',
              status: status,
              sessionId: sessionId
            }));
          }
        },
        onAudioResponse: (audioData: string) => {
          console.log('Received audio response, sending to client');
          // Send audio data through WebSocket to client
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'audio_response',
              data: audioData
            }));
          }
        }
      });

      sessionId = geminiSession.sessionId;

      // Store session
      const sessionRecord = await storage.createSession({
        livekitSessionId: livekitSession.sessionId,
        geminiSessionId: geminiSession.sessionId,
        status: 'active'
      });

      activeSessions.set(connectionId, {
        sessionRecord,
        livekitSession,
        geminiSession
      });

      // Send success response - let the Gemini callback handle status updates
      console.log(`Session created successfully: ${sessionId}`);

      // Update system status for all clients
      broadcastSystemStatus();

    } catch (error) {
      console.error('Failed to start conversation:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to start conversation. Please check your connection and try again.'
      }));
    }
  }

  async function handleStopConversation(ws: WebSocket, connectionId: string, message: any) {
    try {
      const session = activeSessions.get(connectionId);
      if (!session) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'No active session found'
        }));
        return;
      }

      // Stop Gemini session
      await geminiService.stopLiveSession(session.geminiSession.sessionId);
      
      // Stop LiveKit session
      await livekitService.endSession(session.livekitSession.sessionId);

      // Update session record
      await storage.endSession(session.sessionRecord.id);

      // Clean up
      activeSessions.delete(connectionId);

      // Send response
      ws.send(JSON.stringify({
        type: 'conversation_status',
        status: 'idle'
      }));

      // Update system status for all clients
      broadcastSystemStatus();

    } catch (error) {
      console.error('Failed to stop conversation:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to stop conversation'
      }));
    }
  }

  async function handleAudioData(ws: WebSocket, connectionId: string, message: any) {
    try {
      const session = activeSessions.get(connectionId);
      if (!session) {
        console.log('No session found for audio data');
        return;
      }

      if (!message.audioData || !Array.isArray(message.audioData)) {
        console.log('Invalid audio data format');
        return;
      }

      console.log(`Processing audio data: ${message.audioData.length} bytes for session ${session.geminiSession.sessionId}`);

      // Forward audio data to Gemini Live API
      await geminiService.sendAudioData(
        session.geminiSession.sessionId, 
        new Uint8Array(message.audioData)
      );

    } catch (error) {
      console.error('Failed to process audio data:', error);
    }
  }

  function cleanupSession(connectionId: string) {
    const session = activeSessions.get(connectionId);
    if (session) {
      console.log(`Cleaning up session for connection ${connectionId}`);
      try {
        // Don't await these to prevent hanging
        geminiService.stopLiveSession(session.geminiSession.sessionId).catch(e => 
          console.error('Error stopping Gemini session:', e)
        );
        livekitService.endSession(session.livekitSession.sessionId).catch(e => 
          console.error('Error stopping LiveKit session:', e)
        );
        storage.endSession(session.sessionRecord.id).catch(e => 
          console.error('Error ending session record:', e)
        );
      } catch (error) {
        console.error('Error during session cleanup:', error);
      }
      activeSessions.delete(connectionId);
      broadcastSystemStatus();
    }
  }

  function sendSystemStatus(ws: WebSocket) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'system_status',
        activeSessions: activeSessions.size,
        maxSessions: 30,
        geminiModel: 'gemini-2.5-flash-exp-native-audio-thinking-dialog'
      }));
    }
  }

  function broadcastSystemStatus() {
    const statusMessage = JSON.stringify({
      type: 'system_status',
      activeSessions: activeSessions.size,
      maxSessions: 30,
      geminiModel: 'gemini-2.5-flash-exp-native-audio-thinking-dialog'
    });

    activeConnections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(statusMessage);
      }
    });
  }

  function generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  function getPortugueseTutorPrompt(): string {
    return `You are a friendly, English-speaking Portuguese tutor from Portugal. You only use authentic European Portuguese phrases—never Brazilian Portuguese. You teach the user how to greet people and say common words and expressions. Start with greetings like "Bom dia," "Boa tarde," and "Boa noite," and then teach everyday vocabulary like "sumo de laranja" for orange juice. Speak naturally, give examples in both Portuguese and English, and encourage the user to repeat after you. Correct pronunciation gently and keep the conversation engaging.

Key guidelines:
- Always use European Portuguese pronunciation and vocabulary
- Be encouraging and patient with learners
- Provide clear explanations and examples
- Correct pronunciation errors gently
- Keep conversations natural and flowing
- Allow for interruptions and spontaneous questions
- Respond to unscripted questions appropriately`;
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      activeSessions: activeSessions.size,
      maxSessions: 30,
      geminiModel: 'gemini-2.5-flash-exp-native-audio-thinking-dialog',
      services: {
        gemini: geminiService.isHealthy(),
        livekit: livekitService.isHealthy()
      }
    });
  });

  return httpServer;
}
