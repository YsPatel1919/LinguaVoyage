import { useState, useCallback, useEffect } from "react";

export function useMicrophone() {
  const [hasPermission, setHasPermission] = useState(false);
  const [micStatus, setMicStatus] = useState<'checking' | 'granted' | 'denied' | 'prompt'>('checking');

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicStatus('denied');
        return;
      }

      // Check current permission status
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      
      switch (permission.state) {
        case 'granted':
          setHasPermission(true);
          setMicStatus('granted');
          break;
        case 'denied':
          setHasPermission(false);
          setMicStatus('denied');
          break;
        default:
          setHasPermission(false);
          setMicStatus('prompt');
      }

      // Listen for permission changes
      permission.onchange = () => {
        checkPermission();
      };
    } catch (error) {
      console.error('Failed to check microphone permission:', error);
      setMicStatus('prompt');
    }
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1,
        }
      });

      // Permission granted, clean up the stream
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      setMicStatus('granted');
      
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setHasPermission(false);
      setMicStatus('denied');
      throw new Error('Microphone access denied. Please allow microphone access in your browser settings.');
    }
  }, []);

  return {
    hasPermission,
    micStatus,
    requestPermission,
    checkPermission,
  };
}
