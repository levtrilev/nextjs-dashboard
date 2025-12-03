// Permission EditForm

'use client';
import { useEffect, useState } from "react";
import { Permission, RoleForm, SectionForm, Tenant } from "@/app/lib/definitions";
import Link from "next/link";
import BtnTenantsRef from "@/app/admin/tenants/lib/btn-tenants-ref";
import { lusitana } from "@/app/ui/fonts";
import MessageBoxOKCancel from "@/app/lib/message-box-ok-cancel";
import {
  setIsCancelButtonPressed, setIsDocumentChanged, setIsMessageBoxOpen,
  setIsOKButtonPressed, setIsShowMessageBoxCancel, setMessageBoxText, useIsDocumentChanged,
  useMessageBox
} from "@/app/store/useDocumentStore";
import { updatePermission } from "../../lib/permissios-actions";
import BtnRolesRef from "../../../roles/lib/btn-roles-ref";

interface IPermissionEditFormProps {
  permission: Permission,
  doctypes: { table_name: string }[],
  tenants: Tenant[],
  roles: RoleForm[]
}

export default function PermissionEditForm(props: IPermissionEditFormProps) {
  const [permission, setPermission] = useState(props.permission);
  const isDocumentChanged = useIsDocumentChanged();
  const msgBox = useMessageBox();

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

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDocumentChanged && !msgBox.isOKButtonPressed) {
      setIsShowMessageBoxCancel(true);
      setIsMessageBoxOpen(true);
    } else if (isDocumentChanged && msgBox.isOKButtonPressed) {
    } else if (!isDocumentChanged) {
      window.history.back(); // Возвращает пользователя на предыдущую страницу
    }
  };
  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (permission.can_recall && !(permission.reader || permission.author)) {
      setMessageBoxText('Право отзывать не имеет смысла если нет прав Автор или Читатель.');
      setIsShowMessageBoxCancel(false);
      setIsMessageBoxOpen(true);
      return;
    }
    if (permission.can_delete && !(permission.reader || permission.author)) {
      setMessageBoxText('Право удалять не имеет смысла если нет прав Автор или Читатель.');
      setIsShowMessageBoxCancel(false);
      setIsMessageBoxOpen(true);
      return;
    }
    try {
      await updatePermission(permission);
      setIsDocumentChanged(false);
      setMessageBoxText('Документ сохранен.');
    } catch (error) {
      setMessageBoxText('Документ не сохранен.' + String(error));
    }
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
  }, [msgBox.isOKButtonPressed]);
  return (

    <div >
      <div id="header" className="flex flex-col md:flex-row gap-4 w-full">
        {/* first column */}
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          {/* role_name */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="role_name"
              className={`${lusitana.className} w-2/8 font-medium flex items-center p-2 text-gray-500`}>
              Роль (выберите):
            </label>
            <input
              id="role_name"
              type="text"
              className="w-13/16 pointer-events-none control rounded-md border border-gray-200 p-2"
              value={permission.role_name}
              readOnly
              onChange={(e) => setPermission((prev) => ({ ...prev, role_name: e.target.value, }))}
            />
            <BtnRolesRef roles={props.roles} handleSelectRole={handleSelectRole} />
          </div>
          {/* doctype_name */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="doctype_name"
              className={`${lusitana.className} w-2/8 font-medium flex items-center p-2 text-gray-500`}
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
              className={`${lusitana.className} w-2/8 font-medium flex items-center p-2 text-gray-500`}>
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
          <div className="flex justify-between w-1/2 mt-1">
            <label
              htmlFor="full_access"
              className={`${lusitana.className} w-7/10 font-medium flex items-center p-2 text-gray-500`}>
              Полный доступ:
            </label>
            <input
              id="full_access"
              type="checkbox"
              className="w-3/10 control rounded-md p-2"
              checked={permission.full_access}
              onChange={(e) => { setPermission((prev) => ({ ...prev, full_access: e.target.checked, })); docChanged(); }}
            />
          </div>
          <div className="flex justify-between w-1/2 mt-1">
            <label
              htmlFor="author"
              className={`${lusitana.className} w-7/10 font-medium flex items-center p-2 text-gray-500`}>
              Автор:
            </label>
            <input
              id="author"
              type="checkbox"
              className="w-3/10 control rounded-md p-2"
              checked={permission.author}
              onChange={(e) => { setPermission((prev) => ({ ...prev, author: e.target.checked, })); docChanged(); }}
            />
          </div>
          <div className="flex justify-between w-1/2 mt-1">
            <label
              htmlFor="reader"
              className={`${lusitana.className} w-7/10 font-medium flex items-center p-2 text-gray-500`}>
              Читатель:
            </label>
            <input
              id="reader"
              type="checkbox"
              className="w-3/10 control rounded-md p-2"
              checked={permission.reader}
              onChange={(e) => { setPermission((prev) => ({ ...prev, reader: e.target.checked, })); docChanged(); }}
            />
          </div>
          <div className="flex justify-between w-1/2 mt-1">
            <label
              htmlFor="can_recall"
              className={`${lusitana.className} w-7/10 font-medium flex items-center p-2 text-gray-500`}>
              Право отзывать:
            </label>
            <input
              id="can_recall"
              type="checkbox"
              className="w-3/10 control rounded-md p-2"
              checked={permission.can_recall}
              onChange={(e) => { setPermission((prev) => ({ ...prev, can_recall: e.target.checked, })); docChanged(); }}
            />
          </div>
          <div className="flex justify-between w-1/2 mt-1">
            <label
              htmlFor="can_delete"
              className={`${lusitana.className} w-7/10 font-medium flex items-center p-2 text-gray-500`}>
              Право удалять:
            </label>
            <input
              id="can_delete"
              type="checkbox"
              className="w-3/10 control rounded-md p-2"
              checked={permission.can_delete}
              onChange={(e) => { setPermission((prev) => ({ ...prev, can_delete: e.target.checked, })); docChanged(); }}
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
