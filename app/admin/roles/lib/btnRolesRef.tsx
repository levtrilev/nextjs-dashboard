
import { useState } from "react";
import { PencilIcon, EyeIcon, BookOpenIcon, BriefcaseIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { RoleForm } from "@/app/lib/definitions";

import dynamic from 'next/dynamic';
import RolesRefTable from "./rolesRefTable";
const Modal = dynamic(() => import('@/app/lib/modal'), { ssr: false });


interface IBtnRolesRefProps {
  roles: RoleForm[],
  handleSelectRole: (
    new_role_id: string, 
    new_role_name: string, 
    new_role_description: string,
    new_role_tenant_id: string, 
    new_role_tenant_name: string
  ) => void,
}

export default function IBtnRolesRef(props: IBtnRolesRefProps) {
  // const regions = await fetchRegions();
  const [modal, setModal] = useState(false);

  const openModal = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setModal(true);
    // redirect("/dashboard/admin/tenants/1");
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

        <RolesRefTable 
        roles={props.roles} 
        handleSelectRole={props.handleSelectRole}
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
    </div>
  );
}
