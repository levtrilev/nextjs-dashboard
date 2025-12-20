// app/repair/workorders/WoPartsTable.tsx
'use client';

import { TrashIcon } from "@heroicons/react/24/outline";
import { useWoPartsStore } from "../../lib/store/useWoPartsStore";
// import { useWoPartsStore } from "@/app/store/useWoPartsStore";

interface WoPartsTableProps {
  readonly: boolean;
  onDocumentChanged: () => void;
}

export default function WoPartsTable({ readonly, onDocumentChanged }: WoPartsTableProps) {
  const {
    wo_parts,
    addNewPart,
    updatePartField,
    savePart,
    deletePart,
  } = useWoPartsStore();
  const handleDeletePart = (part_id: string) => {
    deletePart(part_id);
    onDocumentChanged();
  };
  return (
    <div id="table_part_wo_parts" className="mt-2 relative">
      <div className="flex flex-row gap-4 w-full md:w-1/2">
        <h2 className="px-2 pt-1 font-medium">Запчасти:</h2>
      </div>
      {/* заголовки таблицы не прокручиваются */}
      <div className="max-h-[50vh] overflow-y-auto rounded-md border border-gray-200 bg-white">
        <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
          <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
            <tr>
              <th scope="col" className="w-7/16 overflow-hidden px-0 py-5 font-medium sm:pl-6 text-gray-400">
                Работа
              </th>
              <th scope="col" className="w-4/8 px-3 py-5 font-medium text-gray-400">
                Запчасть
              </th>
              <th scope="col" className="w-2/8 px-3 py-5 font-medium text-gray-400">
                Количество
              </th>
              <th scope="col" className="w-1/16 px-3 py-5 font-medium"></th>
            </tr>
          </thead>
        </table>
      </div>
      {/* таблица прокручивается */}
      <div className="max-h-[50vh] overflow-y-auto rounded-md border border-gray-200 bg-white relative">
        <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
          <tbody className="divide-y divide-gray-200 text-gray-900">
            {wo_parts.map((part) => (
              <tr key={part.id} className="group">
                <td className="w-7/16 overflow-hidden whitespace-nowrap text-ellipsis bg-white py-1 pl-0 text-left pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                  <div className="flex items-left gap-3">
                    {part.isEditing ? (
                      <input
                        type="text"
                        value={part.work_name}
                        onChange={(e) => updatePartField(part.id, 'work_name', e.target.value)}
                        className="w-full p-1 border rounded"
                        disabled={readonly}
                        autoFocus
                      />
                    ) : (
                      <a
                        href={"/admin/sections/" + part.id + "/edit"}
                        className="text-blue-800 underline"
                      >
                        {part.work_name.substring(0, 36)}
                      </a>
                    )}
                  </div>
                </td>
                <td className="w-4/8 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                  {part.isEditing ? (
                    <input
                      type="text"
                      value={part.part_name}
                      onChange={(e) => updatePartField(part.id, 'part_name', e.target.value)}
                      className="w-full p-1 border rounded"
                      disabled={readonly}
                    />
                  ) : (
                    part.part_name
                  )}
                </td>
                <td className="w-2/8 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                  {part.isEditing ? (
                    <input
                      type="text"
                      inputMode="decimal"
                      value={part.quantity}
                      onChange={(e) => updatePartField(part.id, 'quantity', e.target.value)}
                      className="w-full p-1 border rounded"
                      disabled={readonly}
                    />
                  ) : (
                    part.quantity
                  )}
                </td>
                <td className="w-1/16 whitespace-nowrap pl-4 py-1 pr-3">
                  <div className="flex justify-end gap-3">
                    {part.isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            if (savePart(part.id)) {
                              onDocumentChanged();
                            }
                          }}
                          disabled={readonly}
                          className="p-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePart(part.id)}
                          disabled={readonly}
                          className="p-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button
                        className="rounded-md border border-gray-200 p-2 h-10 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => deletePart(part.id)}
                        disabled={readonly}
                      >
                        <span className="sr-only">Delete</span>
                        <TrashIcon className="w-5 h-5 text-gray-800" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!readonly && (
          <button
            type="button"
            className="absolute bottom-2 left-2 z-10 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={addNewPart}
            aria-label="Добавить новую запчасть"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}