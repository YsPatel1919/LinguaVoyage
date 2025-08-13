import { AudioStatus, SystemStatus, ConversationState } from "@shared/schema";

interface TechnicalStatusProps {
  audioStatus: AudioStatus;
  systemStatus: SystemStatus;
  conversationState: ConversationState;
}

export default function TechnicalStatus({ 
  audioStatus, 
  systemStatus, 
  conversationState 
}: TechnicalStatusProps) {
  
  const getMicrophoneIcon = () => {
    switch (audioStatus.micPermission) {
      case 'granted':
        return 'text-green-500';
      case 'denied':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getMicrophoneStatus = () => {
    switch (audioStatus.micPermission) {
      case 'granted':
        return conversationState.isActive ? 'Active' : 'Ready';
      case 'denied':
        return 'Denied';
      default:
        return 'Permission Required';
    }
  };

  const getApiStatusColor = () => {
    switch (audioStatus.apiStatus) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  const getWebRTCStatusColor = () => {
    switch (audioStatus.webrtcStatus) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="mt-12 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
        </svg>
        System Status
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Microphone Status */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className={`w-4 h-4 ${getMicrophoneIcon()}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Microphone</p>
            <p className={`text-xs ${getMicrophoneIcon()}`} data-testid="mic-status-text">
              {getMicrophoneStatus()}
            </p>
          </div>
        </div>
        
        {/* Audio Quality */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.972 7.972 0 0017 12a7.972 7.972 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Audio Quality</p>
            <p className="text-xs text-green-500" data-testid="audio-quality">{audioStatus.audioQuality}</p>
          </div>
        </div>
        
        {/* API Status */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className={`w-4 h-4 ${getApiStatusColor()}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Gemini 2.5 Live</p>
            <p className={`text-xs ${getApiStatusColor()}`} data-testid="api-status">
              {audioStatus.apiStatus.charAt(0).toUpperCase() + audioStatus.apiStatus.slice(1)}
            </p>
          </div>
        </div>
        
        {/* WebRTC Status */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className={`w-4 h-4 ${getWebRTCStatusColor()}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">LiveKit</p>
            <p className={`text-xs ${getWebRTCStatusColor()}`} data-testid="webrtc-status">
              {audioStatus.webrtcStatus.charAt(0).toUpperCase() + audioStatus.webrtcStatus.slice(1)}
            </p>
          </div>
        </div>
      </div>
      
      {/* API Proof Display */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <svg className="w-4 h-4 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-900">API Verification</p>
            <p className="text-xs text-gray-600 mt-1">
              Model: <code className="bg-white px-1 rounded text-blue-500" data-testid="gemini-model">{systemStatus.geminiModel}</code><br/>
              {systemStatus.sessionId && (
                <>Session ID: <span className="font-mono" data-testid="session-id">{systemStatus.sessionId}</span></>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
