import { TaskSchedule } from "@/app/lib/definitions";
import RefSearch from "@/app/ui/ref-search";
import { useState } from "react";

interface ITaskScheduleRefTableProps {
  taskSchedules: TaskSchedule[];
  handleSelectTaskSchedule: (id: string, name: string) => void;
  closeModal: () => void;
  setTerm: (value: string) => void;
  term: string;
}

export default function TaskScheduleRefTable({
  taskSchedules,
  handleSelectTaskSchedule,
  closeModal,
  setTerm,
  term,
}: ITaskScheduleRefTableProps) {

  const handleSearch = (input: string) => {
    setTerm(input);
  };

  return (
    <div className="w-full">
      <p>Выберите расписание:</p>
      <RefSearch callback={handleSearch} term={term} elementIdPrefix="" />

      <div className="mt-0 flow-root">
        {/* Таблица для больших экранов */}
        <div className="overflow-x-auto md:block hidden">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-1 md:pt-0">
              <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="w-1/3 overflow-hidden px-0 py-5 font-medium sm:pl-6">
                      Название
                    </th>
                    <th scope="col" className="w-1/3 overflow-hidden px-3 py-5 font-medium">
                      Описание
                    </th>
                    <th scope="col" className="w-1/6 overflow-hidden px-3 py-5 font-medium">
                      Дата начала
                    </th>
                    <th scope="col" className="w-1/6 overflow-hidden px-3 py-5 font-medium">
                      Дата окончания
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            {/* Область прокрутки */}
            <div className="max-h-[300px] overflow-y-auto rounded-md bg-gray-50 p-2 md:pt-0">
              <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {taskSchedules
                    .filter((task) =>
                      task.name.toLowerCase().includes(term.toLowerCase()) ||
                      task.description?.toLowerCase().includes(term.toLowerCase()) ||
                      term.length === 0
                    )
                    .map((task) => (
                      <tr key={task.id} className="group">
                        <td className="w-1/3 overflow-hidden whitespace-nowrap text-ellipsis bg-white py-1 pl-0 text-left pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                          <div className="flex items-left gap-3">
                            <a
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSelectTaskSchedule(task.id, task.name);
                                setTerm("");
                                closeModal();
                              }}
                              className="text-blue-800 underline cursor-pointer hover:text-blue-600"
                            >
                              {task.name.substring(0, 36)}
                            </a>
                          </div>
                        </td>
                        <td className="w-1/3 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                          {task.description || "-"}
                        </td>
                        <td className="w-1/6 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                          {new Date(task.date_start).toLocaleDateString()}
                        </td>
                        <td className="w-1/6 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                          {new Date(task.date_end).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Список для маленьких экранов */}
        <div className="block md:hidden">
          <div className="max-h-[300px] overflow-y-auto rounded-md bg-gray-50 p-2">
            {taskSchedules
              .filter((task) =>
                task.name.toLowerCase().includes(term.toLowerCase()) ||
                task.description?.toLowerCase().includes(term.toLowerCase()) ||
                term.length === 0
              )
              .map((task) => (
                <div
                  key={task.id}
                  className="border-b border-gray-200 bg-white p-4 text-sm text-gray-900 last:border-b-0"
                >
                  <div className="font-medium text-black">
                    <a
                      onClick={() => {
                        handleSelectTaskSchedule(task.id, task.name);
                        setTerm("");
                        closeModal();
                      }}
                      className="text-blue-800 underline cursor-pointer hover:text-blue-600"
                    >
                      {task.name.substring(0, 36)}
                    </a>
                  </div>
                  <div className="text-gray-500">{task.description || "-"}</div>
                  <div className="text-gray-500">
                    {new Date(task.date_start).toLocaleDateString()} —{" "}
                    {new Date(task.date_end).toLocaleDateString()}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}