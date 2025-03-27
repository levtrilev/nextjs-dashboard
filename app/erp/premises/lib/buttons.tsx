
// Premise buttons.tsx

import { PencilIcon, PlusIcon, TrashIcon, ServerIcon } from '@heroicons/react/24/outline';
import { deletePremise, updatePremise } from './actions';
import Link from "next/link";
import { Premise, Region } from '@/app/lib/definitions';

export function CreatePremise() {
  return (
    <Link
      href="/erp/premises/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Создать Помещение</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}
export function BtnUpdatePremise({ premise }: { premise: Premise }) {
  const updatePremiseWithData = updatePremise.bind(null, premise);
  return (
    <form action={updatePremiseWithData} className="w-full">
      <button className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-100 hover:text-gray-500">
        Save
      </button>
    </form>
  );
}

export function BtnDeletePremise({ id }: { id: string }) {
  const deletePremiseWithId = deletePremise.bind(null, id);

  return (
    <form action={deletePremiseWithId}>
      <button className="rounded-md border border-gray-200 p-2 h-10 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5 h-5 text-gray-800" />
      </button>
    </form>
  );
}

export function BtnEditPremiseLink({ id }: { id: string }) {
  const LinkIcon = PencilIcon;
  return (
    <Link
      key={"Edit"}
      href={"/erp/regions/" + id + "/edit"}
      className='flex h-10 items-center justify-center space-x-2 rounded-md border border-gray-200 
      bg-white p-2 text-sm font-medium hover:bg-gray-100 md:flex-none md:justify-start md:p-2 md:px-3'
    >
      <LinkIcon className="w-5 h-5 text-gray-800" />
      <p className="hidden md:block text-gray-700">Edit</p>
    </Link>
  );
}
