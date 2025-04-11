
// Regions Table

import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import {
  CustomersTableType,
  FormattedCustomersTable,
} from '@/app/lib/definitions';
import { fetchFilteredRegions } from './region-actions';
import { ChartBarIcon, ChartPieIcon } from '@heroicons/react/20/solid';
import { BtnDeleteRegion, BtnEditRegionLink } from './region-buttons';

export default async function RegionsTable({
  query,
  currentPage,
  current_sections,
}: {
  query: string;
  currentPage: number;
  current_sections: string;
}) {

  const regions = await fetchFilteredRegions(query, currentPage, current_sections);

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
                    <th scope="col" className="w-4/16 overflow-hidden px-0 py-5 font-medium sm:pl-6">
                      Название
                    </th>
                    <th scope="col" className="w-4/16 px-3 py-5 font-medium">
                      Столица
                    </th>
                    <th scope="col" className="w-3/16 px-3 py-5 font-medium">
                      Округ
                    </th>
                    <th scope="col" className="w-1/16 px-3 py-5 font-medium">
                      Код
                    </th>
                    <th scope="col" className="w-4/16 px-4 py-5 font-medium">
                      Раздел
                    </th>
                    <th scope="col" className="w-1/16 px-4 py-5 font-medium">

                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {regions.map((region) => (
                    <tr key={region.id} className="group">
                      <td className="w-4/16 overflow-hidden whitespace-nowrap text-ellipsis bg-white py-1 pl-0 text-left  
                      pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-left gap-3">
                          <a
                            href={"/erp/regions/" + region.id + "/edit"}
                            className="text-blue-800 underline"
                          >{region.name.substring(0, 36)}</a>
                        </div>
                      </td>
                      <td className="w-4/16 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                        {region.capital}
                      </td>
                      <td className="w-3/16 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                        {region.area}
                      </td>
                      <td className="w-1/16 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                        {region.code}
                      </td>
                      <td className="w-4/16 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        {region.section_name}
                      </td>
                      <td className="w-1/16 whitespace-nowrap pl-4 py-1 pr-3">
                        <div className="flex justify-end gap-3">
                          {/* <BtnEditTenantModal tenant={tenant} /> */}
                          <BtnDeleteRegion id={region.id} />
                          {/* <BtnEditLegalEntityLink id={legalEntity.id} /> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Карточки для мобильных устройств */}
              <div className="md:hidden">
                {regions.map((region) => (
                  <div
                    key={region.id}
                    className="mb-4 rounded-lg bg-white p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium text-blue-800 underline">
                        <a href={"/erp/regions/" + region.id + "/edit"}>
                          {region.name.substring(0, 36)}
                        </a>
                      </h3>
                      <div className="flex gap-2">
                        <BtnDeleteRegion id={region.id} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-1">
                        <p className="text-sm text-gray-500">Столица</p>
                        <p className="text-sm font-medium">{region.capital}</p>
                      </div>
                      <div className="col-span-1">
                        <p className="text-sm text-gray-500">Округ</p>
                        <p className="text-sm font-medium">{region.area}</p>
                      </div>
                      <div className="col-span-1">
                        <p className="text-sm text-gray-500">Код</p>
                        <p className="text-sm font-medium">{region.code}</p>
                      </div>
                      <div className="col-span-1">
                        <p className="text-sm text-gray-500">Раздел</p>
                        <p className="text-sm font-medium">{region.section_name}</p>
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


{/* <div className="md:hidden">
{regions?.map((region) => (
  <div
    key={region.id}
    className="mb-2 w-full rounded-md bg-white p-4"
  >
    <div className="flex items-center justify-between border-b pb-4">
      <div>
        <div className="mb-2 flex items-center">
          <div className="flex items-center gap-3">
            <p>{region.name}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {region.capital}
        </p>
      </div>
    </div>
    <div className="flex w-full items-center justify-between border-b py-5">
      <div className="flex w-1/2 flex-col">
        <p className="text-xs">Округ</p>
        <p className="font-medium">{region.area}</p>
      </div>
      <div className="flex w-1/2 flex-col">
        <p className="text-xs">Код</p>
        <p className="font-medium">{region.code}</p>
      </div>
    </div>
  </div>
))}
</div> */}