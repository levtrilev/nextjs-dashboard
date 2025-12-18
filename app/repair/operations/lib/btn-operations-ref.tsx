// import Modal from "@/app/lib/modal";
import { useState, useEffect } from "react";
import { PencilIcon, EyeIcon, BookOpenIcon, BriefcaseIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { Operation } from "@/app/lib/definitions";
import OperationsRefTable from "./operations-ref-table";

import dynamic from 'next/dynamic';
const Modal = dynamic(() => import('@/app/lib/common-modal'), { ssr: false });

interface IBtnOperationsRefProps {
  operations: Operation[],
  handleSelectOperation: (new_operation_id: string, new_operation_name: string) => void,
}

export default function BtnOperationsRef(props: IBtnOperationsRefProps) {
  // const operations = await fetchOperations();
  const [modal, setModal] = useState(false);

  const openModal = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setModal(true);
    // redirect("/dashboard/admin/tenants/1");
  };
  const closeModal = () => {
    // setOperation((prev) => ({
    //   ...props.operation,
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

        <OperationsRefTable
          operations={props.operations}
          handleSelectOperation={props.handleSelectOperation}
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