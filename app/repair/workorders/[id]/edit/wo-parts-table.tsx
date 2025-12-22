// app/repair/workorders/WoPartsTable.tsx
'use client';

import { TrashIcon } from "@heroicons/react/24/outline";
import { getWoPartsStore } from "../../lib/store/woPartsStoreRegistry";
import { Work } from "@/app/lib/definitions";
import { deleteWoPart } from "../../lib/wo-parts-actions";
import InputField from "@/app/lib/input-field";
import BtnWorksRef from "@/app/repair/works/lib/btn-works-ref";

interface WoPartsTableProps {
  readonly: boolean;
  onDocumentChanged: () => void;
  workorderId: string;
  sectionId: string;
  works: Work[] | null;
}
const PlusButton = ({ onClick }: { onClick: () => void; }) => {
  return (
    <button
      type="button"
      className="ml-2 z-10 w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={onClick}
      aria-label="Добавить новую операцию"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </button>
  );
}
export default function WoPartsTable({
  readonly, onDocumentChanged, workorderId, sectionId, works
}: WoPartsTableProps) {
  const useStore = getWoPartsStore(workorderId);

  const wo_parts = useStore((state) => state.wo_parts);
  const savePart = useStore((state) => state.savePart);
  const addNewPart = useStore((state) => state.addNewPart);
  const updatePartField = useStore((state) => state.updatePartField);
  const deletePartFromState = useStore((state) => state.deletePartFromState);
  const setCurrentWork = useStore((state) => state.setCurrentWork);
  const wo_current_work = useStore((state) => state.wo_current_work);

  const handleDeleteWoPart = async (part_id: string) => {
    try {
      await deleteWoPart(part_id);
      deletePartFromState(part_id);
      // onDocumentChanged();
    } catch (error) {
      console.error("Ошибка удаления wo_part:", error);
      throw new Error(
        "Ошибка базы данных: Не удалось удалить wo_part: " + String(error)
      );
    }
  };

  return (
    <div id="table_part_wo_parts" className="mt-2 relative">
      <div className="flex flex-row gap-4 w-full md:w-1/2">
        <h2 className="px-2 pt-1 font-medium">Запчасти:</h2>
        {/* work_name_parts */}
        <InputField
          name="work_name_parts"
          value={wo_current_work.name as string}
          label="Работа:"
          type="text"
          w={["w-6/16", "w-11/16"]}
          onChange={(value) => { }}
          refBook={works ? <BtnWorksRef
            handleSelectWork={
              (new_work_id, new_work_name) => setCurrentWork({ id: new_work_id, name: new_work_name })}
            works={works} instanceId="_parts" /> : undefined}
          readonly={readonly}
        />
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
                <div className="flex flwx-row">
                  Запчасть {!readonly && <PlusButton onClick={() => addNewPart(wo_current_work)} />}
                </div>
              </th>
              <th scope="col" className="w-2/8 px-3 py-5 font-medium text-gray-400">
                Количество
              </th>
              <th scope="col" className="w-1/16 px-3 py-5 font-medium"></th>
            </tr>
          </thead>
        </table>
        {/* {!readonly && <PlusButton onClick={() => addNewPart(wo_current_work)} />} */}
      </div>
      {/* таблица прокручивается */}
      <div className="max-h-[50vh] overflow-y-auto rounded-md border border-gray-200 bg-white relative">
        <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
          <tbody className="divide-y divide-gray-200 text-gray-900">
            {wo_parts.map((wo_part) => {

              return (
                <tr key={wo_part.id} className="group">
                  <td className="w-7/16 overflow-hidden whitespace-nowrap text-ellipsis bg-white py-1 pl-0 text-left pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                    <div className="flex items-left gap-3">
                      <a
                        href={"/repair/works/" + wo_part.work_id + "/edit"}
                        className="text-blue-800 underline"
                      >
                        {wo_part.work_name.substring(0, 36)}
                      </a>
                    </div>
                  </td>
                  <td className="w-7/16 overflow-hidden whitespace-nowrap text-ellipsis bg-white py-1 pl-0 text-left pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                    <div className="flex items-left gap-3">
                      {wo_part.isEditing ? (
                        <input
                          type="text"
                          value={wo_part.part_name}
                          onChange={(e) => updatePartField(wo_part.id, 'part_name', e.target.value)}
                          className="w-full p-1 border rounded"
                          disabled={readonly}
                          autoFocus
                        />
                      ) : (
                        wo_part.part_name === "" ? wo_part.name : wo_part.part_name
                      )}
                    </div>
                  </td>
                  <td className="w-2/8 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                    {wo_part.isEditing ? (
                      <input
                        type="text"
                        inputMode="decimal"
                        value={wo_part.quantity}
                        onChange={(e) => updatePartField(wo_part.id, 'quantity', e.target.value)}
                        className="w-full p-1 border rounded"
                        disabled={readonly}
                      />
                    ) : (
                      wo_part.quantity
                    )}
                  </td>
                  <td className="w-1/16 whitespace-nowrap pl-4 py-1 pr-3">
                    <div className="flex justify-end gap-3">
                      {wo_part.isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              const success = savePart(
                                wo_part.id,
                                wo_part.part_name,
                                workorderId,
                                sectionId,
                                wo_current_work.id
                              );
                              onDocumentChanged();
                            }} disabled={readonly}
                            className="p-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => deletePartFromState(wo_part.id)}
                            disabled={readonly}
                            className="p-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="rounded-md border border-gray-200 p-2 h-10 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onClick={() => handleDeleteWoPart(wo_part.id)}
                          disabled={readonly}
                        >
                          <span className="sr-only">Delete</span>
                          <TrashIcon className="w-5 h-5 text-gray-800" />
                        </button>)}
                    </div>
                  </td>
                </tr>
              );

            })}
          </tbody>
        </table>
        {/* {!readonly && (
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
        )} */}
      </div>
    </div>
  );
}