'use client';
import { useState } from "react";
import { KeyboardEvent } from "react";
import { SectionForm, Section, Tenant, UserForm } from "@/app/lib/definitions";
import { updateUser } from "@/app/lib/actions";
import Link from "next/link";
import RadioActive from "@/app/ui/adm/tenants/radioActive";

interface IInputFormProps {
  user: UserForm,
  tenants: Tenant[],
}
// export const InputForm: React.FC<IInputFormProps> = (props: IInputFormProps) => {

export default function InputForm(props: IInputFormProps) {
  const [user, setUser] = useState<UserForm>(props.user);
  const [show, setShow] = useState(false);
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      setShow(true);
    }
  };

  // console.log("name: "+section.name);

  const handleChangeName = (event: any) => {
    setUser((prev) => ({
      ...prev,
      name: event.target.value,
      email: event.target.value,
    }));
  };
  const handleSelectTenant = (event: any) => {
    setUser((prev) => ({
      ...prev,
      tenant_id: event.target.value,
    }));
  };

  return (
    <div >
      {/* className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md" */}
      <h3>{show && "Нажата клавиша Enter"}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex justify-between mt-6">
          <label htmlFor="name" className="text-sm font-medium">
            Email:
          </label>
          <input
            id="name"
            type="text"
            className="control rounded-md border border-gray-200"
            value={user.name}
            onChange={(e) => handleChangeName(e)}
            onKeyDown={(e) => handleKeyDown(e)}
          />
        </div>
        {/* <div className="flex justify-between mt-6">
          <label htmlFor="description" className="text-sm font-medium">
            Description:
          </label>
          <input
            id="description"
            type="text"
            className="control rounded-md border border-gray-200"
            value={section.tenant_id}
            onChange={(e) => handleChangeTenant(e)}
            onKeyDown={(e) => handleKeyDown(e)}
          />
        </div> */}
        <div></div>
        {/* <RadioActive tenant={tenant} handleChangeActive={handleChangeActive}/> */}
        <div className="flex-1">
          <select
            id="selectTenant"
            name="tenantId"
            value={user.tenant_id}
            className="w-full cursor-pointer rounded-md border p-2 hover:bg-gray-100"
            onChange={(e) => handleSelectTenant(e)}
          >
            <option value="" disabled>
              Member of
            </option>
            {props.tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id} >
                {tenant.name}
              </option>
            ))}
          </select>
        </div>
        <div></div>
      </div>
      <div className="flex justify-between mt-6">
        <button
          onClick={() => {
            updateUser({
              id: user.id,
              name: user.name,
              email: user.email,
              password: user.password,
              is_admin: user.is_admin,
              tenant_id: user.tenant_id
            });
          }}
          className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-100 hover:text-gray-500"
        >
          Save
        </button>
        <Link href={"/dashboard/admin/users/"} className="w-full">
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
