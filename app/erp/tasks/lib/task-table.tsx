// tasks-table.tsx

import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';

import { Task } from '@/app/lib/definitions';
import { fetchFilteredTasks } from './task-actions';
import { BtnDeleteTask, BtnEditTaskLink } from './task-buttons';

export default async function TasksTable({
  query,
  currentPage,
  current_sections,
}: {
  query: string;
  currentPage: number;
  current_sections: string;
}) {
  const tasks = await fetchFilteredTasks(query, currentPage);

  return (
    <div className="w-full">
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">

              {/* Таблица для больших экранов */}
              <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="w-4/12 px-4 py-5 font-medium sm:pl-6">Название</th>
                    <th scope="col" className="w-2/12 px-3 py-5 font-medium">Дата начала</th>
                    <th scope="col" className="w-2/12 px-3 py-5 font-medium">Дата окончания</th>
                    <th scope="col" className="w-2/12 px-3 py-5 font-medium">Периодичность</th>
                    <th scope="col" className="w-1/12 px-4 py-5 font-medium"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {tasks.map((task) => (
                    <tr key={task.id} className="group">
                      <td className="w-4/12 overflow-hidden whitespace-nowrap bg-white py-2 pl-6 pr-3 text-sm text-black">
                        <a
                          href={`/erp/tasks/${task.id}/edit`}
                          className="text-blue-800 underline"
                        >
                          {task.name}
                        </a>
                      </td>
                      <td className="w-2/12 overflow-hidden whitespace-nowrap bg-white px-3 py-2 text-sm">
                        {new Date(task.date_start).toLocaleDateString()}
                      </td>
                      <td className="w-2/12 overflow-hidden whitespace-nowrap bg-white px-3 py-2 text-sm">
                        {task.date_end ? new Date(task.date_end).toLocaleDateString() : '—'}
                      </td>
                      <td className="w-2/12 overflow-hidden whitespace-nowrap bg-white px-3 py-2 text-sm">
                        {task.is_periodic ? `${task.period_days} дн.` : 'Одноразовая'}
                      </td>
                      <td className="w-1/12 whitespace-nowrap py-2 pr-3">
                        <div className="flex justify-end gap-3">
                          <BtnEditTaskLink id={task.id} />
                          <BtnDeleteTask id={task.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Карточки для мобильных устройств */}
              <div className="md:hidden">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="mb-4 rounded-lg bg-white p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium text-blue-800 underline">
                        <a href={`/erp/tasks/${task.id}/edit`}>
                          {task.name}
                        </a>
                      </h3>
                      <div className="flex gap-2">
                        <BtnEditTaskLink id={task.id} />
                        <BtnDeleteTask id={task.id} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Дата начала</p>
                        <p className="text-sm font-medium">
                          {new Date(task.date_start).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Дата окончания</p>
                        <p className="text-sm font-medium">
                          {task.date_end ? new Date(task.date_end).toLocaleDateString() : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Периодичность</p>
                        <p className="text-sm font-medium">
                          {task.is_periodic ? `${task.period_days} дн.` : 'Нет'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}