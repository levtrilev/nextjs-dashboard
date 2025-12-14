// TaskButtons.tsx

import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { updateMachine } from './machines-actions';
import Link from 'next/link';
import { Machine } from '@/app/lib/definitions';

export function CreateMachine({ readonly }: { readonly: boolean; }) {

  return (
    <Link
      href={!readonly ? "/repair/machines/create" : "#"}
      className={`flex h-10 items-center rounded-lg 
        ${readonly ? 'bg-gray-300 px-4 text-sm font-medium text-gray-500 transition-colors  hover:bg-gray-400'
          : ' bg-blue-600 px-4 text-sm font-medium text-white transition-colors  hover:bg-blue-500 '}
     focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
    >
      <span className="hidden md:block">Создать машину</span>
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function BtnUpdateMachine({ machine }: { machine: Machine }) {
  const updateMachineWithData = updateMachine.bind(null, machine);
  return (
    <form action={updateMachineWithData} className="w-full">
      <button
        type="submit"
        className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-100 hover:text-gray-500"
      >
        Save
      </button>
    </form>
  );
}

export function BtnEditMachineLink({ id }: { id: string }) {
  const LinkIcon = PencilIcon;
  return (
    <Link
      key={"Edit"}
      href={"/repair/machines/" + id + "/edit"}
      className='flex h-10 items-center justify-center space-x-2 rounded-md border border-gray-200 
      bg-white p-2 text-sm font-medium hover:bg-gray-100 md:flex-none md:justify-start md:p-2 md:px-3'
    >
      <LinkIcon className="w-5 h-5 text-gray-800" />
      <p className="hidden md:block text-gray-700">Edit</p>
    </Link>
  );
}