// GenericRefTable


import RefSearch from "../ui/ref-search";

interface IGenericRefTableProps<T> {
  items: T[];
  handleSelectItem: (id: string, name: string) => void;
  closeModal: () => void;
  setTerm: (value: string) => void;
  term: string;
  title: string;
  additionalColumns?: {
    key: keyof T;
    label: string;
    width?: string;
  }[];
  searchPlaceholder?: string;
}

export default function GenericRefTable<T extends { id: string; name: string }>(
  props: IGenericRefTableProps<T>
) {
  const handleSearch = (input: string) => {
    props.setTerm(input);
  };

  const filteredItems = props.items.filter((item) =>
    item.name.toLowerCase().includes(props.term.toLowerCase()) ||
    props.term.length === 0
  );

  const columns = [
    { key: 'name' as keyof T, label: 'Name', width: 'w-full' },
    ...(props.additionalColumns || [])
  ];

  return (
    <div className="w-full">
      <p>{props.title}</p>
      <RefSearch 
        callback={handleSearch} 
        term={props.term} 
        // placeholder={props.searchPlaceholder || "Поиск..."}
        elementIdPrefix="generic" 
      />
      <div className="mt-0 flow-root">
        {/* Desktop */}
        <div className="overflow-x-auto md:block hidden">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-1 md:pt-0">
              <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    {columns.map((column, index) => (
                      <th 
                        key={index} 
                        scope="col" 
                        className={`${column.width || 'w-auto'} overflow-hidden px-0 py-5 font-medium sm:pl-6`}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
              </table>
            </div>
            <div className="max-h-[300px] overflow-y-auto rounded-md bg-gray-50 p-2 md:pt-0">
              <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="group">
                      {columns.map((column, colIndex) => (
                        <td 
                          key={colIndex} 
                          className={`${column.width || 'w-auto'} overflow-hidden whitespace-nowrap text-ellipsis bg-white py-1 pl-0 text-left pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6`}
                        >
                          <div className="flex items-left gap-3">
                            {column.key === 'name' ? (
                              <a
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  props.handleSelectItem(item.id, item.name);
                                  props.setTerm("");
                                  props.closeModal();
                                }}
                                className="text-blue-800 underline cursor-pointer hover:text-blue-600"
                              >
                                {item.name.substring(0, 36)}
                              </a>
                            ) : (
                              <span>{String(item[column.key])}</span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="block md:hidden">
          <div className="max-h-[300px] overflow-y-auto rounded-md bg-gray-50 p-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="border-b border-gray-200 bg-white p-4 text-sm text-gray-900 last:border-b-0"
              >
                <div className="font-medium text-black">
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      props.handleSelectItem(item.id, item.name);
                      props.setTerm("");
                      props.closeModal();
                    }}
                    className="text-blue-800 underline cursor-pointer hover:text-blue-600"
                  >
                    {item.name}
                  </a>
                </div>
                {props.additionalColumns?.map((column, index) => (
                  <div key={index} className="text-gray-600 text-xs mt-1">
                    <span className="font-semibold">{column.label}: </span>
                    <span>{String(item[column.key])}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}