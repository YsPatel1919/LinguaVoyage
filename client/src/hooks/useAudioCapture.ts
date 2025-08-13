import { useState, useCallback, useRef, useEffect } from "react";

interface AudioCaptureConfig {
  onAudioData?: (audioData: Uint8Array) => void;
  onError?: (error: Error) => void;
}

export function useAudioCapture() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCapture = useCallback(async (config: AudioCaptureConfig) => {
    try {
      // Get microphone access with specific constraints for Gemini Live API
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1,
        }
      });

      streamRef.current = stream;
      setHasPermission(true);

      // Create audio context for processing
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);

      // Create processor for 16-bit PCM conversion
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      processorRef.current.onaudioprocess = (event) => {
        if (!isCapturing) return;

        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        // Check for actual audio activity
        let hasAudio = false;
        for (let i = 0; i < inputData.length; i++) {
          if (Math.abs(inputData[i]) > 0.01) {
            hasAudio = true;
            break;
          }
        }
        
        if (!hasAudio) return; // Skip silent audio
        
        // Convert float32 audio to 16-bit PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          // Clamp and convert to 16-bit integer
          const sample = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        }

        // Send as Uint8Array (byte array)
        const uint8Data = new Uint8Array(pcmData.buffer);
        config.onAudioData?.(uint8Data);
        console.log('Sending audio data:', uint8Data.length, 'bytes');
      };

      // Connect the nodes
      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      setIsCapturing(true);
      console.log('Audio capture started successfully');
      console.log('Microphone access granted, stream active:', streamRef.current?.active);

    } catch (error) {
      console.error('Failed to start audio capture:', error);
      setHasPermission(false);
      config.onError?.(error instanceof Error ? error : new Error('Failed to start audio capture'));
    }
  }, [isCapturing]);

  const stopCapture = useCallback(() => {
    try {
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      setIsCapturing(false);
    } catch (error) {
      console.error('Error stopping audio capture:', error);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, [stopCapture]);

  return {
    isCapturing,
    hasPermission,
    startCapture,
    stopCapture,
  };
}