
// Premise buttons.tsx
'use client';
import { TrashIcon } from '@heroicons/react/24/outline';
import { deleteTaskSchedule } from './tsch-actions';
import MessageBoxSrv from '@/app/lib/message-box-srv';
import { useRef, useState } from 'react';

export default function BtnDeleteTaskSchedule({ id, name }: { id: string, name: string }) {
  // const deleteTaskScheduleWithId = deleteTaskSchedule.bind(null, id);
  const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false);
  const [messageBoxText, setMessageBoxText] = useState('');
  const idToDelete = useRef('');

  const askUserForDeleting = (id: string, nam: string) => {
    setIsMessageBoxOpen(true);
    idToDelete.current = id;
    setMessageBoxText(`План обслуживания: ${name} \nУдалить План обслуживания?`);
  };

  const deleteTaskScheduleWithId = askUserForDeleting.bind(null, id, name);

  const handleOK = () => {
    deleteTaskSchedule(idToDelete.current);
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
        onClick={deleteTaskScheduleWithId}
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
