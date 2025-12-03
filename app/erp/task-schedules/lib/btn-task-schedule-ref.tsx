import { useState } from "react";
import { PencilIcon, EyeIcon, BookOpenIcon, BriefcaseIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { TaskSchedule } from "@/app/lib/definitions";
import TaskScheduleRefTable from "./tsch-ref-table";

import dynamic from 'next/dynamic';
const Modal = dynamic(() => import('@/app/lib/common-modal'), { ssr: false });

interface IBtnTaskScheduleRefProps {
  taskSchedules: TaskSchedule[];
  handleSelectTaskSchedule: (id: string, name: string) => void;
}

export default function BtnTaskScheduleRef({ taskSchedules, handleSelectTaskSchedule }: IBtnTaskScheduleRefProps) {
  const [modal, setModal] = useState(false);

  const openModal = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
  };

  const [term, setTerm] = useState<string>("");

  return (
    <div>
      {/* Кнопка открытия справочника */}
      <button
        onClick={openModal}
        className="rounded-md border border-gray-200 p-2 h-10 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Открыть справочник расписаний"
      >
        <BookmarkIcon className="w-5 h-5 text-gray-800" />
      </button>

      {/* Модальное окно */}
      <Modal open={modal}>
        <h3 className="text-lg font-semibold mb-4">Выберите расписание</h3>

        <TaskScheduleRefTable
          taskSchedules={taskSchedules}
          handleSelectTaskSchedule={handleSelectTaskSchedule}
          closeModal={closeModal}
          setTerm={setTerm}
          term={term}
        />

        {/* Кнопки внизу модального окна */}
        <div className="flex justify-between space-x-2 mt-4">
          <button
            onClick={() => alert("Действие сохранения!")}
            className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-100 hover:text-gray-500 transition"
          >
            Save
          </button>
          <button
            onClick={() => {
              closeModal();
              setTerm("");
            }}
            className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-100 hover:text-gray-500 transition"
          >
            Exit
          </button>
        </div>
      </Modal>
    </div>
  );
}