
// Region EditForm

'use client';
import { useEffect, useState } from "react";
import { RegionForm, SectionForm } from "@/app/lib/definitions";
import { updateRegion } from "../../lib/region-actions";
import BtnSectionsRef from "@/app/admin/sections/lib/btn-sections-ref";
import MessageBoxOKCancel from "@/app/lib/message-box-ok-cancel";
import {
  setIsCancelButtonPressed, setIsDocumentChanged, setIsMessageBoxOpen, setIsOKButtonPressed,
  setIsShowMessageBoxCancel, setMessageBoxText, useDocumentStore, useIsDocumentChanged, useMessageBox
} from "@/app/store/useDocumentStore";
import { useRouter } from "next/navigation";
// import { TagInput } from "@/app/lib/tags/tag-input";
import { upsertTags } from "@/app/lib/tags/tags-actions";
import { lusitana } from "@/app/ui/fonts";
import { useAccessTagStore, useUserTagStore } from "@/app/lib/tags/tag-store";
import { TagInput } from "@/app/lib/tags/tag-input";


interface IEditFormProps {
  region: RegionForm;
  lockedByUserId: string | null;
  unlockAction: (id: string, userId: string) => Promise<void>;
  readonly: boolean;
}

export default function RegionEditForm(props: IEditFormProps) {
  const [region, setRegion] = useState(props.region);
  //#region main
  //================================================================
  const isDocumentChanged = useIsDocumentChanged();
  const msgBox = useMessageBox();
  const router = useRouter();
  const sessionUser = useDocumentStore.getState().sessionUser;
  const docTenantId = useDocumentStore.getState().documentTenantId;

  const addUserTag = useUserTagStore().addTag;
  const addAccessTag = useAccessTagStore().addTag;
  const docChanged = () => {
    setIsDocumentChanged(true);
    setMessageBoxText('Документ изменен. Закрыть без сохранения?');
  };
  const handleChangeUserTags = (event: any) => {
    const currentTags = useUserTagStore.getState().selectedTags
    setRegion((prev) => ({
      ...prev,
      user_tags: currentTags,
    }));
    docChanged();
  };
  const handleChangeAccessTags = (event: any) => {
    const currentTags = useAccessTagStore.getState().selectedTags
    setRegion((prev) => ({
      ...prev,
      access_tags: currentTags,
    }));
    docChanged();
  };
  const handleBackClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    await props.unlockAction(region.id, sessionUser.id);
    if (isDocumentChanged && !msgBox.isOKButtonPressed) {
      setIsShowMessageBoxCancel(true);
      setIsMessageBoxOpen(true);
    } else if (isDocumentChanged && msgBox.isOKButtonPressed) {
    } else if (!isDocumentChanged) {
      // router.push('/erp/regions/');
      window.history.back();
    }
  };
  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await upsertTags(region.user_tags, docTenantId);
      useDocumentStore.getState().addAllTags(region.user_tags);
      await upsertTags(region.access_tags, docTenantId);
      useDocumentStore.getState().addAllTags(region.access_tags);

      await updateRegion(region);
      // await props.unlockAction(region.id, sessionUser.id); // Разблокировка - убрать после отладки (ведь форма не закрыта)
      setIsDocumentChanged(false);
      setMessageBoxText('Документ сохранен.');
    } catch (error) {
      setMessageBoxText('Документ не сохранен.' + String(error));
    }
    setIsShowMessageBoxCancel(false);
    setIsMessageBoxOpen(true);
  }
  useEffect(() => {
    // const handleBeforeUnload = () => {
    //   console.log('beforeunload sessionUserId: ' + sessionUser.id);
    //   props.unlockAction(region.id, sessionUser.id);
    // };
    // // Снимаем блокировку при уходе со страницы
    // window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {

      // window.removeEventListener('beforeunload', handleBeforeUnload);
      // props.unlockAction(region.id, sessionUser.id); // на всякий случай

      // Сброс MessageBox при уходе со страницы
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

  // useEffect(() => {
  //   useDocumentStore.getState().setAllTags(props.allTags);
  // }, [props.allTags]);

  const handleSelectSection = (new_section_id: string, new_section_name: string) => {
    setRegion((prev) => ({
      ...prev,
      section_id: new_section_id,
      section_name: new_section_name,
    }));
    docChanged();
  };
  //================================================================
  //#endregion

  // useEffect(() => {
  //   const handleBeforeUnload = () => {
  //     props.unlockAction(region.id, sessionUser.id);
  //   };
  //   // Снимаем блокировку при уходе со страницы
  //   window.addEventListener('beforeunload', handleBeforeUnload);
  //   return () => {
  //     window.removeEventListener('beforeunload', handleBeforeUnload);
  //     props.unlockAction(region.id, sessionUser.id); // на всякий случай
  //   };
  // }, [props.unlockAction, region.id]);

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
              disabled={props.readonly}
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
              disabled={props.readonly}
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
              disabled={props.readonly}
              value={region.section_name}
              readOnly
              onChange={(e) => { setRegion((prev) => ({ ...prev, section_id: e.target.value, })); docChanged(); }}
            // onKeyDown={(e) => handleKeyDown(e)}
            />
            {!props.readonly && <BtnSectionsRef handleSelectSection={handleSelectSection} />}
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
              disabled={props.readonly}
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
              disabled={props.readonly}
              value={region.code}
              onChange={(e) => { setRegion((prev) => ({ ...prev, code: e.target.value, })); docChanged(); }}
            />
          </div>
        </div>
      </div>
      {/* user_tags */}
      <div className="flex max-w-[1150] mt-4">
        <label
          htmlFor="user_tags"
          className={`${lusitana.className} w-[130px] font-medium flex items-center p-2 text-gray-500`}>
          Тэги:
        </label>
        <TagInput
          id="user_tags"
          value={region.user_tags}
          onAdd={addUserTag}
          handleFormInputChange={handleChangeUserTags}
          readonly={props.readonly}
        />
      </div>
      {/* access_tags */}
      <div className="flex max-w-[1150] mt-4">
        <label
          htmlFor="access_tags"
          className={`${lusitana.className} w-[130px] font-medium flex items-center p-2 text-gray-500`}>
          Тэги доступа:
        </label>
        <TagInput
          id="access_tags"
          value={region.access_tags}
          onAdd={addAccessTag}
          handleFormInputChange={handleChangeAccessTags}
          readonly={props.readonly}
        />
      </div>
      {/* button area */}
      <div className="flex justify-between mt-4 mr-4">
        <div className="flex w-full md:w-1/2">
          <div className="w-full md:w-1/2">
            <button
              disabled={props.readonly}
              onClick={handleSaveClick}
              className={`w-full rounded-md border p-2 ${props.readonly
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-400 text-white hover:bg-blue-100 hover:text-gray-500 cursor-pointer'
                }`}
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
              {props.readonly ? 'Закрыть' : 'Закрыть и освободить'}
            </button>
          </div>
        </div>
      </div>
      <MessageBoxOKCancel />
    </div>
  );
}
