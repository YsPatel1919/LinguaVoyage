import { useState, useCallback, useEffect, useRef } from "react";
import { ConversationState, AudioStatus, SystemStatus } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAudioCapture } from "@/hooks/useAudioCapture";

export function useConversation() {
  const { toast } = useToast();
  const audioCapture = useAudioCapture();
  const [conversationState, setConversationState] = useState<ConversationState>({
    isActive: false,
    status: 'idle',
    hasPermission: false,
    isConnected: false,
  });

  const [audioStatus, setAudioStatus] = useState<AudioStatus>({
    micPermission: 'prompt',
    audioQuality: '16kHz PCM',
    apiStatus: 'ready',
    webrtcStatus: 'disconnected',
  });

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    activeSessions: 0,
    maxSessions: 30,
    geminiModel: 'gemini-2.5-flash-preview-native-audio-dialog',
  });

  const wsRef = useRef<WebSocket | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const connectWebSocket = useCallback(() => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      console.log('Connecting to WebSocket:', wsUrl);
      
      // Close existing connection if it exists
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
        wsRef.current.close();
      }
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setConversationState(prev => ({ ...prev, isConnected: true }));
        setAudioStatus(prev => ({ ...prev, webrtcStatus: 'connected' }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'conversation_status':
              console.log('Conversation status update:', data.status);
              setConversationState(prev => ({ 
                ...prev, 
                status: data.status,
                sessionId: data.sessionId 
              }));
              break;
            case 'system_status':
              setSystemStatus(prev => ({ 
                ...prev, 
                activeSessions: data.activeSessions,
                sessionId: data.sessionId 
              }));
              break;
            case 'audio_response':
              // Handle incoming audio data from Gemini
              playAudioResponse(data.data);
              break;
            case 'error':
              console.error('WebSocket error:', data.message);
              setConversationState(prev => ({ 
                ...prev, 
                error: data.message,
                status: 'idle',
                isActive: false 
              }));
              toast({
                title: "Connection Error",
                description: data.message,
                variant: "destructive",
              });
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        setConversationState(prev => ({ ...prev, isConnected: false }));
        setAudioStatus(prev => ({ ...prev, webrtcStatus: 'disconnected' }));
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConversationState(prev => ({ ...prev, isConnected: false }));
        setAudioStatus(prev => ({ ...prev, webrtcStatus: 'disconnected' }));
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setConversationState(prev => ({ ...prev, isConnected: false }));
      setAudioStatus(prev => ({ ...prev, webrtcStatus: 'disconnected' }));
    }
  }, [toast]);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const playAudioResponse = useCallback((audioData: string) => {
    try {
      // Create audio blob from base64 data
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBlob = new Blob([bytes], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Play the audio
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio();
      }
      
      audioElementRef.current.src = audioUrl;
      audioElementRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
      
      // Clean up URL after playing
      audioElementRef.current.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
      
    } catch (error) {
      console.error('Error processing audio response:', error);
    }
  }, []);

  const startConversation = useCallback(async () => {
    try {
      setConversationState(prev => ({ 
        ...prev, 
        status: 'connecting',
        isActive: true,
        error: undefined 
      }));
      setAudioStatus(prev => ({ ...prev, apiStatus: 'connecting' }));

      // Send start conversation message via WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'start_conversation',
          timestamp: Date.now()
        }));
      } else {
        throw new Error('WebSocket not connected');
      }

      // Start audio capture
      console.log('Starting audio capture...');
      await audioCapture.startCapture({
        onAudioData: (audioData: Uint8Array) => {
          // Send audio data to server via WebSocket
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            console.log(`Sending audio chunk: ${audioData.length} bytes`);
            wsRef.current.send(JSON.stringify({
              type: 'audio_data',
              audioData: Array.from(audioData),
              timestamp: Date.now()
            }));
          } else {
            console.warn('WebSocket not ready for audio data');
          }
        },
        onError: (error: Error) => {
          console.error('Audio capture error:', error);
          toast({
            title: "Microphone Error",
            description: error.message,
            variant: "destructive",
          });
        }
      });
      
      console.log('Audio capture started successfully');

      // Update API status
      setAudioStatus(prev => ({ ...prev, apiStatus: 'connected' }));

    } catch (error) {
      console.error('Failed to start conversation:', error);
      setConversationState(prev => ({ 
        ...prev, 
        status: 'idle',
        isActive: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
      setAudioStatus(prev => ({ ...prev, apiStatus: 'error' }));
      throw error;
    }
  }, []);

  const stopConversation = useCallback(async () => {
    try {
      // Stop audio capture first
      audioCapture.stopCapture();

      setConversationState(prev => ({ 
        ...prev, 
        status: 'idle',
        isActive: false,
        sessionId: undefined 
      }));

      // Send stop conversation message via WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'stop_conversation',
          timestamp: Date.now()
        }));
      }

      setAudioStatus(prev => ({ ...prev, apiStatus: 'ready' }));

    } catch (error) {
      console.error('Failed to stop conversation:', error);
      throw error;
    }
  }, [audioCapture]);

  return {
    conversationState,
    audioStatus,
    systemStatus,
    startConversation,
    stopConversation,
  };
}
