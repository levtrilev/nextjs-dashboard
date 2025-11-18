// components/ConfirmModal.tsx
import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
//   onConfirm: () => void; // Функция, вызываемая при "OK"
  onCancel: () => void;  // Функция, вызываемая при "Cancel"
}

const MessageBoxOKCancel: React.FC<ConfirmModalProps> = (props: ConfirmModalProps) => {
  if (!props.isOpen) return null; // Не рендерим, если модальное окно не открыто

  return (
    // <div id ="message-box" className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50 style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}">
    <div id ="message-box" className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <p className="text-lg mb-4">{props.message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={()=> props.onCancel() }
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={()=> props.onCancel() }
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageBoxOKCancel;