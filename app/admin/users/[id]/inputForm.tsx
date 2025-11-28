'use client';
import { useEffect, useState } from "react";
import { RoleForm, SectionForm, Tenant, UserForm } from "@/app/lib/definitions";
import { TrashIcon } from "@heroicons/react/24/outline";
import BtnRolesRef from "@/app/admin/roles/lib/btnRolesRef";
import {
  setIsCancelButtonPressed, setIsDocumentChanged, setIsMessageBoxOpen,
  setIsOKButtonPressed, setIsShowMessageBoxCancel, setMessageBoxText, useIsDocumentChanged,
  useMessageBox
} from "@/app/store/useDocumentStore"; import { useRouter } from 'next/navigation';
import MessageBoxOKCancel from "@/app/lib/MessageBoxOKCancel";
import RadioAdmin from "../lib/radioAdmin";
import { updUser } from "../lib/store/useUserStore";


interface IInputFormProps {
  user: UserForm,
  tenants: Tenant[],
  user_roles: RoleForm[],
  roles: RoleForm[],
  admin: boolean,
}
// export const InputForm: React.FC<IInputFormProps> = (props: IInputFormProps) => {

export default function InputForm(props: IInputFormProps) {
  const [user, setUser] = useState<UserForm>(props.user);
  const [userRoles, setUserRoles] = useState<RoleForm[]>(props.user_roles);

  const router = useRouter();
  const isDocumentChanged = useIsDocumentChanged();
  const msgBox = useMessageBox();


  const handleSelectRole = (
    new_role_id: string,
    new_role_name: string,
    new_role_description: string,
    new_role_tenant_id: string,
    new_role_tenant_name: string,
  ) => {
    setUserRoles(userRoles.concat({
      id: new_role_id,
      name: new_role_name,
      tenant_id: new_role_tenant_id,
      tenant_name: new_role_tenant_name,
      description: new_role_description,
    }));
    prepareUserRoleIds(userRoles.concat({
      id: new_role_id,
      name: new_role_name,
      tenant_id: new_role_tenant_id,
      tenant_name: new_role_tenant_name,
      description: new_role_description,
    }));
    setIsDocumentChanged(true);
    setMessageBoxText('Документ изменен. Закрыть без сохранения?');
  };
  const prepareUserRoleIds = (user_roles: RoleForm[]) => {
    setUser((prev) => ({
      ...prev,
      role_ids: "{" + user_roles.map((role) => role.id).join(",") + "}",
    }));
  };
  const handleChangeName = (event: any) => {
    setUser((prev) => ({
      ...prev,
      name: event.target.value,
      email: event.target.value,
    }));
    setIsDocumentChanged(true);
    setMessageBoxText('Документ изменен. Закрыть без сохранения?');
  };
  const handleChangeAdminStatus = (event: any) => {
    setUser((prev) => ({
      ...prev,
      is_admin: !prev.is_admin,
    }));
    setIsDocumentChanged(true);
    setMessageBoxText('Документ изменен. Закрыть без сохранения?');
  };
  const handleSelectTenant = (event: any) => {
    setUser((prev) => ({
      ...prev,
      tenant_id: event.target.value,
    }));
    setIsDocumentChanged(true);
    setMessageBoxText('Документ изменен. Закрыть без сохранения?');
  };
  const handleDeleteUserRole = (role_id: string) => {
    setUserRoles(userRoles.filter((role) => role.id !== role_id));
    prepareUserRoleIds(userRoles.filter((role) => role.id !== role_id));
    setIsDocumentChanged(true);
    setMessageBoxText('Документ изменен. Закрыть без сохранения?');
  }
  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDocumentChanged && !msgBox.isOKButtonPressed) {
      setIsShowMessageBoxCancel(true);
      setIsMessageBoxOpen(true);
    } else if (isDocumentChanged && msgBox.isOKButtonPressed) {
    } else if (!isDocumentChanged) {
      router.push('/admin/users/');
    }
  };
  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    updUser(user.id, user);
    setIsDocumentChanged(false);
    setMessageBoxText('Документ сохранен.');
    setIsShowMessageBoxCancel(false);
    setIsMessageBoxOpen(true);
  }
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
      router.push('/admin/users/');
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
      {/* <h3>{show && "Нажата клавиша Enter"}</h3> */}
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
          />
        </div>

        <div></div>
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

        <div className="w-1/2"></div>
        <RadioAdmin user={user} handleChangeAdminStatus={handleChangeAdminStatus} />
        <div></div>

        <div></div>
      </div>

      {/* userRoles table area */}
      <div className="flex flex-row gap-4 w-full md:w-1/2">
        <h2 className="px-2 pt-10 font-medium">Роли:</h2>

      </div>


      <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
        <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
          <tr>
            <th scope="col" className="w-6/16 overflow-hidden px-0 py-5 font-medium sm:pl-6">
              Роль
            </th>
            <th scope="col" className="w-4/16 px-3 py-5 font-medium">
              Организация
            </th>
            <th scope="col" className="w-4/16 px-3 py-5 font-medium">
              Описание
            </th>
            <th scope="col" className="w-2/16 px-3 py-5 font-medium">
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 text-gray-900">
          {userRoles.map((role) => (
            <tr key={role.id} className="group">
              <td className="w-6/16 overflow-hidden whitespace-nowrap text-ellipsis bg-white py-1 pl-0 text-left  
                      pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                <div className="flex items-left gap-3">
                  <a
                    href={"/admin/roles/" + role.id + "/edit"}
                    className="text-blue-800 underline"
                  >{role.name.substring(0, 36)}</a>
                </div>
              </td>
              <td className="w-4/8 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                {role.tenant_name}
              </td>
              <td className="w-4/8 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                {role.description}
              </td>
              <td className="w-2/16 whitespace-nowrap pl-4 py-1 pr-3">
                <div className="flex justify-end gap-3">
                  <button className="rounded-md border border-gray-200 p-2 h-10 hover:bg-gray-100 
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => handleDeleteUserRole(role.id)}>
                    <span className="sr-only">Delete</span>
                    <TrashIcon className="w-5 h-5 text-gray-800" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>


      {/* добавить роль */}
      <div className="flex justify-left mt-1">
        <div className="p-2">Добавить роль (выберите):</div>
        <BtnRolesRef roles={props.roles} handleSelectRole={handleSelectRole} />
      </div>

      {/* кнопки */}
      <div className="flex justify-between mt-6">
        <div className="flex w-1/2">
          <div className="w-1/2">
            <button
              disabled={!props.admin}
              onClick={handleSaveClick}
              className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-100 hover:text-gray-500"
            >
              Save
            </button>
          </div>
          <div className="w-1/2">
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
