
// TaskSchedules Table

import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import { fetchFilteredTaskSchedules } from './taskSchedulesActions';
import { ChartBarIcon, ChartPieIcon } from '@heroicons/react/20/solid';
import { TaskScheduleForm } from '@/app/lib/definitions';
import BtnDeleteTaskSchedule from './BtnDeleteTaskSchedule';

export default async function TaskSchedulesTable({
  query,
  currentPage,
  current_sections,
}: {
  query: string;
  currentPage: number;
  current_sections: string;
}) {
  const taskSchedules = await fetchFilteredTaskSchedules(query, currentPage, current_sections);

  return (
    <div className="w-full">
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">

              {/* Desktop Table */}
              <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="w-4/16 overflow-hidden px-0 py-5 font-medium sm:pl-6">
                      План
                    </th>
                    <th scope="col" className="w-2/16 px-3 py-5 font-medium">
                      Помещение
                    </th>
                    <th scope="col" className="w-2/16 px-3 py-5 font-medium">
                      Владелец
                    </th>
                    <th scope="col" className="w-4/16 px-3 py-5 font-medium">
                      Действует с
                    </th>
                    <th scope="col" className="w-2/16 px-4 py-5 font-medium">
                      Раздел
                    </th>
                    <th scope="col" className="w-1/16 px-4 py-5 font-medium"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {taskSchedules.map((taskSchedule) => (
                    <tr key={taskSchedule.id} className="group">
                      <td className="w-4/16 overflow-hidden whitespace-nowrap text-ellipsis bg-white py-1 pl-0 text-left pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-left gap-3">
                          <a
                            href={"/erp/task-schedules/" + taskSchedule.id + "/edit"}
                            className="text-blue-800 underline"
                          >
                            {taskSchedule.name.substring(0, 36)}
                          </a>
                        </div>
                      </td>
                      <td className="w-2/16 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                        {taskSchedule.premise_name}
                      </td>
                      <td className="w-2/16 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                        {taskSchedule.schedule_owner_name}
                      </td>
                      <td className="w-4/16 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                        {taskSchedule.date_start.toISOString().substring(0, 10)}
                      </td>
                      <td className="w-2/16 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        {taskSchedule.section_name}
                      </td>
                      <td className="w-1/16 whitespace-nowrap pl-4 py-1 pr-3">
                        <div className="flex justify-end gap-3">
                          <BtnDeleteTaskSchedule id={taskSchedule.id} name={taskSchedule.name}/>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile List */}
              <div className="md:hidden">
                {taskSchedules.length === 0 ? (
                  <p className="text-center text-gray-500">Нет данных</p>
                ) : (
                  taskSchedules.map((taskSchedule) => (
                    <div
                      key={taskSchedule.id}
                      className="mb-4 rounded-md bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-col space-y-2">
                        <div className="flex justify-between">
                          <span className="font-bold">План:</span>
                          <a
                            href={"/erp/task-schedules/" + taskSchedule.id + "/edit"}
                            className="text-blue-800 underline"
                          >
                            {taskSchedule.name.substring(0, 36)}
                          </a>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold">Помещение:</span>
                          <span>{taskSchedule.premise_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold">Владелец:</span>
                          <span>{taskSchedule.schedule_owner_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold">Начало действия:</span>
                          <span>{taskSchedule.date_start.toISOString().substring(0, 10)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Раздел:</span>
                          <span>{taskSchedule.section_name}</span>
                          <BtnDeleteTaskSchedule id={taskSchedule.id} name={taskSchedule.name}/>
                        </div>

                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
