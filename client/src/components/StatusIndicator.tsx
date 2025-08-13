interface StatusIndicatorProps {
  status: 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking';
}

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  const renderStatus = () => {
    switch (status) {
      case 'idle':
        return (
          <div className="text-center" data-testid="status-idle">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">Ready to Practice Portuguese</h2>
            <p className="text-gray-600">Click the button below to start your conversation with your AI tutor</p>
          </div>
        );
      
      case 'connecting':
        return (
          <div className="text-center" data-testid="status-connecting">
            <h2 className="text-2xl md:text-3xl font-semibold text-blue-500 mb-2">
              Connecting<span className="animate-pulse">...</span>
            </h2>
            <p className="text-gray-600">Establishing connection with your Portuguese tutor</p>
          </div>
        );
      
      case 'listening':
        return (
          <div className="text-center" data-testid="status-listening">
            <h2 className="text-2xl md:text-3xl font-semibold text-blue-500 mb-2">
              Listening<ThinkingDots />
            </h2>
            <p className="text-gray-600">I'm listening to your question. Speak naturally!</p>
          </div>
        );
      
      case 'thinking':
        return (
          <div className="text-center" data-testid="status-thinking">
            <h2 className="text-2xl md:text-3xl font-semibold text-yellow-500 mb-2">
              Thinking<ThinkingDots />
            </h2>
            <p className="text-gray-600">Processing your request and preparing response</p>
          </div>
        );
      
      case 'speaking':
        return (
          <div className="text-center" data-testid="status-speaking">
            <h2 className="text-2xl md:text-3xl font-semibold text-green-500 mb-2">Speaking</h2>
            <p className="text-gray-600">Your tutor is responding. You can interrupt anytime!</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return <div className="space-y-4">{renderStatus()}</div>;
}

function ThinkingDots() {
  return (
    <span className="inline-block">
      <span className="animate-pulse">.</span>
      <span className="animate-pulse" style={{animationDelay: '0.5s'}}>.</span>
      <span className="animate-pulse" style={{animationDelay: '1s'}}>.</span>
    </span>
  );
}
