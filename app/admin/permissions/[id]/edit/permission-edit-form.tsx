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
import { useRoles } from "@/app/admin/roles/lib/store/use-role-store";
import CollapsibleSection from "@/app/lib/collapsible-section";
import { createTagStore } from "@/app/lib/tags/tag-store";
import { TagInput } from "@/app/lib/tags/tag-input";
import { upsertTags } from "@/app/lib/tags/tags-actions";

interface IPermissionEditFormProps {
  permission: Permission,
  doctypes: { table_name: string }[],
  tenants: Tenant[],
  allTags: string[]
}
export const useOrTagStore = createTagStore();
export const useAndTagStore = createTagStore();
export const useNoTagStore = createTagStore();
export default function PermissionEditForm(props: IPermissionEditFormProps) {
  const [permission, setPermission] = useState(props.permission);
  const isDocumentChanged = useIsDocumentChanged();
  const msgBox = useMessageBox();
  const roles = useRoles().filter((role) => role.tenant_id === permission.tenant_id);

  // const { setAllTags, addTag } = useOrTagStore();
  const setAllOrTags = useOrTagStore().setAllTags;
  const setAllAndTags = useAndTagStore().setAllTags;
  const setAllNoTags = useNoTagStore().setAllTags;
  const addOrTag = useOrTagStore().addTag;
  const addAndTag = useAndTagStore().addTag;
  const addNoTag = useNoTagStore().addTag;
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
  const handleChangeOrTags = (event: any) => {
    const currentTags = useOrTagStore.getState().selectedTags
    setPermission((prev) => ({
      ...prev,
      or_tags: currentTags,
    }));
    docChanged();
  };
  const handleChangeAndTags = (event: any) => {
    const currentTags = useAndTagStore.getState().selectedTags
    setPermission((prev) => ({
      ...prev,
      and_tags: currentTags,
    }));
    docChanged();
  };
  const handleChangeNoTags = (event: any) => {
    const currentTags = useNoTagStore.getState().selectedTags
    setPermission((prev) => ({
      ...prev,
      no_tags: currentTags,
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

    if (permission.can_delete && !(permission.editor || permission.author) && !permission.full_access) {
      setMessageBoxText('Право удалять (окончательно) не имеет смысла если нет прав Редактор или Автор.');
      setIsShowMessageBoxCancel(false);
      setIsMessageBoxOpen(true);
      return;
    }
    try {
      await upsertTags(permission.or_tags, permission.tenant_id);
      await upsertTags(permission.and_tags, permission.tenant_id);
      await upsertTags(permission.no_tags, permission.tenant_id);
      
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
    setAllOrTags(props.allTags);
    setAllNoTags(props.allTags);
    setAllAndTags(props.allTags);
  }, [props.allTags, setAllOrTags, setAllAndTags, setAllNoTags]);

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
            <BtnRolesRef roles={roles} handleSelectRole={handleSelectRole} />
          </div>
          {/* doctype */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="doctype"
              className={`${lusitana.className} w-2/8 font-medium flex items-center p-2 text-gray-500`}
            >
              Таблица (выберите):
            </label>
            <input
              id="doctype"
              type="text"
              className="w-13/16 control rounded-md border border-gray-200 p-2"
              value={permission.doctype_name}
              onChange={(e) => handleChangeDoctype(e)}
            />
          </div>
          {/* doctype_name */}
          <div className="flex justify-between mt-1">
            <label
              htmlFor="doctype_name"
              className={`${lusitana.className} w-2/8 font-medium flex items-center p-2 text-gray-500`}
            >
              Тип документа:
            </label >
            <input disabled
              id="doctype_name"
              type="text"
              className="w-13/16 control rounded-md text-gray-400 border border-gray-200 p-2"
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
            <input disabled
              id="tenant_name"
              type="text"
              className="w-13/16 pointer-events-none control rounded-md text-gray-400 border border-gray-200 p-2"
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
              Полные права:
            </label>
            <input
              id="full_access"
              type="checkbox"
              className="w-3/10 control rounded-md p-2"
              checked={permission.full_access}
              onChange={(e) => { setPermission((prev) => ({ ...prev, full_access: e.target.checked, })); docChanged(); }}
            />
          </div>
          {/* editor */}
          {!permission.full_access && <div className="flex justify-between w-1/2 mt-1">
            <label
              htmlFor="editor"
              className={`${lusitana.className} w-7/10 font-medium flex items-center p-2 text-gray-500`}>
              Редактор:
            </label>
            <input
              id="editor"
              type="checkbox"
              className="w-3/10 control rounded-md p-2"
              checked={permission.editor}
              onChange={(e) => { setPermission((prev) => ({ ...prev, editor: e.target.checked, })); docChanged(); }}
            />
          </div>}
          {/* author */}
          {!permission.full_access && !permission.editor &&
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
            </div>}
          {/* reader */}
          {!permission.full_access && !permission.editor &&
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
            </div>}
          {/* can_delete */}
          {/* Имеет право физического удаления только тех документов, */}
          {/* которые имеет право видеть, то есть Автор - свои, Редактор - все, Читателю нечего удалять - он не видит логически удаленные. */}
          {(!permission.full_access && (permission.author || permission.reader) &&
            !(permission.reader && !permission.full_access && !permission.editor && !permission.author) ||
            (permission.editor && !permission.full_access && !permission.author) ||
            (permission.can_delete && permission.reader && !permission.full_access && !permission.editor && !permission.author)) &&
            <div className="flex justify-between w-1/2 mt-1">
              <label
                htmlFor="can_delete"
                className={`${lusitana.className} w-7/10 font-medium flex items-center p-2 text-gray-500`}>
                Физ.удаление:
              </label>
              <input
                id="can_delete"
                type="checkbox"
                className="w-3/10 control rounded-md p-2"
                checked={permission.can_delete}
                onChange={(e) => { setPermission((prev) => ({ ...prev, can_delete: e.target.checked, })); docChanged(); }}
              />
            </div>}

        </div>
      </div>
      {/* or_tags */}
      <div className="flex max-w-[1150px] mt-4">
        <label
          htmlFor="or_tags"
          className={`${lusitana.className} w-[110px] font-medium flex items-center p-2 text-gray-500`}>
          OR-Тэги:
        </label>
        <TagInput id="or_tags" value={permission.or_tags} onAdd={addOrTag} handleFormInputChange={handleChangeOrTags} />
      </div>
      {/* and_tags */}
      <div className="flex max-w-[1150px] mt-4">
        <label
          htmlFor="and_tags"
          className={`${lusitana.className} w-[110px] font-medium flex items-center p-2 text-gray-500`}>
          AND-Тэги:
        </label>
        <TagInput id="and_tags" value={permission.and_tags} onAdd={addAndTag} handleFormInputChange={handleChangeAndTags} />
      </div>
      {/* no_tags */}
      <div className="flex max-w-[1150px] mt-4">
        <label
          htmlFor="no_tags"
          className={`${lusitana.className} w-[110px] font-medium flex items-center p-2 text-gray-500`}>
          NO-Тэги:
        </label>
        <TagInput id="no_tags" value={permission.no_tags} onAdd={addNoTag} handleFormInputChange={handleChangeNoTags} />
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
      <div className="max-w-[1150px] mt-4">
        <CollapsibleSection
          header={"Описание прав доступа"} >
          <div>
            <strong>Полные права</strong> - читает все записи. физически: создает/изменяет/удаляет. <br />
            логически: делегирует, утверждает, отзывает статус утверждения, удаляет, восстанавливает удаленные<br />
            <strong>Читатель</strong> - читает (только утвержденные!) документы всех Авторов, без возможности отзыва/редактирования/удаления/восстановления<br />
            <strong>Автор</strong> - читает (только свои!) draft/active/deleted документы, <br />
            создает draft/изменяет draft/утверждает draft/отзывает active/удаляет draft/восстанавливает deleted (только свои!) документы.<br />
            Если Автор не является Читателем, - он не видит документы других Авторов.<br />
            <strong>Редактор</strong> - имеет права Автора над документами других Авторов и сам является Автором своих документов. <br />
            После изменения "чужого" документа не становится Автором - его имя (user_id) остается в поле "editor". <br />
            Имеет право делегировать авторство другому пользователю, в том числе себе.<br />
            <strong>Физическое удаление</strong> - без влияния на чтение. Имеет право физического удаления только логически-удаленных документов,
            тех, которые имеет право видеть, то есть Автор - свои, Редактор - все, Читателю нечего удалять - он не видит логически удаленные.<br />
            <strong>Доступ по тэгам</strong> - при указанном данном признаке(tags-access) доступ осуществляется при наличии в документе
            указанных тэгов - поле "tags" (тип JSONB). В полномочиях отдельно указываются тэги, учитывающиеся по "И", по "ИЛИ" и по "НЕ"<br />
            Например доступ по ИЛИ-тэгам : SELECT * FROM records WHERE tags ? 'internal' OR tags ? 'спб'<br />
            Доступ по НЕ-тэгам : SELECT * FROM records WHERE NOT (tags ? 'confidential')
          </div>
        </CollapsibleSection>
      </div>
      <MessageBoxOKCancel />
    </div >

  );
}
