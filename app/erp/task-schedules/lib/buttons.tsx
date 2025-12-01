
// Premise buttons.tsx

import { PencilIcon, PlusIcon, TrashIcon, ServerIcon } from '@heroicons/react/24/outline';
import { deleteTaskSchedule, updateTaskSchedule } from './taskSchedulesActions';
import Link from "next/link";
import { Premise, TaskSchedule } from '@/app/lib/definitions';

export function CreateTaskSchedule() {
  return (
    <Link
      href="/erp/task-schedules/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Создать План обслуживания</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}
export function BtnUpdateTaskSchedule({ taskSchedule }: { taskSchedule: TaskSchedule }) {
  const updateTaskScheduleWithData = updateTaskSchedule.bind(null, taskSchedule);
  return (
    <form action={updateTaskScheduleWithData} className="w-full">
      <button className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-100 hover:text-gray-500">
        Save
      </button>
    </form>
  );
}

export function BtnEditTaskScheduleLink({ id }: { id: string }) {
  const LinkIcon = PencilIcon;
  return (
    <Link
      key={"Edit"}
      href={"/erp/task-schedules/" + id + "/edit"}
      className='flex h-10 items-center justify-center space-x-2 rounded-md border border-gray-200 
      bg-white p-2 text-sm font-medium hover:bg-gray-100 md:flex-none md:justify-start md:p-2 md:px-3'
    >
      <LinkIcon className="w-5 h-5 text-gray-800" />
      <p className="hidden md:block text-gray-700">Edit</p>
    </Link>
  );
}
