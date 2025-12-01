
// Region EditForm

'use client';
import { useEffect, useState } from "react";
import { RegionForm, SectionForm } from "@/app/lib/definitions";
import { updateRegion } from "../../lib/region-actions";
import BtnSectionsRef from "@/app/admin/sections/lib/btnSectionsRef";
import MessageBoxOKCancel from "@/app/lib/MessageBoxOKCancel";
import {
  setIsCancelButtonPressed, setIsDocumentChanged, setIsMessageBoxOpen, setIsOKButtonPressed,
  setIsShowMessageBoxCancel, setMessageBoxText, useIsDocumentChanged, useMessageBox
} from "@/app/store/useDocumentStore";
import { useRouter } from "next/navigation";

interface IEditFormProps {
  region: RegionForm,
  sections: SectionForm[],
}

export default function EditForm(props: IEditFormProps) {
  const [region, setRegion] = useState(props.region);
  //#region msgBox
  //================================================================
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
      // router.push('/erp/regions/');
      window.history.back();
    }
  };
  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    updateRegion(region);
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
      // router.push('/erp/regions/');
      window.history.back();
    }
    setIsOKButtonPressed(false);
    setIsCancelButtonPressed(false);
    setIsDocumentChanged(false);
    setIsMessageBoxOpen(false);
    setIsShowMessageBoxCancel(true);
  }, [msgBox.isOKButtonPressed, router]);
  //================================================================
  //#endregion
  const handleSelectSection = (new_section_id: string, new_section_name: string) => {
    setRegion((prev) => ({
      ...prev,
      section_id: new_section_id,
      section_name: new_section_name,
    }));
    setIsDocumentChanged(true);
    setMessageBoxText('Документ изменен. Закрыть без сохранения?');
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
              onChange={(e) => { setRegion((prev) => ({ ...prev, name: e.target.value, })); docChanged(); }}
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
              onChange={(e) => { setRegion((prev) => ({ ...prev, capital: e.target.value, })); docChanged(); }}
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
              value={region.section_name}
              readOnly
              onChange={(e) => { setRegion((prev) => ({ ...prev, section_id: e.target.value, })); docChanged(); }}
            // onKeyDown={(e) => handleKeyDown(e)}
            />
            <BtnSectionsRef sections={props.sections} handleSelectSection={handleSelectSection} />
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
              onChange={(e) => { setRegion((prev) => ({ ...prev, area: e.target.value, })); docChanged(); }}
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
              onChange={(e) => { setRegion((prev) => ({ ...prev, code: e.target.value, })); docChanged(); }}
            />
          </div>
        </div>
      </div>
      {/* button area */}
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
              Закрыть
            </button>
          </div>
        </div>
      </div>
      <MessageBoxOKCancel />
    </div>
  );
}
