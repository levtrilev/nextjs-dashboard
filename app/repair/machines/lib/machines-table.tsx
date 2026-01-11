// machines-table.tsx
'use client';

import { fetchFilteredMachines } from './machines-actions';
import BtnDeleteMachine from './btn-delete-machine';
import { BtnEditMachineLink } from './machines-buttons';
import { useTabsStore } from '../../arm/tabsStore';
import { useEffect, useState } from 'react';

export default function MachinesTable({
  query,
  currentPage,
  current_sections,
  showDeleteButton = false,
}: {
  query: string;
  currentPage: number;
  current_sections: string;
  showDeleteButton?: boolean;
}) {
  const [machines, setMachines] = useState<Awaited<ReturnType<typeof fetchFilteredMachines>> | null>(null);
  const [loading, setLoading] = useState(true);
  const { statusTab } = useTabsStore(); // предполагается, что statusTab — строка или undefined
  const loadMachines = async () => {
    setLoading(true);
    try {
      const result = await fetchFilteredMachines(query, currentPage, current_sections, statusTab);
      setMachines(result);
    } catch (error) {
      console.error('Failed to fetch machines:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadMachines();
  }, [query, currentPage, current_sections, statusTab]);

  if (loading) {
    return <div className="p-4">Загрузка...</div>;
  }

  if (!machines) {
    return <div className="p-4">Нет данных</div>;
  }

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
                    <th scope="col" className="w-2/12 px-4 py-5 font-medium sm:pl-6">Машина</th>
                    <th scope="col" className="w-2/12 px-4 py-5 font-medium sm:pl-6">Модель</th>
                    <th scope="col" className="w-2/12 px-4 py-5 font-medium sm:pl-6">Номер</th>
                    <th scope="col" className="w-2/12 px-4 py-5 font-medium sm:pl-6">Участок</th>
                    <th scope="col" className="w-2/12 px-4 py-5 font-medium sm:pl-6">Состояние</th>
                    {/* <th scope="col" className="w-2/12 px-4 py-5 font-medium sm:pl-6">Наименование ремонта</th> */}
                    <th scope="col" className="w-2/12 px-4 py-5 font-medium sm:pl-6">Место</th>
                    <th scope="col" className="w-1/12 px-4 py-5 font-medium"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {machines.map((machine) => (
                    <tr key={machine.id} className="group">
                      <td className="w-2/12 overflow-hidden whitespace-nowrap bg-white py-2 pl-6 pr-3 text-sm text-black">
                        <a
                          href={`/repair/machines/${machine.id}/edit`}
                          className="text-blue-800 underline"
                        >
                          {machine.name}
                        </a>
                      </td>
                      <td className="w-2/16 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                        {machine.model}
                      </td>
                      <td className="w-2/12 overflow-hidden whitespace-nowrap bg-white py-2 pl-6 pr-3 text-sm text-black">
                        {machine.number}
                      </td>
                      <td className="w-2/12 overflow-hidden whitespace-nowrap bg-white py-2 pl-6 pr-3 text-sm text-black">
                        {machine.unit_name}
                      </td>
                      <td className="w-2/12 overflow-hidden whitespace-nowrap bg-white py-2 pl-6 pr-3 text-sm text-black">
                        {machine.machine_status}
                      </td>
                      <td className="w-2/12 overflow-hidden whitespace-nowrap bg-white py-2 pl-6 pr-3 text-sm text-black">
                        {machine.location_name}
                      </td>
                      <td className="w-1/12 whitespace-nowrap py-2 pr-3">
                        <div className="flex justify-end gap-3">
                          {showDeleteButton && <BtnDeleteMachine id={machine.id} name={machine.name} onDelete={loadMachines}/>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Карточки для мобильных устройств */}
              <div className="md:hidden">
                {machines.map((machine) => (
                  <div
                    key={machine.id}
                    className="mb-4 rounded-lg bg-white p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium text-blue-800 underline">
                        <a href={`/repair/machines/${machine.id}/edit`}>
                          {machine.name}
                        </a>
                      </h3>
                      <div className="flex gap-2">
                        <BtnEditMachineLink id={machine.id} />
                        {showDeleteButton && <BtnDeleteMachine id={machine.id} name={machine.name} onDelete={loadMachines} />}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {/* здесь можно добавить остальные поля, если нужно */}
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
