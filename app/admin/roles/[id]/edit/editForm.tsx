'use client';
import { useState } from "react";
import { KeyboardEvent } from "react";
import { Role } from "@/app/lib/definitions";
import { updateRole } from "../../lib/actions";
import Link from "next/link";

interface IEditFormProps {
  role: Role,
}
// export const InputForm: React.FC<IInputFormProps> = (props: IInputFormProps) => {

export default function EditForm(props: IEditFormProps) {
  const [role, setRole] = useState(props.role);
  // const [show, setShow] = useState(false);
  // const handleKeyDown = (e: KeyboardEvent) => {
  //   if (e.key === "Enter") {
  //     setShow(true);
  //   }
  // };

  const handleChangeName = (event: any) => {
    setRole((prev) => ({
      ...prev,
      name: event.target.value,
    }));
  };
  const handleChangeDescription = (event: any) => {
    setRole((prev) => ({
      ...prev,
      description: event.target.value,
    }));
  };

  return (
    <div >
      {/* className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md" */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex justify-between mt-1">
          <label
            htmlFor="name"
            className="text-sm font-medium flex items-center p-2"
          >
            Роль(название):
          </label>
          <input
            id="name"
            type="text"
            className="w-7/8 control rounded-md border border-gray-200 p-2"
            value={role.name}
            onChange={(e) => handleChangeName(e)}
          />
        </div>
        <div className="w-1/2"></div>
        <div className="flex justify-between mt-1">
          <label
            htmlFor="description"
            className="w-2/8 text-sm font-medium flex items-center p-2">
            Описание:
          </label>
          <input
            id="description"
            type="text"
            className="w-13/16 control rounded-md border border-gray-200 p-2"
            value={role.description}
            onChange={(e) => handleChangeDescription(e)}
          />
        </div>
        <div className="w-1/2"></div>
        <div></div>
      </div>
      <div className="flex justify-between mt-1">
        <div className="flex w-1/2">
          <div className="w-1/4">
            <button
              onClick={() => {
                updateRole(role);
              }}
              className="bg-blue-400 text-white w-full rounded-md border p-2 
              hover:bg-blue-100 hover:text-gray-500 cursor-pointer"
            >
              Сохранить
            </button>
          </div>
          <div className="w-1/4">
            <Link href={"/admin/tenants/"} >
              <button
                className="bg-blue-400 text-white w-full rounded-md border p-2
                 hover:bg-blue-100 hover:text-gray-500 cursor-pointer"
              >
                Отмена
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
