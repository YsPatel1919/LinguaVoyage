interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestPermission: () => void;
}

export default function PermissionModal({ 
  isOpen, 
  onClose, 
  onRequestPermission 
}: PermissionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="permission-modal">
      <div className="bg-white rounded-xl p-6 max-w-md mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Microphone Access Required</h3>
          <p className="text-gray-600 mb-6">This app needs microphone access to have voice conversations with your Portuguese tutor.</p>
          <div className="flex space-x-3">
            <button 
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors" 
              onClick={onClose}
              data-testid="permission-cancel-button"
            >
              Cancel
            </button>
            <button 
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              onClick={onRequestPermission}
              data-testid="permission-allow-button"
            >
              Allow Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
