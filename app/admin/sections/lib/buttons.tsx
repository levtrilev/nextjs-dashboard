import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { deleteSectionById } from './actions';
// import clsx from 'clsx';

export function BtnDeleteSection({ id }: { id: string }) {
  const deleteSectionWithId = deleteSectionById.bind(null, id);

  return (
    <form action={deleteSectionWithId}>
      <button className="rounded-md border border-gray-200 p-2 h-10 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5 h-5 text-gray-800" />
      </button>
    </form>
  );
}

export function BtnEditSectionLink({ id }: { id: string }) {
  const LinkIcon = PencilIcon;

  return (
    <Link
      href={`/admin/sections/${id}`}
      className='flex h-10 items-center justify-center space-x-2 rounded-md border border-gray-200 bg-white p-2 text-sm font-medium hover:bg-gray-100 md:flex-none md:justify-start md:p-2 md:px-3'
    >
      <LinkIcon className="w-5 h-5 text-gray-800" />
      <p className="hidden md:block text-gray-700">Edit</p>
    </Link>
  );
}