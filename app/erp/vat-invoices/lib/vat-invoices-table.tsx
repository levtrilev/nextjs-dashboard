import { lusitana } from '@/app/ui/fonts';
import { VATInvoice } from '@/app/lib/definitions';
import { fetchFilteredVatInvoices } from './vat-invoice-actions';
import BtnDeleteVatInvoice from './btn-delete-vat-invoice';
import { BtnEditVatInvoiceLink } from './vat-invoice-buttons';

export default async function VatInvoicesTable({
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
  const vatInvoices = await fetchFilteredVatInvoices(query, currentPage, current_sections);

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
                  {vatInvoices.map((invoice) => (
                    <tr key={invoice.id} className="group">
                      <td className="w-4/12 overflow-hidden whitespace-nowrap bg-white py-2 pl-6 pr-3 text-sm text-black">
                        <a
                          href={`/erp/vat-invoices/${invoice.id}/edit`}
                          className="text-blue-800 underline"
                        >
                          {invoice.name}
                        </a>
                      </td>
                      <td className="w-1/12 whitespace-nowrap py-2 pr-3">
                        <div className="flex justify-end gap-3">
                          {showDeleteButton && <BtnDeleteVatInvoice id={invoice.id} name={invoice.name} />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Карточки для мобильных устройств */}
              <div className="md:hidden">
                {vatInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="mb-4 rounded-lg bg-white p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium text-blue-800 underline">
                        <a href={`/erp/vat-invoices/${invoice.id}/edit`}>
                          {invoice.name}
                        </a>
                      </h3>
                      <div className="flex gap-2">
                        <BtnEditVatInvoiceLink id={invoice.id} />
                        {showDeleteButton && <BtnDeleteVatInvoice id={invoice.id} name={invoice.name} />}
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