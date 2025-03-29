
// import Modal from "@/app/lib/modal";
import { useState, useEffect } from "react";
import { PencilIcon, EyeIcon, BookOpenIcon, BriefcaseIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { Tenant } from "@/app/lib/definitions";
import TenantsRefTable from "./tenantsRefTable";

import dynamic from 'next/dynamic';
const Modal = dynamic(() => import('@/app/lib/modal'), { ssr: false });

interface IBtnTenantsRefProps {
  tenants: Tenant[],
  handleSelectTenant: (new_tenant_id: string, new_tenant_name: string) => void,
}

export default function BtnTenantsRef(props: IBtnTenantsRefProps) {

  const [modal, setModal] = useState(false);

  const openModal = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setModal(true);
    // redirect("/dashboard/admin/tenants/1");
  };
  const closeModal = () => {
    // setTenant((prev) => ({
    //   ...props.tenant,
    // }));
    setModal(false);
  };

  return (
    <div>
      <button
        onClick={openModal}
        className="rounded-md border border-gray-200 p-2 h-10 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <BookOpenIcon className="w-5 h-5 text-gray-800" />
      </button>
      <Modal open={modal} >

        <TenantsRefTable 
        tenants={props.tenants} 
        handleSelectTenant={props.handleSelectTenant}
        closeModal={closeModal}
        />

        {/* buttons */}
        <div className="flex justify-between space-x-2" >
          <button
            onClick={() => {
              // alert("действие!")
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
