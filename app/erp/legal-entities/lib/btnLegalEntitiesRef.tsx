
// import Modal from "@/app/lib/modal";
import { useState, useEffect } from "react";
import { PencilIcon, EyeIcon, BookOpenIcon, BriefcaseIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { LegalEntity } from "@/app/lib/definitions";
import LegalEntitiesRefTable from "./legalEntitiesRefTable";

import dynamic from 'next/dynamic';
const Modal = dynamic(() => import('@/app/lib/modal'), { ssr: false });

interface IBtnLegalEntitiesRefProps {
  legalEntities: LegalEntity[],
  handleSelectLE: (new_le_id: string, new_le_name: string) => void,
}

export default function BtnLegalEntitiesRef(props: IBtnLegalEntitiesRefProps) {
  // const regions = await fetchRegions();
  const [modal, setModal] = useState(false);

  const openModal = () => {
    setModal(true);
    // redirect("/dashboard/admin/tenants/1");
  };
  const closeModal = () => {
    // setTenant((prev) => ({
    //   ...props.tenant,
    // }));
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
          handleSelectLE={props.handleSelectLE}
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
            onClick={()=>{closeModal(); setTerm("");}}
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