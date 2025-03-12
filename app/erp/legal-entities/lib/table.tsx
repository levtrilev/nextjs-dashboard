
// LegalEntities Table

import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import {
  CustomersTableType,
  FormattedCustomersTable,
} from '@/app/lib/definitions';
import { fetchFilteredLegalEntities } from './actions';
import { ChartBarIcon, ChartPieIcon } from '@heroicons/react/20/solid';
import { BtnDeleteLegalEntity, BtnEditLegalEntityLink } from './buttons';

export default async function CustomersTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {

  // const customers = await fetchFilteredLegalEntities(query, currentPage) as any[];
  // legalEntities
  const legalEntities = await fetchFilteredLegalEntities(query, currentPage);

  return (
    <div className="w-full">
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
              <div className="md:hidden">
                {legalEntities?.map((legalEntity) => (
                  <div
                    key={legalEntity.id}
                    className="mb-2 w-full rounded-md bg-white p-4"
                  >
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <div className="mb-2 flex items-center">
                          <div className="flex items-center gap-3">
                            <p>{legalEntity.name}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {legalEntity.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-between border-b py-5">
                      <div className="flex w-1/2 flex-col">
                        <p className="text-xs">Address</p>
                        <p className="font-medium">{legalEntity.address_legal}</p>
                      </div>
                      <div className="flex w-1/2 flex-col">
                        <p className="text-xs">Phone</p>
                        <p className="font-medium">{legalEntity.phone}</p>
                      </div>
                    </div>
                    <div className="pt-4 text-sm">
                      <p>{legalEntity.inn} INN</p>
                    </div>
                  </div>
                ))}
              </div>
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
                          <BtnDeleteLegalEntity id={legalEntity.id} />
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

// {
//   customers,
// }: {
//   customers: FormattedCustomersTable[];
// }

{/* <button className="rounded-md border border-gray-200 p-2 h-10 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"> */ }
