
// LegalEntities Table

import { fetchFilteredLegalEntities } from './le-actions';
import { ChartBarIcon, ChartPieIcon } from '@heroicons/react/20/solid';
import { BtnDeleteLegalEntity } from './le-btn-delete';


export default async function LegalEntitiesTable({
  query,
  currentPage,
  current_sections,
}: {
  query: string;
  currentPage: number;
  current_sections: string;
}) {

  const legalEntities = await fetchFilteredLegalEntities(query, currentPage, current_sections);
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
                    <th scope="col" className="w-7/16 overflow-hidden px-0 py-5 font-medium sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="w-1/8 px-3 py-5 font-medium">
                      Email
                    </th>
                    <th scope="col" className="w-1/8 px-3 py-5 font-medium">
                      Address
                    </th>
                    <th scope="col" className="w-1/8 px-3 py-5 font-medium">
                      Phone
                    </th>
                    <th scope="col" className="w-1/8 px-4 py-5 font-medium">
                      INN
                    </th>
                    <th scope="col" className="w-1/16 px-4 py-5 font-medium">

                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {legalEntities.map((legalEntity) => (
                    <tr key={legalEntity.id} className="group">
                      <td className="w-7/16 overflow-hidden whitespace-nowrap text-ellipsis bg-white py-1 pl-0 text-left  
                      pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-left gap-3">
                          {legalEntity.is_supplier ? <ChartPieIcon className="w-5" /> : <ChartBarIcon className="w-5" />}
                          <a
                            href={"/erp/legal-entities/" + legalEntity.id + "/edit"}
                            className="text-blue-800 underline"
                          >{legalEntity.name.substring(0, 36)}</a>
                        </div>
                      </td>
                      <td className="w-1/8 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                        {legalEntity.email}
                      </td>
                      <td className="w-1/8 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                        {legalEntity.address_legal}
                      </td>
                      <td className="w-1/8 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                        {legalEntity.phone}
                      </td>
                      <td className="w-1/8 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        {legalEntity.inn}
                      </td>
                      <td className="w-1/16 whitespace-nowrap pl-4 py-1 pr-3">
                        <div className="flex justify-end gap-3">
                          {/* <BtnEditTenantModal tenant={tenant} /> */}
                          <BtnDeleteLegalEntity legalEntity={legalEntity} />
                          {/* <BtnEditLegalEntityLink id={legalEntity.id} /> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>


              {/* Mobile Cards */}
              <div className="block md:hidden">
                {legalEntities.map((legalEntity) => (
                  <div
                    key={legalEntity.id}
                    className="mb-4 rounded-lg bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {legalEntity.is_supplier ? (
                        <ChartPieIcon className="w-5" />
                      ) : (
                        <ChartBarIcon className="w-5" />
                      )}
                      <a
                        href={"/erp/legal-entities/" + legalEntity.id + "/edit"}
                        className="text-blue-800 underline"
                      >
                        {legalEntity.name.substring(0, 36)}
                      </a>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <strong>Email:</strong> {legalEntity.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Address:</strong> {legalEntity.address_legal}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Phone:</strong> {legalEntity.phone}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>INN:</strong> {legalEntity.inn}
                      </p>
                    </div>
                    <div className="mt-3 flex justify-end gap-3">
                      <BtnDeleteLegalEntity legalEntity={legalEntity} />
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

