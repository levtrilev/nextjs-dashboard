
// LegalEntity EditForm

'use client';
import { useState } from "react";
import { KeyboardEvent } from "react";
import { Region } from "@/app/lib/definitions";
import { updateRegion } from "../../lib/actions";
import Link from "next/link";
import RadioActive, { RadioActiveIsSupplier } from "@/app/erp/legal-entities/lib/radioActive";
import { redirect } from "next/navigation";
import RadioActiveIsCustomer from "@/app/erp/legal-entities/lib/radioActive";

interface IEditFormProps {
  region: Region,
}

export default function EditForm(props: IEditFormProps) {
  const [region, setRegion] = useState(props.region);
  const [show, setShow] = useState(false);
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      setShow(true);
    }
  };



  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 w-full">
        {/* first column */}
        <div className="flex flex-col gap-4 w-full md:w-1/2">

          {/* name */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="name"
              className="text-sm text-blue-900 font-medium flex items-center p-2"
            >
              Название:
            </label>
            <input
              id="name"
              type="text"
              className="w-7/8 control rounded-md border border-gray-200 p-2"
              value={region.name}
              onChange={(e) => setRegion((prev) => ({ ...prev, name: e.target.value, }))}
              onKeyDown={(e) => handleKeyDown(e)}
            />
          </div>
          {/* capital */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="capital"
              className="w-2/8 text-sm text-blue-900 font-medium flex items-center p-2">
              Столица:
            </label>
            <input
              id="capital"
              type="text"
              className="w-13/16 control rounded-md border border-gray-200 p-2"
              value={region.capital}
              onChange={(e) => setRegion((prev) => ({ ...prev, capital: e.target.value, }))}
              onKeyDown={(e) => handleKeyDown(e)}
            />
          </div>
        </div>
        {/* second column */}
        <div className="flex flex-col gap-4 w-full md:w-1/2">
          {/* area */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="area"
              className="w-2/8 text-sm text-blue-900 font-medium flex items-center p-2">
              Округ:
            </label>
            <input
              id="area"
              type="text"
              className="w-13/16 control rounded-md border border-gray-200 p-2"
              value={region.area}
              onChange={(e) => setRegion((prev) => ({ ...prev, area: e.target.value, }))}
              onKeyDown={(e) => handleKeyDown(e)}
            />
          </div>
          {/* code */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="code"
              className="w-2/8 text-sm text-blue-900 font-medium flex items-center p-2">
              Код:
            </label>
            <input
              id="code"
              type="text"
              className="w-13/16 control rounded-md border border-gray-200 p-2"
              value={region.code}
              onChange={(e) => setRegion((prev) => ({ ...prev, code: e.target.value, }))}
              onKeyDown={(e) => handleKeyDown(e)}
            />
          </div>
        </div>
      </div>
      {/* button area */}
      <div className="flex justify-between mt-4 mr-4">
        <div className="flex w-full md:w-1/2">
          <div className="w-full md:w-1/2">
            <button
              onClick={() => {
                updateRegion(region);
                redirect("/erp/regions/");
              }}
              className="bg-blue-400 text-white w-full rounded-md border p-2 
              hover:bg-blue-100 hover:text-gray-500 cursor-pointer"
            >
              Сохранить
            </button>
          </div>
          <div className="w-full md:w-1/2">
            <Link href={"/erp/regions/"} >
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
