
// import Modal from "@/app/lib/modal";
import { useState, useEffect } from "react";
import { PencilIcon, EyeIcon, BookOpenIcon, BriefcaseIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { Section, SectionForm } from "@/app/lib/definitions";
import SectionsRefTable from "./sections-ref-table";

import dynamic from 'next/dynamic';
const Modal = dynamic(() => import('@/app/lib/common-modal'), { ssr: false });


interface IBtnSectionsRefProps {
  sections: SectionForm[],
  handleSelectSection: (
    new_section_id: string, 
    new_section_name: string, 
    new_section_tenant_id: string, 
    new_section_tenant_name: string
  ) => void,
}

export default function BtnSectionsRef(props: IBtnSectionsRefProps) {
  // const regions = await fetchRegions();
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

        <SectionsRefTable 
        sections={props.sections} 
        handleSelectSection={props.handleSelectSection}
        closeModal={closeModal}
        setTerm={setTerm}
        term={term}
        />

        {/* buttons */}
        <div className="flex justify-between space-x-2" >
          <button
            onClick={() => {
              alert("действие!")
            }}
            className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-100 hover:text-gray-500"
          >
            Save
          </button>
          <button
            onClick={closeModal}
            className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-100 hover:text-gray-500"
          >
            Exit
          </button>
        </div>
      </Modal>
      {/* <pre>show modal: {modal.toString()}</pre> */}
    </div>
  );
}

// export default BtnRefLegalEntity;