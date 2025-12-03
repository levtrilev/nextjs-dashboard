
// Premise Delete button

'use client';
import { TrashIcon } from '@heroicons/react/24/outline';
import { deletePremise } from './premises-actions';
import { useState, useRef } from 'react';
import MessageBoxSrv from '@/app/lib/message-box-srv';

export default function BtnDeletePremise({ id, name }: { id: string, name: string }) {
  const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false);
  const [messageBoxText, setMessageBoxText] = useState('');
  const idToDelete = useRef('');

  const askUserForDeleting = (premiseId: string, premiseName: string) => {
    setIsMessageBoxOpen(true);
    idToDelete.current = premiseId;
    setMessageBoxText(`Помещение: ${premiseName} \nУдалить помещение?`);
  };

  const deletePremiseWithId = askUserForDeleting.bind(null, id, name);

  const handleOK = () => {
    deletePremise(idToDelete.current);
    setIsMessageBoxOpen(false);
  };

  const handleCancel = () => {
    setIsMessageBoxOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="rounded-md border border-gray-200 p-2 h-10 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={deletePremiseWithId}
      >
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5 h-5 text-gray-800" />
      </button>
      <MessageBoxSrv
        isMessageBoxOpen={isMessageBoxOpen}
        messageBoxText={messageBoxText}
        isShowCancel={true}
        isShowOk={true}
        cbOk={handleOK}
        cbCancel={handleCancel}
      />
    </>
  );
}