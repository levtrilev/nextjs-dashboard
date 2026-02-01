// GenericBtnRef.tsx
import { useState } from "react";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import dynamic from 'next/dynamic';
import GenericRefTable from "./generic-ref-table";
// import GenericRefTable from "./generic-ref-table";

const Modal = dynamic(() => import('@/app/lib/common-modal'), { ssr: false });

interface IGenericBtnRefProps<T> {
  items: T[];
  handleSelectItem: (id: string, name: string) => void;
  title: string;
  icon?: React.ReactNode;
  additionalColumns?: {
    key: keyof T;
    label: string;
    width?: string;
  }[];
  searchPlaceholder?: string;
  saveButtonText?: string;
  exitButtonText?: string;
}

export default function BtnRefGeneric<T extends { id: string; name: string }>(
  props: IGenericBtnRefProps<T>
) {
  const [modal, setModal] = useState(false);
  const [term, setTerm] = useState<string>("");

  const openModal = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setModal(true);
  };
  
  const closeModal = () => {
    setModal(false);
    setTerm("");
  };

  const IconComponent = props.icon || <BookOpenIcon className="w-5 h-5 text-gray-800" />;

  return (
    <div>
      <button
        onClick={openModal}
        className="rounded-md border border-gray-200 p-2 h-10 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {IconComponent}
      </button>
      <Modal open={modal}>
        <GenericRefTable
          items={props.items}
          handleSelectItem={props.handleSelectItem}
          closeModal={closeModal}
          setTerm={setTerm}
          term={term}
          title={props.title}
          additionalColumns={props.additionalColumns}
          searchPlaceholder={props.searchPlaceholder}
        />
        <div className="flex justify-between space-x-2 mt-4">
          <button
            onClick={() => { alert("действие!") }}
            className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-100 hover:text-gray-500"
          >
            {props.saveButtonText || "Save"}
          </button>
          <button
            onClick={closeModal}
            className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-100 hover:text-gray-500"
          >
            {props.exitButtonText || "Exit"}
          </button>
        </div>
      </Modal>
    </div>
  );
}