'use client';
import { useState } from "react";
import { KeyboardEvent } from "react";
import { Tenant } from "@/app/lib/definitions";
import { updateTenant } from "@/app/lib/actions";
import Link from "next/link";
import RadioActive from "@/app/ui/adm/tenants/radioActive";

interface IInputFormProps {
  tenant: Tenant,
}
// export const InputForm: React.FC<IInputFormProps> = (props: IInputFormProps) => {

export default function InputForm(props: IInputFormProps) {
  const [tenant, setTenant] = useState(props.tenant);
  const [show, setShow] = useState(false);
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      setShow(true);
    }
  };

  const handleChangeName = (event: any) => {
    setTenant((prev) => ({
      ...prev,
      name: event.target.value,
    }));
  };
  const handleChangeDescription = (event: any) => {
    setTenant((prev) => ({
      ...prev,
      description: event.target.value,
    }));
  };
  const handleChangeActive = (event: any) => {
    setTenant((prev) => ({
        ...prev,
        active: !prev.active,
    }));
};
  return (
    <div >
      {/* className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md" */}
      <h3>{show && "Нажата клавиша Enter"}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex justify-between mt-6">
          <label htmlFor="name" className="text-sm font-medium">
            Name:
          </label>
          <input
            id="name"
            type="text"
            className="control rounded-md border border-gray-200"
            value={tenant.name}
            onChange={(e) => handleChangeName(e)}
            onKeyDown={(e) => handleKeyDown(e)}
          />
        </div>
        <div className="flex justify-between mt-6">
          <label htmlFor="description" className="text-sm font-medium">
            Description:
          </label>
          <input
            id="description"
            type="text"
            className="control rounded-md border border-gray-200"
            value={tenant.description}
            onChange={(e) => handleChangeDescription(e)}
            onKeyDown={(e) => handleKeyDown(e)}
          />
        </div>
        <RadioActive tenant={tenant} handleChangeActive={handleChangeActive}/>
        <div></div>
      </div>
      <div className="flex justify-between mt-6">
        <button
          onClick={() => {
            updateTenant(tenant);
          }}
          className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-100 hover:text-gray-500"
        >
          Save
        </button>
        <Link href={"/admin/tenants/"} className="w-full">
          <button
            className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-100 hover:text-gray-500"
          >
            Back to list
          </button>
        </Link>
      </div>
    </div>
  );
}
