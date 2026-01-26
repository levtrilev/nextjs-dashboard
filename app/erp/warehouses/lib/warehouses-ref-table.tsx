// WarehousesRefTable.tsx
import { WarehouseForm } from "@/app/lib/definitions";
import RefSearch from "@/app/ui/ref-search";

interface IWarehousesRefTableProps {
  warehouses: WarehouseForm[];
  handleSelectWarehouse: (id: string, name: string) => void;
  closeModal: () => void;
  setTerm: (value: string) => void;
  term: string;
}

export default function WarehousesRefTable(props: IWarehousesRefTableProps) {
  const handleSearch = (input: string) => {
    props.setTerm(input);
  };

  return (
    <div className="w-full">
      <p>Выберите склад:</p>
      <RefSearch callback={handleSearch} term={props.term} elementIdPrefix="warehouse" />
      <div className="mt-0 flow-root">
        {/* Desktop */}
        <div className="overflow-x-auto md:block hidden">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-1 md:pt-0">
              <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="w-full overflow-hidden px-0 py-5 font-medium sm:pl-6">
                      Склад
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="max-h-[300px] overflow-y-auto rounded-md bg-gray-50 p-2 md:pt-0">
              <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {props.warehouses.map((warehouse) => (
                    ((warehouse.name.toLowerCase().includes(props.term.toLowerCase()) || props.term.length === 0) && (
                      <tr key={warehouse.id} className="group">
                        <td className="w-full overflow-hidden whitespace-nowrap text-ellipsis bg-white py-1 pl-0 text-left pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                          <div className="flex items-left gap-3">
                            <a
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                props.handleSelectWarehouse(warehouse.id, warehouse.name);
                                props.setTerm("");
                                props.closeModal();
                              }}
                              className="text-blue-800 underline cursor-pointer hover:text-blue-600"
                            >
                              {warehouse.name.substring(0, 36)}
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="block md:hidden">
          <div className="max-h-[300px] overflow-y-auto rounded-md bg-gray-50 p-2">
            {props.warehouses
              .filter((warehouse) =>
                warehouse.name.toLowerCase().includes(props.term.toLowerCase()) ||
                props.term.length === 0
              )
              .map((warehouse) => (
                <div
                  key={warehouse.id}
                  className="border-b border-gray-200 bg-white p-4 text-sm text-gray-900 last:border-b-0"
                >
                  <div className="font-medium text-black">
                    <a
                      onClick={(e) => {
                        props.handleSelectWarehouse(warehouse.id, warehouse.name);
                        props.setTerm("");
                        props.closeModal();
                      }}
                      className="text-blue-800 underline cursor-pointer hover:text-blue-600"
                    >
                      {warehouse.name.substring(0, 36)}
                    </a>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}