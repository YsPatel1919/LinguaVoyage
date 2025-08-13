import { cn } from "@/lib/utils";

interface ConversationButtonProps {
  isActive: boolean;
  status: 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking';
  onToggle: () => void;
  disabled?: boolean;
}

export default function ConversationButton({ 
  isActive, 
  status, 
  onToggle, 
  disabled = false 
}: ConversationButtonProps) {
  
  const getButtonContent = () => {
    if (status === 'connecting') {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      );
    }

    if (status === 'listening') {
      return (
        <div className="flex items-center justify-center w-full h-full animate-pulse">
          <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/>
          </svg>
        </div>
      );
    }

    if (isActive) {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v6a1 1 0 11-2 0V7zM12 9a1 1 0 10-2 0v2a1 1 0 102 0V9z" clipRule="evenodd"/>
          </svg>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center w-full h-full">
        <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/>
        </svg>
      </div>
    );
  };

  const getButtonStyles = () => {
    const baseStyles = "w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform focus:outline-none focus:ring-4";
    
    if (disabled) {
      return cn(baseStyles, "bg-gray-400 cursor-not-allowed focus:ring-gray-300");
    }

    if (isActive) {
      if (status === 'listening') {
        return cn(baseStyles, "bg-gradient-to-br from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 active:from-blue-700 active:to-green-700 hover:scale-105 active:scale-95 focus:ring-blue-300 animate-pulse");
      }
      return cn(baseStyles, "bg-red-500 hover:bg-red-600 active:bg-red-700 hover:scale-105 active:scale-95 focus:ring-red-300");
    }

    return cn(baseStyles, "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 hover:scale-105 active:scale-95 focus:ring-blue-300");
  };

  const getLabel = () => {
    if (status === 'connecting') return 'Connecting...';
    if (isActive) return 'End Conversation';
    return 'Start Conversation';
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <button 
          className={getButtonStyles()}
          onClick={onToggle}
          disabled={disabled}
          aria-label={getLabel()}
          data-testid="conversation-button"
        >
          {getButtonContent()}
        </button>
        
        {/* Voice Activity Indicator */}
        {status === 'listening' && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2" data-testid="voice-activity-indicator">
            <div className="flex space-x-1">
              <div className="w-1 h-4 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-1 h-6 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
              <div className="w-1 h-4 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Button Label */}
      <div className="space-y-2">
        <p className="text-lg font-medium text-gray-700" data-testid="button-label">{getLabel()}</p>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Hands-free operation with continuous listening. No need to click the microphone repeatedly.
        </p>
      </div>
    </div>
  );
}
