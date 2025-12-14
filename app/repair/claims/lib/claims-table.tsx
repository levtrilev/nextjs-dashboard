// claims-table.tsx

import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';

import { Claim } from '@/app/lib/definitions';
import { fetchFilteredClaims } from './claims-actions';
import BtnDeleteClaim from './btn-delete-claim';
import { BtnEditClaimLink } from './claims-buttons';

export default async function ClaimsTable({
  query,
  currentPage,
  current_sections,
}: {
  query: string;
  currentPage: number;
  current_sections: string;
}) {
  const claims = await fetchFilteredClaims(query, currentPage);

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
                  {claims.map((claim) => (
                    <tr key={claim.id} className="group">
                      <td className="w-4/12 overflow-hidden whitespace-nowrap bg-white py-2 pl-6 pr-3 text-sm text-black">
                        <a
                          href={`/repair/claims/${claim.id}/edit`}
                          className="text-blue-800 underline"
                        >
                          {claim.name}
                        </a>
                      </td>

                      <td className="w-1/12 whitespace-nowrap py-2 pr-3">
                        <div className="flex justify-end gap-3">
                          <BtnDeleteClaim id={claim.id} name={claim.name} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Карточки для мобильных устройств */}
              <div className="md:hidden">
                {claims.map((claim) => (
                  <div
                    key={claim.id}
                    className="mb-4 rounded-lg bg-white p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium text-blue-800 underline">
                        <a href={`/erp/claims/${claim.id}/edit`}>
                          {claim.name}
                        </a>
                      </h3>
                      <div className="flex gap-2">
                        <BtnEditClaimLink id={claim.id} />
                        <BtnDeleteClaim id={claim.id} name={claim.name} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Здесь можно добавить дополнительные поля заявки, если понадобится */}
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