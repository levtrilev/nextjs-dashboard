import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { deleteSectionById } from '@/app/lib/actions';
import clsx from 'clsx';

export function BtnDeleteSection({ id }: { id: string }) {
  const deleteSectionWithId = deleteSectionById.bind(null, id);

  return (
    <form action={deleteSectionWithId}>
      <button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}

export function BtnEditSectionLink({id}:{id:string}) {
  const LinkIcon = PencilIcon;

  // className="rounded-md border p-2 hover:bg-gray-100"
  // className={clsx(
  //   'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
  //   {
  //     'bg-sky-100 text-blue-600': true,
  //   },
  // )}
  return (
    <Link
      key={"Edit"}
      href={"/dashboard/admin/sections/"+id}
      className='flex h-[48px] grow items-center justify-center gap-2 rounded-md border p-2 bg-gray-50 p-3 text-sm font-medium hover:bg-gray-100 md:flex-none md:justify-start md:p-2 md:px-3'

    >
      <LinkIcon className="w-6" />
      <p className="hidden md:block">{"Edit"}</p>
    </Link>
  );
}