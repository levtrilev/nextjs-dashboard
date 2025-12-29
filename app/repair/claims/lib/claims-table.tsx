// claims-table.tsx
'use client';

import { useEffect, useState } from 'react';
import { ClaimForm } from '@/app/lib/definitions';
import { fetchFilteredClaims } from './claims-actions';
import BtnDeleteClaim from './btn-delete-claim';
import { BtnEditClaimLink } from './claims-buttons';

export default function ClaimsTable({
  query,
  currentPage,
  current_sections,
  machine_id = '00000000-0000-0000-0000-000000000000',
}: {
  query: string;
  currentPage: number;
  current_sections: string;
  machine_id: string;
}) {
  const [claims, setClaims] = useState<ClaimForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const loadClaims = async () => {
      try {
        setLoading(true);
        const data = await fetchFilteredClaims(query, currentPage, current_sections, machine_id);
        setClaims(data);
      } catch (err) {
        setError('Не удалось загрузить заявки');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    loadClaims();
  }, [query, currentPage, current_sections, machine_id]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (claims.length === 0) return <div className='mt-4'>Нет заявок</div>;

  return (
    <div id="claims-table" className="w-full">
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">

              {/* Таблица для больших экранов */}
              <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="w-2/12 px-4 py-5 font-medium sm:pl-6">ЗАЯВКИ</th>
                    <th scope="col" className="w-2/12 px-4 py-5 font-medium">Дата</th>
                    <th scope="col" className="w-2/12 px-4 py-5 font-medium">Машина</th>
                    <th scope="col" className="w-4/12 px-4 py-5 font-medium">Причина постановки в ремонт</th>
                    <th scope="col" className="w-2/12 px-4 py-5 font-medium">Участок</th>
                    {/* <th scope="col" className="w-2/12 px-4 py-5 font-medium">Состояние</th> */}
                    <th scope="col" className="w-2/12 px-4 py-5 font-medium">Характер ремонта</th>
                    <th scope="col" className="w-2/12 px-4 py-5 font-medium">Приоритет</th>
                    <th scope="col" className="w-1/12 px-4 py-5 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {claims.map((claim) => (
                    <tr key={claim.id} className="group">
                      <td className="w-2/12 overflow-hidden whitespace-nowrap bg-white py-2 pl-6 pr-3 text-sm text-black">
                        <a
                          href={`/repair/claims/${claim.id}/edit`}
                          className="text-blue-800 underline"
                        >
                          {claim.name}
                        </a>
                      </td>
                      <td className="w-2/12 overflow-hidden whitespace-nowrap bg-white py-2 pl-6 pr-3 text-sm text-black">
                        {new Date(claim.claim_date).toLocaleDateString()}
                      </td>
                      <td className="w-2/12 overflow-hidden whitespace-nowrap bg-white py-2 pl-6 pr-3 text-sm text-black">
                        {claim.machine_name}
                      </td>
                      <td className="w-4/12 overflow-hidden whitespace-nowrap bg-white py-2 pl-6 pr-3 text-sm text-black">
                        {claim.repair_reason}
                      </td>                      
                      <td className="w-2/12 overflow-hidden whitespace-nowrap bg-white py-2 pl-6 pr-3 text-sm text-black">
                        {claim.machine_unit_name}
                      </td>
                      {/* <td className="w-1/12 overflow-hidden whitespace-nowrap bg-white py-2 pl-6 pr-3 text-sm text-black">
                        {claim.machine_machine_status}
                      </td> */}
                      <td className="w-4/12 overflow-hidden whitespace-nowrap bg-white py-2 pl-6 pr-3 text-sm text-black">
                        {claim.repair_todo}
                      </td>
                      <td className="w-2/12 overflow-hidden whitespace-nowrap bg-white py-2 pl-6 pr-3 text-sm text-black">
                        {claim.priority}
                      </td>
                      <td className="w-1/12 whitespace-nowrap py-2 pr-3">
                        <div className="flex justify-end gap-3">
                          <BtnDeleteClaim id={claim.id} name={claim.name} onDelete={loadClaims} />
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
                        <BtnDeleteClaim id={claim.id} name={claim.name} onDelete={loadClaims} />
                      </div>
                    </div>
                    {/* Дополнительные поля можно добавить по желанию */}
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
