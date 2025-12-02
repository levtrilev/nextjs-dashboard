// Role EditForm

'use client';
import { useEffect, useState } from "react";
import { Permission, RoleForm, SectionForm, Tenant } from "@/app/lib/definitions";
import Link from "next/link";
import BtnTenantsRef from "@/app/admin/tenants/lib/btnTenantsRef";
import { TrashIcon } from "@heroicons/react/24/outline";
import { lusitana } from "@/app/ui/fonts";
import MessageBoxOKCancel from "@/app/lib/MessageBoxOKCancel";
import { useRouter } from 'next/navigation';
import {
  setIsCancelButtonPressed, setIsDocumentChanged, setIsMessageBoxOpen,
  setIsOKButtonPressed, setIsShowMessageBoxCancel, setMessageBoxText, useIsDocumentChanged,
  useMessageBox
} from "@/app/store/useDocumentStore";
import { updatePermission } from "../../lib/permissiosActions";
import BtnRolesRef from "../../../roles/lib/btnRolesRef";

interface IPermissionEditFormProps {
  permission: Permission,
  doctypes: { table_name: string }[],
  tenants: Tenant[],
  roles: RoleForm[]
}

export default function PermissionEditForm(props: IPermissionEditFormProps) {
  const [permission, setPermission] = useState(props.permission);
  const router = useRouter();
  const isDocumentChanged = useIsDocumentChanged();
  const msgBox = useMessageBox();

  // const handleRedirectBack = () => {
  //   window.history.back(); // Возвращает пользователя на предыдущую страницу
  // };
  const docChanged = () => {
    setIsDocumentChanged(true);
    setMessageBoxText('Документ изменен. Закрыть без сохранения?');
  }
  const handleChangeDoctypeName = (event: any) => {
    setPermission((prev) => ({
      ...prev,
      doctype_name: event.target.value,
    }));
    docChanged();
  };
  const handleChangeDoctype = (event: any) => {
    setPermission((prev) => ({
      ...prev,
      doctype: event.target.value,
    }));
    docChanged();
  };
  const handleSelectTenant = (tenant_id: string, tenant_name: string) => {
    setPermission((prev) => ({
      ...prev,
      tenant_id: tenant_id,
      tenant_name: tenant_name,
    }));
    docChanged();
  }
  
    const handleSelectRole = (role_id: string, role_name: string) => {
    setPermission((prev) => ({
      ...prev,
      role_id: role_id,
      role_name: role_name,
    }));
    docChanged();
  }
  const prepareRoleSectionIds = (role_sections: SectionForm[]) => {
    setPermission((prev) => ({
      ...prev,
      section_ids: "{" + role_sections.map((section) => section.id).join(",") + "}",
      section_names: "{" + role_sections.map((section) => section.name).join(",") + "}",
    }));
    docChanged();
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDocumentChanged && !msgBox.isOKButtonPressed) {
      setIsShowMessageBoxCancel(true);
      setIsMessageBoxOpen(true);
    } else if (isDocumentChanged && msgBox.isOKButtonPressed) {
    } else if (!isDocumentChanged) {
      // router.push('/admin/roles');
      window.history.back(); // Возвращает пользователя на предыдущую страницу
    }
  };
  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    updatePermission(permission);
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
      // router.push('/admin/roles/');
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
      <div id="header" className="flex flex-col md:flex-row gap-4 w-full">
        {/* first column */}
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          {/* doctype_name */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="doctype_name"
              className={`${lusitana.className} w-2/8 font-medium flex items-center p-2 text-gray-400`}
            >
              Тип документа:
            </label>
            <input
              id="doctype_name"
              type="text"
              className="w-13/16 control rounded-md border border-gray-200 p-2"
              value={permission.doctype_name}
              onChange={(e) => handleChangeDoctypeName(e)}
            />
          </div>

          {/* tenant_name */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="tenant_name"
              className={`${lusitana.className} w-2/8 font-medium flex items-center p-2 text-gray-400`}>
              Организация:
            </label>
            <input
              id="tenant_name"
              type="text"
              className="w-13/16 pointer-events-none control rounded-md border border-gray-200 p-2"
              value={permission.tenant_name}
              readOnly
              onChange={(e) => setPermission((prev) => ({ ...prev, tenant_name: e.target.value, }))}
            />
            <BtnTenantsRef tenants={props.tenants} handleSelectTenant={handleSelectTenant} />
          </div>

        </div>
        {/* second column */}
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          {/* full_access */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="full_access"
              className={`${lusitana.className} w-2/8 font-medium flex items-center p-2 text-gray-400`}>
              Полный доступ:
            </label>
            <input
              id="full_access"
              type="сheckbox"
              className="w-13/16 control rounded-md border border-gray-200 p-2"
              value={permission.full_access ? "checked" : "unchecked"}
              onChange={(e) => setPermission((prev) => ({ ...prev, full_access: e.target.value === "checked" ? true : false, }))}
            />
          </div>
          {/* add section */}
          <div className="flex justify-between mt-1">
            <div className={`${lusitana.className} p-2 text-gray-400`}>Добавить раздел (выберите):</div>
            <BtnRolesRef roles={props.roles} handleSelectRole={handleSelectRole} />
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
            <Link href={"#"} >
              <button
                onClick={handleBackClick}
                className="bg-blue-400 text-white w-full rounded-md border p-2
                 hover:bg-blue-100 hover:text-gray-500 cursor-pointer"
              >
                Закрыть
              </button>
            </Link>
          </div>
        </div>
      </div>
      <MessageBoxOKCancel />
    </div >

  );
}
