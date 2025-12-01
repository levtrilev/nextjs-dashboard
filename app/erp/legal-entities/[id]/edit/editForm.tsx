
// LegalEntity EditForm

'use client';
import { useEffect, useState } from "react";
import { KeyboardEvent } from "react";
import { LegalEntityForm, Region, Section, SectionForm } from "@/app/lib/definitions";
import { updateLegalEntity } from "../../lib/le-actions";
import { RadioActiveIsSupplier } from "@/app/erp/legal-entities/lib/radioActive";
import RadioActiveIsCustomer from "@/app/erp/legal-entities/lib/radioActive";
import BtnRegionsRef from "@/app/erp/regions/lib/btnRegionsRef";
import BtnSectionsRef from "@/app/admin/sections/lib/btnSectionsRef";
import MessageBoxOKCancel from "@/app/lib/MessageBoxOKCancel";
import {
  setIsCancelButtonPressed, setIsDocumentChanged, setIsMessageBoxOpen, setIsOKButtonPressed,
  setIsShowMessageBoxCancel, setMessageBoxText, useIsDocumentChanged, useMessageBox
} from "@/app/store/useDocumentStore";
import { useRouter } from "next/navigation";

interface IEditFormProps {
  legalEntity: LegalEntityForm,
  regions: Region[],
  sections: SectionForm[],
}

export default function EditForm(props: IEditFormProps) {
  const [legalEntity, setLegalEntity] = useState(props.legalEntity);
  const isDocumentChanged = useIsDocumentChanged();
  const msgBox = useMessageBox();
  const router = useRouter();
  const docChanged = () => {
    setIsDocumentChanged(true);
    setMessageBoxText('Документ изменен. Закрыть без сохранения?');
  };
  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDocumentChanged && !msgBox.isOKButtonPressed) {
      setIsShowMessageBoxCancel(true);
      setIsMessageBoxOpen(true);
    } else if (isDocumentChanged && msgBox.isOKButtonPressed) {
    } else if (!isDocumentChanged) {
      router.push('/erp/legal-entities/');
    }
  };
  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    updateLegalEntity(legalEntity);
    setIsDocumentChanged(false);
    setMessageBoxText('Документ сохранен.');
    setIsShowMessageBoxCancel(false);
    setIsMessageBoxOpen(true);
  }
useEffect(() => {
  return () => {
    // Сброс при уходе со страницы
    setIsDocumentChanged(false);
    setIsMessageBoxOpen(false);
    setIsOKButtonPressed(false);
    setIsCancelButtonPressed(false);
    setIsShowMessageBoxCancel(true);
    setMessageBoxText('');
  };
}, []);

  useEffect(() => {
    if (msgBox.isOKButtonPressed && msgBox.messageBoxText === 'Документ изменен. Закрыть без сохранения?') {
      router.push('/erp/regions/');
    }
    setIsOKButtonPressed(false);
    setIsCancelButtonPressed(false);
    setIsDocumentChanged(false);
    setIsMessageBoxOpen(false);
    setIsShowMessageBoxCancel(true);
  }, [msgBox.isOKButtonPressed, router]);

  // const handleRedirectBack = () => {
  //   window.history.back(); // Возвращает пользователя на предыдущую страницу
  // };


  const handleChangeIsCustomer = (event: any) => {
    setLegalEntity((prev) => ({
      ...prev,
      is_customer: !prev.is_customer,
    }));
    docChanged();
  };
  const handleChangeIsSupplier = (event: any) => {
    setLegalEntity((prev) => ({
      ...prev,
      is_supplier: !prev.is_supplier,
    }));
    docChanged();
  };

  const handleSelectRegion = (new_region_id: string, new_region_name: string) => {
    setLegalEntity((prev) => ({
      ...prev,
      region_id: new_region_id,
      region_name: new_region_name,
    }));
    docChanged();
  };
  const handleSelectSection = (new_section_id: string, new_section_name: string) => {
    setLegalEntity((prev) => ({
      ...prev,
      section_id: new_section_id,
      section_name: new_section_name,
    }));
    docChanged();
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
              onChange={(e) => { setLegalEntity((prev) => ({ ...prev, name: e.target.value, })); docChanged();}}
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
              onChange={(e) => { setLegalEntity((prev) => ({ ...prev, fullname: e.target.value, })); docChanged(); }}
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
              onChange={(e) => { setLegalEntity((prev) => ({ ...prev, address_legal: e.target.value, })); docChanged(); }}
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
              onChange={(e) => { setLegalEntity((prev) => ({ ...prev, email: e.target.value, })); docChanged(); }}
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
              onChange={(e) => { setLegalEntity((prev) => ({ ...prev, phone: e.target.value, })); docChanged(); }}
            />
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
              className="w-13/16 pointer-events-none control rounded-md border border-gray-200 p-2"
              value={legalEntity.region_name ?? ''}
              readOnly
              onChange={(e) => { setLegalEntity((prev) => ({ ...prev, region_id: e.target.value, })); docChanged(); }}
            />
            <BtnRegionsRef
              regions={props.regions}
              handleSelectRegion={handleSelectRegion}
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
              onChange={(e) => { setLegalEntity((prev) => ({ ...prev, contact: e.target.value, })); docChanged(); }}
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
              onChange={(e) => { setLegalEntity((prev) => ({ ...prev, inn: e.target.value, })); docChanged(); }}
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
              onChange={(e) => { setLegalEntity((prev) => ({ ...prev, kpp: e.target.value, })); docChanged(); }}
            />
          </div>

          <RadioActiveIsCustomer legalEntity={legalEntity} handleChange={handleChangeIsCustomer} />
          <RadioActiveIsSupplier legalEntity={legalEntity} handleChange={handleChangeIsSupplier} />

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
              value={legalEntity.section_name}
              readOnly
              onChange={(e) => { setLegalEntity((prev) => ({ ...prev, section_id: e.target.value, })); docChanged(); }}
            // onKeyDown={(e) => handleKeyDown(e)}
            />
            <BtnSectionsRef sections={props.sections} handleSelectSection={handleSelectSection} />
          </div>
        </div>
      </div>
      {/* buttons area */}
      <div className="flex justify-between mt-4 mr-4">
        <div className="flex w-full md:w-1/2">
          <div className="w-full md:w-1/2">
            <button
              onClick={handleSaveClick}
              className="bg-blue-400 text-white w-full rounded-md border p-2 
              hover:bg-blue-100 hover:text-gray-500 cursor-pointer"
            >
              Сохранить
            </button>
          </div>
          <div className="w-full md:w-1/2">
            <button
              onClick={handleBackClick}
              className="bg-blue-400 text-white w-full rounded-md border p-2
                 hover:bg-blue-100 hover:text-gray-500 cursor-pointer"
            >
              Back to list
            </button>
          </div>
        </div>
      </div>
      <MessageBoxOKCancel />
    </div>
  );
}
