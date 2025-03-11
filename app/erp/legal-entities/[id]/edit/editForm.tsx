
// LegalEntity EditForm

'use client';
import { useState } from "react";
import { KeyboardEvent } from "react";
import { LegalEntity } from "@/app/lib/definitions";
import { updateLegalEntity } from "@/app/lib/features/legalEntities/actions";
import Link from "next/link";
import RadioActive, { RadioActiveIsSupplier } from "@/app/ui/legal-entities/radioActive";
import { redirect } from "next/navigation";
import RadioActiveIsCustomer from "@/app/ui/legal-entities/radioActive";

interface IEditFormProps {
  legalEntity: LegalEntity,
}

export default function EditForm(props: IEditFormProps) {
  const [legalEntity, setLegalEntity] = useState(props.legalEntity);
  const [show, setShow] = useState(false);
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      setShow(true);
    }
  };

  const handleChangeName = (event: any) => {
    setLegalEntity((prev) => ({
      ...prev,
      name: event.target.value,
    }));
  };
  const handleChangeFullname = (event: any) => {
    setLegalEntity((prev) => ({
      ...prev,
      fullname: event.target.value,
    }));
  };
  const handleChangeAddressLegal = (event: any) => {
    setLegalEntity((prev) => ({
      ...prev,
      address_legal: event.target.value,
    }));
  };
  const handleChangeEmail = (event: any) => {
    setLegalEntity((prev) => ({
      ...prev,
      email: event.target.value,
    }));
  };
  const handleChangePhone = (event: any) => {
    setLegalEntity((prev) => ({
      ...prev,
      phone: event.target.value,
    }));
  };
  const handleChangeContact = (event: any) => {
    setLegalEntity((prev) => ({
      ...prev,
      contact: event.target.value,
    }));
  };
  const handleChangeInn = (event: any) => {
    setLegalEntity((prev) => ({
      ...prev,
      inn: event.target.value,
    }));
  };
  const handleChangeKpp = (event: any) => {
    setLegalEntity((prev) => ({
      ...prev,
      kpp: event.target.value,
    }));
  };
  const handleChangeIsCustomer = (event: any) => {
    setLegalEntity((prev) => ({
      ...prev,
      is_customer: !prev.is_customer,
    }));
  };
  const handleChangeIsSupplier = (event: any) => {
    setLegalEntity((prev) => ({
      ...prev,
      is_supplier: !prev.is_supplier,
    }));
  };

  return (
    <div >

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
              value={legalEntity.name}
              onChange={(e) => handleChangeName(e)}
              onKeyDown={(e) => handleKeyDown(e)}
            />
          </div>
          {/* fullname */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="fullname"
              className="w-2/8 text-sm text-blue-900 font-medium flex items-center p-2">
              Полное:
            </label>
            <input
              id="fullname"
              type="text"
              className="w-13/16 control rounded-md border border-gray-200 p-2"
              value={legalEntity.fullname}
              onChange={(e) => handleChangeFullname(e)}
              onKeyDown={(e) => handleKeyDown(e)}
            />
          </div>
          {/* address_leg */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="address_legal"
              className="w-2/8 text-sm text-blue-900 font-medium flex items-center p-2">
              Юр.адрес:
            </label>
            <input
              id="address_legal"
              type="text"
              className="w-13/16 control rounded-md border border-gray-200 p-2"
              value={legalEntity.address_legal}
              onChange={(e) => handleChangeAddressLegal(e)}
              onKeyDown={(e) => handleKeyDown(e)}
            />
          </div>
          {/* email */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="email"
              className="w-2/8 text-sm text-blue-900 font-medium flex items-center p-2">
              Email:
            </label>
            <input
              id="email"
              type="text"
              className="w-13/16 control rounded-md border border-gray-200 p-2"
              value={legalEntity.email}
              onChange={(e) => handleChangeEmail(e)}
              onKeyDown={(e) => handleKeyDown(e)}
            />
          </div>
          {/* phone */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="phone"
              className="w-2/8 text-sm text-blue-900 font-medium flex items-center p-2">
              Телефон:
            </label>
            <input
              id="phone"
              type="text"
              className="w-13/16 control rounded-md border border-gray-200 p-2"
              value={legalEntity.phone}
              onChange={(e) => handleChangePhone(e)}
              onKeyDown={(e) => handleKeyDown(e)}
            />
          </div>
        </div>

        {/* second column */}
        <div className="flex flex-col gap-4 w-full md:w-1/2">
          {/* contact */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="contact"
              className="w-2/8 text-sm text-blue-900 font-medium flex items-center p-2">
              Контакт:
            </label>
            <input
              id="contact"
              type="text"
              className="w-13/16 control rounded-md border border-gray-200 p-2"
              value={legalEntity.contact}
              onChange={(e) => handleChangeContact(e)}
              onKeyDown={(e) => handleKeyDown(e)}
            />
          </div>
          {/* inn */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="inn"
              className="w-2/8 text-sm text-blue-900 font-medium flex items-center p-2">
              ИНН:
            </label>
            <input
              id="inn"
              type="text"
              className="w-13/16 control rounded-md border border-gray-200 p-2"
              value={legalEntity.inn}
              onChange={(e) => handleChangeInn(e)}
              onKeyDown={(e) => handleKeyDown(e)}
            />
          </div>
          {/* kpp */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="kpp"
              className="w-2/8 text-sm text-blue-900 font-medium flex items-center p-2">
              КПП:
            </label>
            <input
              id="kpp"
              type="text"
              className="w-13/16 control rounded-md border border-gray-200 p-2"
              value={legalEntity.kpp}
              onChange={(e) => handleChangeKpp(e)}
              onKeyDown={(e) => handleKeyDown(e)}
            />
          </div>

          <RadioActiveIsCustomer legalEntity={legalEntity} handleChange={handleChangeIsCustomer} />
          <RadioActiveIsSupplier legalEntity={legalEntity} handleChange={handleChangeIsSupplier} />
        </div>
      </div>
      {/* button area */}
      <div className="flex justify-between mt-4 mr-4">
        <div className="flex w-full md:w-1/2">
          <div className="w-full md:w-1/2">
            <button
              onClick={() => {
                updateLegalEntity(legalEntity);
                redirect("/erp/legal-entities/");
              }}
              className="bg-blue-400 text-white w-full rounded-md border p-2 
              hover:bg-blue-100 hover:text-gray-500 cursor-pointer"
            >
              Сохранить
            </button>
          </div>
          <div className="w-full md:w-1/2">
            <Link href={"/erp/legal-entities/"} >
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

{/* <div className="flex flex-col md:flex-row gap-4 w-full">
<div className="flex flex-col gap-4 w-full md:w-1/2">
  <div className="border px-3 py-1.5">Элемент 1 col 1</div>
  <div className="border px-3 py-1.5">Элемент 2 col 1</div>
</div>
<div className="flex flex-col gap-4 w-full md:w-1/2">
  <div className="border px-3 py-1.5">Элемент 3 col 2</div>
  <div className="border px-3 py-1.5">Элемент 4 col 2</div>
</div>
</div> */}