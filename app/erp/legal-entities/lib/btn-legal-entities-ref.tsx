import { useState } from "react";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { LegalEntityForm } from "@/app/lib/definitions";
import dynamic from 'next/dynamic';
import LegalEntitiesRefTable from "./legal-entities-ref-table";

const Modal = dynamic(() => import('@/app/lib/common-modal'), { ssr: false });

interface IBtnLegalEntitiesRefProps {
  legalEntities: LegalEntityForm[],
  handleSelectLegalEntity: (new_id: string, new_name: string) => void,
  elementIdPrefix: string
}

export default function BtnLegalEntitiesRef(props: IBtnLegalEntitiesRefProps) {
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
      <button
        onClick={openModal}
        className="rounded-md border border-gray-200 p-2 h-10 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <BookOpenIcon className="w-5 h-5 text-gray-800" />
      </button>
      <Modal open={modal} >
        <LegalEntitiesRefTable
          legalEntities={props.legalEntities}
          handleSelectLegalEntity={props.handleSelectLegalEntity}
          closeModal={closeModal}
          setTerm={setTerm}
          term={term}
          elementIdPrefix={props.elementIdPrefix}
        />
        <div className="flex justify-between space-x-2" >
          <button
            onClick={() => { alert("действие!") }}
            className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-100 hover:text-gray-500"
          >
            Save
          </button>
          <button
            onClick={() => { closeModal(); setTerm(""); }}
            className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-100 hover:text-gray-500"
          >
            Exit
          </button>
        </div>
      </Modal>
    </div>
  );
}