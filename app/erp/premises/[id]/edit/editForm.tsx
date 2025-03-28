
// Permise EditForm

'use client';
import { useState } from "react";
import { KeyboardEvent } from "react";
import { LegalEntity, PremiseForm, RegionForm, SectionForm } from "@/app/lib/definitions";
import { createPremise, updatePremise } from "../../lib/actions";
import Link from "next/link";
import BtnSectionsRef from "@/app/admin/sections/lib/btnSectionsRef";
import BtnRegionsRef from "@/app/erp/regions/lib/btnRegionsRef";
import BtnLegalEntitiesRef from "@/app/erp/legal-entities/lib/btnLegalEntitiesRef";
import { create } from "domain";

interface IEditFormProps {
  premise: PremiseForm,
  sections: SectionForm[],
  regions: RegionForm[],
  legalEntities: LegalEntity[],
}

export default function PremiseEditForm(props: IEditFormProps) {
  const [premise, setPremise] = useState(props.premise);
  const [show, setShow] = useState(false);
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      setShow(true);
    }
  };
  const handleSelectSection = (new_section_id: string, new_section_name: string) => {
    setPremise((prev) => ({
      ...prev,
      section_id: new_section_id,
      section_name: new_section_name,
    }));
  };
  const handleSelectRegion = (new_region_id: string, new_region_name: string) => {
    setPremise((prev) => ({
      ...prev,
      region_id: new_region_id,
      region_name: new_region_name,
    }));
  };
  const handleSelectOperator = (new_le_id: string, new_le_name: string) => {
    setPremise((prev) => ({
      ...prev,
      operator_id: new_le_id,
      operator_name: new_le_name,
    }));
  };
  const handleSelectOwner = (new_le_id: string, new_le_name: string) => {
    setPremise((prev) => ({
      ...prev,
      owner_id: new_le_id,
      owner_name: new_le_name,
    }));
  };
  const handleRedirectBack = () => {
    window.history.back(); // Возвращает пользователя на предыдущую страницу
  };
  // Функция для преобразования даты в формат yyyy-MM-dd
  const formatDateForInput = (date: Date | string): string => {
    if (!date) return ''; // Если дата пустая, возвращаем пустую строку
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
              name="name"
              className="w-7/8 control rounded-md border border-gray-200 p-2"
              value={premise.name}
              onChange={(e) => setPremise((prev) => ({ ...prev, name: e.target.value, }))}
            // onKeyDown={(e) => handleKeyDown(e)}
            />
          </div>
          {/* description */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="description"
              className="w-2/8 text-sm text-blue-900 font-medium flex items-center p-2">
              Описание:
            </label>
            <input
              id="description"
              type="text"
              name="description"
              className="w-13/16 control rounded-md border border-gray-200 p-2"
              value={premise.description}
              onChange={(e) => setPremise((prev) => ({ ...prev, description: e.target.value, }))}
            />
          </div>
          {/* cadastral_number */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="cadastral_number"
              className="w-2/8 text-sm text-blue-900 font-medium flex items-center p-2">
              Кадастровый номер:
            </label>
            <input
              id="cadastral_number"
              type="text"
              name="cadastral_number"
              className="w-13/16 control rounded-md border border-gray-200 p-2"
              value={premise.cadastral_number}
              onChange={(e) => setPremise((prev) => ({ ...prev, cadastral_number: e.target.value, }))}
            />
          </div>
          {/* operator_name */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="operator_name"
              className="w-2/8 text-sm text-blue-900 font-medium flex items-center p-2">
              Оператор:
            </label>
            <input
              id="operator_name"
              type="text"
              name="operator_name"
              className="w-13/16 pointer-events-none control rounded-md border border-gray-200 p-2"
              value={premise.operator_name}
              readOnly
              onChange={(e) => setPremise((prev) => ({ ...prev, operator_name: e.target.value, }))}
            />
            <BtnLegalEntitiesRef legalEntities={props.legalEntities} handleSelectLE={handleSelectOperator} />
          </div>
          {/* owner_name */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="owner_name"
              className="w-2/8 text-sm text-blue-900 font-medium flex items-center p-2">
              Владелец:
            </label>
            <input
              id="owner_name"
              type="text"
              name="owner_name"
              className="w-13/16 pointer-events-none control rounded-md border border-gray-200 p-2"
              value={premise.owner_name}
              readOnly
              onChange={(e) => setPremise((prev) => ({ ...prev, owner_name: e.target.value, }))}
            />
            <BtnLegalEntitiesRef legalEntities={props.legalEntities} handleSelectLE={handleSelectOwner} />
          </div>
        </div>
        {/* second column */}
        <div className="flex flex-col gap-4 w-full md:w-1/2">
          {/* square */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="square"
              className="w-2/8 text-sm text-blue-900 font-medium flex items-center p-2">
              Площадь, кв.м.:
            </label>
            <input
              id="square"
              type="number"
              name="square"
              className="w-13/16 control rounded-md border border-gray-200 p-2"
              value={premise.square.toString()}
              onChange={(e) => setPremise((prev) => ({ ...prev, square: parseFloat(e.target.value), }))}
            />
            {/* // Валидация строки перед отправкой в базу данных
            if (/^\d+(\.\d{1,2})?$/.test(decimalAsString)) {
              console.log("Строка валидна и может быть отправлена в базу данных.");
            } else {
              console.error("Неверный формат строки для decimal(10,2).");
            } */}


          </div>
          {/* region_name */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="region_name"
              className="w-2/8 text-sm text-blue-900 font-medium flex items-center p-2">
              Регион:
            </label>
            <input
              id="region_name"
              type="text"
              name="region_name"
              readOnly
              className="w-13/16 pointer-events-none control rounded-md border border-gray-200 p-2"
              value={premise.region_name}
              onChange={(e) => setPremise((prev) => ({ ...prev, region_name: e.target.value, }))}
            />
            <BtnRegionsRef
              regions={props.regions}
              handleSelectRegion={handleSelectRegion}
            />
          </div>
          {/* address */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="address"
              className="w-2/8 text-sm text-blue-900 font-medium flex items-center p-2">
              Адрес:
            </label>
            <input
              id="address"
              type="text"
              name="address"
              className="w-13/16 control rounded-md border border-gray-200 p-2"
              value={premise.address}
              onChange={(e) => setPremise((prev) => ({ ...prev, address: e.target.value, }))}
            />
          </div>
          {/* status */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="status"
              className="w-2/8 text-sm text-blue-900 font-medium flex items-center p-2">
              Статус:
            </label>
            <input
              id="status"
              type="text"
              name="status"
              className="w-13/16 control rounded-md border border-gray-200 p-2"
              value={premise.status}
              onChange={(e) => setPremise((prev) => ({ ...prev, status: e.target.value, }))}
            />
          </div>
          {/* status_until */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="status_until"
              className="w-3/8 text-sm text-blue-900 font-medium flex items-center p-2">
              Статус действует до:
            </label>
            <input
              id="status_until"
              type="date"
              name="status_until"
              className="w-10/16 control rounded-md border border-gray-200 p-2"
              value={formatDateForInput(premise.status_until)} // Преобразуем дату в нужный формат
              onChange={(e) => {
                console.log('New status_until:', premise.status_until);
                setPremise((prev) => ({ ...prev, status_until: e.target.value, }));
              }}
            />
          </div>
          {/* section_name */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="section_name"
              className="w-2/8 text-sm text-blue-900 font-medium flex items-center p-2">
              Раздел:
            </label>
            <input
              id="section_name"
              type="text"
              name="section_name"
              className="w-13/16 pointer-events-none control rounded-md border border-gray-200 p-2"
              value={premise.section_name}
              readOnly
              onChange={(e) => setPremise((prev) => ({ ...prev, section_name: e.target.value, }))}
            />
            <BtnSectionsRef sections={props.sections} handleSelectSection={handleSelectSection} />
          </div>
        </div>
      </div>
      {/* button area */}
      <div className="flex justify-between mt-4 mr-4">
        <div className="flex w-full md:w-1/2">
          <div className="w-full md:w-1/2">
            <button
              onClick={() => {
                if (premise.id === "") {
                  createPremise(premise);
                } else {
                  updatePremise(premise);
                  handleRedirectBack();
                }
              }}
              className="bg-blue-400 text-white w-full rounded-md border p-2 
              hover:bg-blue-100 hover:text-gray-500 cursor-pointer"
            >
              Сохранить
            </button>
          </div>
          <div className="w-full md:w-1/2">
            <Link href={"#"} >
              <button
                onClick={() => handleRedirectBack()}
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
