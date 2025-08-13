import { useState, useEffect } from "react";
import { useConversation } from "@/hooks/useConversation";
import { useMicrophone } from "@/hooks/useMicrophone";
import ConversationButton from "@/components/ConversationButton";
import StatusIndicator from "@/components/StatusIndicator";
import TechnicalStatus from "@/components/TechnicalStatus";
import PermissionModal from "@/components/PermissionModal";
import { useToast } from "@/hooks/use-toast";

export default function TutorPage() {
  const { toast } = useToast();
  const { hasPermission, requestPermission, micStatus } = useMicrophone();
  const { 
    conversationState, 
    systemStatus,
    audioStatus,
    startConversation, 
    stopConversation 
  } = useConversation();

  const [showPermissionModal, setShowPermissionModal] = useState(false);

  useEffect(() => {
    // Set page title
    document.title = "European Portuguese Tutor - Live Conversation";
  }, []);

  const handleConversationToggle = async () => {
    if (!hasPermission) {
      setShowPermissionModal(true);
      return;
    }

    try {
      if (conversationState.isActive) {
        await stopConversation();
        toast({
          title: "Conversation ended",
          description: "Your Portuguese lesson has ended successfully.",
        });
      } else {
        await startConversation();
        toast({
          title: "Conversation started",
          description: "Your Portuguese tutor is ready to help you learn!",
        });
      }
    } catch (error) {
      toast({
        title: "Connection error",
        description: error instanceof Error ? error.message : "Failed to connect to the conversation service.",
        variant: "destructive",
      });
    }
  };

  const handlePermissionRequest = async () => {
    try {
      await requestPermission();
      setShowPermissionModal(false);
      if (hasPermission) {
        await startConversation();
      }
    } catch (error) {
      toast({
        title: "Permission denied",
        description: "Microphone access is required for voice conversations.",
        variant: "destructive",
      });
      setShowPermissionModal(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">European Portuguese Tutor</h1>
                <p className="text-sm text-gray-500">Powered by Gemini 2.5 Native Live</p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${conversationState.isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} data-testid="connection-indicator"></div>
                <span className="text-sm text-gray-600" data-testid="connection-status">
                  {conversationState.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {/* Concurrent Sessions Counter */}
              <div className="hidden md:flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
                <span className="text-sm text-gray-600">
                  Sessions: <span className="font-medium" data-testid="session-count">{systemStatus.activeSessions}</span>/{systemStatus.maxSessions}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Main Interface */}
        <div className="text-center space-y-8">
          {/* Gemini 2.5 Verification Badge */}
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span className="text-sm font-medium">Verified: Gemini 2.5 Native Live API</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>

          {/* AI Status Display */}
          <StatusIndicator status={conversationState.status} />

          {/* Main Conversation Button */}
          <ConversationButton 
            isActive={conversationState.isActive}
            status={conversationState.status}
            onToggle={handleConversationToggle}
            disabled={conversationState.status === 'connecting'}
          />
        </div>

        {/* Feature Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">True Conversation</h3>
            <p className="text-sm text-gray-600">Ask unscripted questions naturally. I understand context and respond dynamically.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">European Portuguese</h3>
            <p className="text-sm text-gray-600">Authentic pronunciation and vocabulary from Portugal, not Brazilian Portuguese.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Ultra-Low Latency</h3>
            <p className="text-sm text-gray-600">Real-time responses with natural conversation flow. Interrupt me anytime!</p>
          </div>
        </div>

        {/* Technical Status */}
        <TechnicalStatus 
          audioStatus={audioStatus}
          systemStatus={systemStatus}
          conversationState={conversationState}
        />

        {/* Mobile Tips */}
        <div className="md:hidden mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-500 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
              </svg>
              <div>
                <h4 className="font-medium text-blue-900">Mobile Tips</h4>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Ensure microphone permissions are enabled</li>
                  <li>• Works best with headphones or earbuds</li>
                  <li>• Speak clearly and naturally</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Browser Support:</span>
              <div className="flex items-center space-x-2">
                <span>Chrome</span>
                <span>Firefox</span>
                <span>Safari</span>
                <span>Edge</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>No data storage • Real-time only • Privacy-first</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Permission Modal */}
      <PermissionModal 
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        onRequestPermission={handlePermissionRequest}
      />
    </div>
  );
}
