
// TaskSchedules Table

import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import { fetchFilteredTaskSchedules } from './taskSchedulesActions';
import { ChartBarIcon, ChartPieIcon } from '@heroicons/react/20/solid';
import { BtnDeleteTaskSchedule, BtnEditTaskScheduleLink } from './buttons';
import { TaskScheduleForm } from '@/app/lib/definitions';

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
              <div className="md:hidden">
                {taskSchedules?.map((taskSchedule) => (
                  <div
                    key={taskSchedule.id}
                    className="mb-2 w-full rounded-md bg-white p-4"
                  >
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <div className="mb-2 flex items-center">
                          <div className="flex items-center gap-3">
                            <p>{taskSchedule.name}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {taskSchedule.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-between border-b py-5">
                      <div className="flex w-1/2 flex-col">
                        <p className="text-xs">Округ</p>
                        <p className="font-medium">{taskSchedule.schedule_owner_name}</p>
                      </div>
                      <div className="flex w-1/2 flex-col">
                        <p className="text-xs">Код</p>
                        <p className="font-medium">{taskSchedule.date_start.toISOString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="w-4/16 overflow-hidden px-0 py-5 font-medium sm:pl-6">
                      Название
                    </th>
                    <th scope="col" className="w-2/16 px-3 py-5 font-medium">
                      Кадастровый номер
                    </th>
                    <th scope="col" className="w-2/16 px-3 py-5 font-medium">
                      Регион
                    </th>
                    <th scope="col" className="w-4/16 px-3 py-5 font-medium">
                      Адрес
                    </th>
                    <th scope="col" className="w-2/16 px-4 py-5 font-medium">
                      Раздел
                    </th>
                    <th scope="col" className="w-1/16 px-4 py-5 font-medium">

                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {taskSchedules.map((taskSchedule) => (
                    <tr key={taskSchedule.id} className="group">
                      <td className="w-4/16 overflow-hidden whitespace-nowrap text-ellipsis bg-white py-1 pl-0 text-left  
                      pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-left gap-3">
                          <a
                            href={"/erp/task-schedules/" + taskSchedule.id + "/edit"}
                            className="text-blue-800 underline"
                          >{taskSchedule.name.substring(0, 36)}</a>
                        </div>
                      </td>
                      <td className="w-2/16 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                        {taskSchedule.description}
                      </td>
                      <td className="w-2/16 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                        {taskSchedule.schedule_owner_name}
                      </td>
                      <td className="w-4/16 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                        {taskSchedule.date_start.toISOString()}
                      </td>
                      <td className="w-2/16 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        {taskSchedule.section_name}
                      </td>
                      <td className="w-1/16 whitespace-nowrap pl-4 py-1 pr-3">
                        <div className="flex justify-end gap-3">
                          {/* <BtnEditTenantModal tenant={tenant} /> */}
                          <BtnDeleteTaskSchedule id={taskSchedule.id} />
                          {/* <BtnEditLegalEntityLink id={legalEntity.id} /> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
