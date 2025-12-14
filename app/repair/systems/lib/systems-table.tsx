// systems-table.tsx

import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';

import { System } from '@/app/lib/definitions';
import { fetchFilteredSystems } from './systems-actions';
import BtnDeleteSystem from './btn-delete-system';
import { BtnEditSystemLink } from './systems-buttons';

export default async function SystemsTable({
  query,
  currentPage,
  current_sections,
}: {
  query: string;
  currentPage: number;
  current_sections: string;
}) {
  const systems = await fetchFilteredSystems(query, currentPage);

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
                    <th scope="col" className="w-1/12 px-4 py-5 font-medium"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {systems.map((system) => (
                    <tr key={system.id} className="group">
                      <td className="w-4/12 overflow-hidden whitespace-nowrap bg-white py-2 pl-6 pr-3 text-sm text-black">
                        <a
                          href={`/repair/systems/${system.id}/edit`}
                          className="text-blue-800 underline"
                        >
                          {system.name}
                        </a>
                      </td>

                      <td className="w-1/12 whitespace-nowrap py-2 pr-3">
                        <div className="flex justify-end gap-3">
                          <BtnDeleteSystem id={system.id} name={system.name} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Карточки для мобильных устройств */}
              <div className="md:hidden">
                {systems.map((system) => (
                  <div
                    key={system.id}
                    className="mb-4 rounded-lg bg-white p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium text-blue-800 underline">
                        <a href={`/repair/systems/${system.id}/edit`}>
                          {system.name}
                        </a>
                      </h3>
                      <div className="flex gap-2">
                        <BtnEditSystemLink id={system.id} />
                        <BtnDeleteSystem id={system.id} name={system.name} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">

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