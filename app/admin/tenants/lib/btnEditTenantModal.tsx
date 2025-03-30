import { Tenant } from "@/app/lib/definitions";
import Modal from "../../../lib/modal";
import { useState, useEffect } from "react";
import { PencilIcon, EyeIcon, BookOpenIcon, BriefcaseIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { updateTenant } from "./tenants-actions";

interface ITenantProps {
  tenant: Tenant,
}

export const BtnEditTenantModal: React.FC<ITenantProps> = (props: ITenantProps) => {
  const [modal, setModal] = useState(false);
  const [tenant, setTenant] = useState<Tenant>(props.tenant);

  useEffect(
    () => {
      setTenant((prev) => ({
        ...props.tenant,
      }
      ));
    }
    , [props.tenant]
  );
  const openModal = () => {
    setModal(true);
    // redirect("/dashboard/admin/tenants/1");
  };
  const closeModal = () => {
    setTenant((prev) => ({
      ...props.tenant,
    }));
    setModal(false);
  };

  const handleChangeName = (event: any) => {
    setTenant((prev) => ({
      ...prev,
      name: event.target.value,
    }));
  };

  function handleChangeDescription(event: any) {
    setTenant((prev) => ({
      ...prev,
      description: event.target.value,
    }));
  }

  return (
    <>
      <button
        onClick={openModal}
        className="rounded-md border border-gray-200 p-2 h-10 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <BookOpenIcon className="w-5 h-5 text-gray-800" />
      </button>
      <Modal open={modal} >
        <h2>Edit Tenant. id : {tenant.id}</h2>
        <div>name : {tenant.name}</div>
        <input
          id={tenant.name} 
          onChange={(e) => handleChangeName(e)} 
          value={tenant.name ? tenant.name : undefined} type="text"
          className="w-full rounded-md border p-2 hover:bg-gray-100" 
          placeholder='Tenant name'
        />
        <div>description : {tenant.description}</div>
        <input
          id={tenant.description} 
          onChange={(e) => handleChangeDescription(e)} 
          value={tenant.description ? tenant.description : undefined} 
          type="text"
          className="w-full rounded-md border p-2 hover:bg-gray-100" 
          placeholder='Tenant description'
        />
        <div className="flex justify-between space-x-2" >
          <button
            onClick={() => {
              updateTenant(tenant);
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
    </>
  );
}

export default BtnEditTenantModal;