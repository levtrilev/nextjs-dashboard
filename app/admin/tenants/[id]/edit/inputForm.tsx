'use client';
import { useState } from "react";
import { KeyboardEvent } from "react";
import { Tenant } from "@/app/lib/definitions";
import { updateTenant } from "../../lib/tenants-actions";
import Link from "next/link";
import RadioActive from "../../lib/radioActive";

interface IInputFormProps {
  tenant: Tenant,
  admin: boolean,
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
        <div className="flex justify-between mt-1">
          <label
            htmlFor="name"
            className="text-sm font-medium flex items-center p-2"
          >
            Name:
          </label>
          <input
            id="name"
            type="text"
            className="w-7/8 control rounded-md border border-gray-200 p-2"
            value={tenant.name}
            onChange={(e) => handleChangeName(e)}
            onKeyDown={(e) => handleKeyDown(e)}
          />
        </div>
        <div className="w-1/2"></div>
        <div className="flex justify-between mt-1">
          <label
            htmlFor="description"
            className="w-2/8 text-sm font-medium flex items-center p-2">
            Description:
          </label>
          <input
            id="description"
            type="text"
            className="w-13/16 control rounded-md border border-gray-200 p-2"
            value={tenant.description}
            onChange={(e) => handleChangeDescription(e)}
            onKeyDown={(e) => handleKeyDown(e)}
          />
        </div>
        <div className="w-1/2"></div>
        <RadioActive tenant={tenant} handleChangeActive={handleChangeActive} />
        <div></div>
      </div>
      <div className="flex justify-between mt-1">
        <div className="flex w-1/2">
          <div className="w-1/4">
            <button
              disabled={!props.admin}
              onClick={() => {
                updateTenant(tenant);
              }}
              className="bg-blue-400 text-white w-full rounded-md border p-2 
              hover:bg-blue-100 hover:text-gray-500 cursor-pointer"
            >
              Save
            </button>
          </div>
          <div className="w-1/4">
            <Link href={"/admin/tenants/"} >
              <button
                className="bg-blue-400 text-white w-full rounded-md border p-2
                 hover:bg-blue-100 hover:text-gray-500 cursor-pointer"
              >
                Back to list
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
