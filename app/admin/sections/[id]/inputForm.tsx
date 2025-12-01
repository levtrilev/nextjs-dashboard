'use client';
import { useEffect, useState } from "react";
import { SectionForm, Tenant } from "@/app/lib/definitions";
import MessageBoxOKCancel from "@/app/lib/MessageBoxOKCancel";
import { useRouter } from 'next/navigation';
import {
  setIsCancelButtonPressed, setIsDocumentChanged, setIsMessageBoxOpen,
  setIsOKButtonPressed, setIsShowMessageBoxCancel, setMessageBoxText, useIsDocumentChanged,
  useMessageBox
} from "@/app/store/useDocumentStore";
import { updSection } from "../lib/store/useSectionStore";

interface IInputFormProps {
  section: SectionForm,
  tenants: Tenant[],
  admin: boolean,
}

export default function InputForm(props: IInputFormProps) {
  const [section, setSection] = useState<SectionForm>(props.section);
  const router = useRouter();
  const isDocumentChanged = useIsDocumentChanged();
  const msgBox = useMessageBox();

  const handleChangeName = (event: any) => {
    setSection((prev) => ({
      ...prev,
      name: event.target.value,
    }));
    setIsDocumentChanged(true);
    setMessageBoxText('Документ изменен. Закрыть без сохранения?');
  };
  const handleSelectTenant = (event: any) => {
    setSection((prev) => ({
      ...prev,
      tenant_id: event.target.value,
    }));
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
      // router.push('/admin/sections/');
      window.history.back();
    }
  };
  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    updSection(section.id, {
      ...section,
      name: section.name,
      tenant_id: section.tenant_id
    });
    setIsDocumentChanged(false);
    setMessageBoxText('Документ сохранен.');
    setIsShowMessageBoxCancel(false);
    setIsMessageBoxOpen(true);
  };
  useEffect(() => {
    setIsDocumentChanged(false);

    setIsMessageBoxOpen(false);
    setIsOKButtonPressed(false);
    setIsCancelButtonPressed(false);
    setIsShowMessageBoxCancel(true);
    setMessageBoxText('');
  }, []);

  useEffect(() => {
    if (msgBox.isOKButtonPressed && msgBox.messageBoxText === 'Документ изменен. Закрыть без сохранения?') {
      // router.push('/admin/sections/');
      window.history.back();
    }
    setIsOKButtonPressed(false);
    setIsCancelButtonPressed(false);
    setIsShowMessageBoxCancel(true);
    setIsDocumentChanged(false);
    setIsMessageBoxOpen(false);
  }, [msgBox.isOKButtonPressed, router]);
  return (
    <div >
      {/* className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md" */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex justify-between mt-6">
          <label htmlFor="name" className="text-sm font-medium">
            Name:
          </label>
          <input
            id="name"
            type="text"
            className="control rounded-md border border-gray-200"
            value={section.name}
            onChange={(e) => handleChangeName(e)}
          />
        </div>
        <div></div>
        <div className="flex-1">
          <select
            id="selectTenant"
            name="tenantId"
            value={section.tenant_id}
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
        <div className="flex w-1/2">
          <div className="w-1/2">
            <button
              disabled={!props.admin}
              onClick={handleSaveClick}
              className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-100 hover:text-gray-500"
            >
              Сохранить
            </button>
          </div>
          <div className="w-1/2">
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
