
// Premises Table

import BtnDeletePremise from './btn-delete-premise';
import { fetchFilteredPremises } from './premises-actions';

export default async function PremisesTable({
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

  const premises = await fetchFilteredPremises(query, currentPage, current_sections);

  return (
    <div className="w-full">
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
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
                  {premises.map((premise) => (
                    <tr key={premise.id} className="group">
                      <td className="w-4/16 overflow-hidden whitespace-nowrap text-ellipsis bg-white py-1 pl-0 text-left  
                      pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-left gap-3">
                          <a
                            href={"/erp/premises/" + premise.id + "/edit"}
                            className="text-blue-800 underline"
                          >{premise.name.substring(0, 36)}</a>
                        </div>
                      </td>
                      <td className="w-2/16 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                        {premise.cadastral_number}
                      </td>
                      <td className="w-2/16 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                        {premise.region_name}
                      </td>
                      <td className="w-4/16 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                        {premise.address}
                      </td>
                      <td className="w-2/16 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        {premise.section_name}
                      </td>
                      <td className="w-1/16 whitespace-nowrap pl-4 py-1 pr-3">
                        <div className="flex justify-end gap-3">
                          {showDeleteButton && <BtnDeletePremise id={premise.id} name={premise.name}/>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="block md:hidden">
                {premises.map((premise) => (
                  <div
                    key={premise.id}
                    className="mb-4 rounded-md bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between">
                        <span className="font-bold">Название:</span>
                        <a
                          href={"/erp/premises/" + premise.id + "/edit"}
                          className="text-blue-800 underline"
                        >
                          {premise.name.substring(0, 36)}
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold">Кадастровый номер:</span>
                        <span>{premise.cadastral_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold">Регион:</span>
                        <span>{premise.region_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold">Адрес:</span>
                        <span>{premise.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Раздел:</span>
                        <span>{premise.section_name}</span>
                        {showDeleteButton && <BtnDeletePremise id={premise.id} name={premise.name}/>}
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
