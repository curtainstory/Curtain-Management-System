
import React from 'react';

interface CustomAlertProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity" aria-modal="true" role="dialog">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 transform transition-all scale-95 opacity-0 animate-fade-in-scale">
        <p className="text-gray-700 text-center mb-4">{message}</p>
        <button
          onClick={onClose}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          OK
        </button>
      </div>
       <style>{`
          @keyframes fade-in-scale {
            0% { transform: scale(0.95); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-fade-in-scale {
            animation: fade-in-scale 0.2s ease-out forwards;
          }
        `}</style>
    </div>
  );
};

export default CustomAlert;
