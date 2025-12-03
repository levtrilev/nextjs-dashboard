'use client';
import { TrashIcon } from '@heroicons/react/24/outline';
import { deleteLegalEntity, updateLegalEntity } from './le-actions';
import { LegalEntity } from '@/app/lib/definitions';
import { useRef, useState } from 'react';
import MessageBoxSrv from '@/app/lib/message-box-srv';

export function BtnDeleteLegalEntity({ legalEntity }: { legalEntity: LegalEntity }) {
  const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false);
  const [messageBoxText, setMessageBoxText] = useState('');
  const idToDelete = useRef('');
  const askUserForDeleting = (id: string) => {
    setIsMessageBoxOpen(true);
    idToDelete.current = id;
    setMessageBoxText(`Юридическое лицо: ${legalEntity.name} \nУдалить Юридическое лицо?`);
  };
  const deleteLegalEntityWithId = askUserForDeleting.bind(null, legalEntity.id);
  // const deleteLegalEntityWithId = deleteLegalEntity.bind(null, id);
  const handleOK = () => {
    deleteLegalEntity(idToDelete.current);
    setIsMessageBoxOpen(false);
  }
  const handleCancel = () => {
    setIsMessageBoxOpen(false);
  }
  return (
    <form action={deleteLegalEntityWithId}>
      <button className="rounded-md border border-gray-200 p-2 h-10 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5 h-5 text-gray-800" />
      </button>
      <MessageBoxSrv isMessageBoxOpen={isMessageBoxOpen} messageBoxText={messageBoxText} isShowCancel={true} isShowOk={true} cbOk={handleOK} cbCancel={handleCancel} />
    </form>
  );
}