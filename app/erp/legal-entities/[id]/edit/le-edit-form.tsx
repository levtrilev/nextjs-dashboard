
// LegalEntity EditForm

'use client';
import { useEffect, useState } from "react";
import { KeyboardEvent } from "react";
import { LegalEntityForm, Region, Section, SectionForm } from "@/app/lib/definitions";
import { updateLegalEntity } from "../../lib/le-actions";
import { RadioActiveIsSupplier } from "@/app/erp/legal-entities/lib/radio-active";
import RadioActiveIsCustomer from "@/app/erp/legal-entities/lib/radio-active";
import BtnRegionsRef from "@/app/erp/regions/lib/btn-regions-ref";
import BtnSectionsRef from "@/app/admin/sections/lib/btn-sections-ref";
import MessageBoxOKCancel from "@/app/lib/message-box-ok-cancel";
import {
  setIsCancelButtonPressed, setIsDocumentChanged, setIsMessageBoxOpen, setIsOKButtonPressed,
  setIsShowMessageBoxCancel, setMessageBoxText, useDocumentStore, useIsDocumentChanged, useMessageBox
} from "@/app/store/useDocumentStore";
import { useRouter } from "next/navigation";
import { useAccessTagStore, useUserTagStore } from "@/app/lib/tags/tag-store";
import { upsertTags } from "@/app/lib/tags/tags-actions";
import { TagInput } from "@/app/lib/tags/tag-input";
import { lusitana } from "@/app/ui/fonts";

interface IEditFormProps {
  legalEntity: LegalEntityForm;
  regions: Region[];
  unlockAction: ((tableName: string, id: string, userId: string) => Promise<void>) | null;
  readonly: boolean;
}

export default function LegalEntitiesEditForm(props: IEditFormProps) {
  const sessionUser = useDocumentStore.getState().sessionUser;

  const [legalEntity, setLegalEntity] = useState(props.legalEntity);
  const docTenantId = useDocumentStore.getState().documentTenantId;
  const isDocumentChanged = useIsDocumentChanged();
  const msgBox = useMessageBox();
  const router = useRouter();
  // const setAllUserTags = useUserTagStore().setAllTags;
  // const setAllAccessTags = useAccessTagStore().setAllTags;
  const addUserTag = useUserTagStore().addTag;
  const addAccessTag = useAccessTagStore().addTag;
  const docChanged = () => {
    setIsDocumentChanged(true);
    setMessageBoxText('Документ изменен. Закрыть без сохранения?');
  };
  const handleChangeUserTags = (event: any) => {
    const currentTags = useUserTagStore.getState().selectedTags
    setLegalEntity((prev) => ({
      ...prev,
      user_tags: currentTags,
    }));
    docChanged();
  };
  const handleChangeAccessTags = (event: any) => {
    const currentTags = useAccessTagStore.getState().selectedTags
    setLegalEntity((prev) => ({
      ...prev,
      access_tags: currentTags,
    }));
    docChanged();
  };
  // const handleBackClick = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   if (isDocumentChanged && !msgBox.isOKButtonPressed) {
  //     setIsShowMessageBoxCancel(true);
  //     setIsMessageBoxOpen(true);
  //   } else if (isDocumentChanged && msgBox.isOKButtonPressed) {
  //   } else if (!isDocumentChanged) {
  //     // router.push('/erp/legal-entities/');
  //     window.history.back();
  //   }
  // };
  const handleBackClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (props.unlockAction) await props.unlockAction("legal_entities", props.legalEntity.id, sessionUser.id);
    if (isDocumentChanged && !msgBox.isOKButtonPressed) {
      setIsShowMessageBoxCancel(true);
      setIsMessageBoxOpen(true);
    } else if (isDocumentChanged && msgBox.isOKButtonPressed) {
      // уже обработано через OK
    } else if (!isDocumentChanged) {
      window.history.back();
    }
  };
  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await upsertTags(legalEntity.user_tags, docTenantId);
      useDocumentStore.getState().addAllTags(legalEntity.user_tags);
      await upsertTags(legalEntity.access_tags, docTenantId);
      useDocumentStore.getState().addAllTags(legalEntity.access_tags);

      await updateLegalEntity(legalEntity);
      setIsDocumentChanged(false);
      setMessageBoxText('Документ сохранен.');

    } catch (error) {
      setMessageBoxText('Документ не сохранен.' + String(error));
    }
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
              className="w-7/8 disabled:text-gray-400 disabled:bg-gray-100 break-words control rounded-md border border-gray-200 p-2"
              disabled={props.readonly}
              value={legalEntity.name}
              onChange={(e) => { setLegalEntity((prev) => ({ ...prev, name: e.target.value, })); docChanged(); }}
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
              className="w-13/16 disabled:text-gray-400 disabled:bg-gray-100 break-words control rounded-md border border-gray-200 p-2"
              disabled={props.readonly}
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
              className="w-13/16 disabled:text-gray-400 disabled:bg-gray-100 break-words control rounded-md border border-gray-200 p-2"
              disabled={props.readonly}
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
              className="w-13/16 disabled:text-gray-400 disabled:bg-gray-100 break-words control rounded-md border border-gray-200 p-2"
              disabled={props.readonly}
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
              className="w-13/16 disabled:text-gray-400 disabled:bg-gray-100 break-words control rounded-md border border-gray-200 p-2"
              disabled={props.readonly}
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
              className="w-13/16 disabled:text-gray-400 disabled:bg-gray-100 break-words control rounded-md border border-gray-200 p-2"
              disabled={props.readonly}
              value={legalEntity.region_name ?? ''}
              readOnly
              onChange={(e) => { setLegalEntity((prev) => ({ ...prev, region_id: e.target.value, })); docChanged(); }}
            />
            {!props.readonly && <BtnRegionsRef
              regions={props.regions}
              handleSelectRegion={handleSelectRegion}
            />}
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
              className="w-13/16 disabled:text-gray-400 disabled:bg-gray-100 break-words control rounded-md border border-gray-200 p-2"
              disabled={props.readonly}
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
              className="w-13/16 disabled:text-gray-400 disabled:bg-gray-100 break-words control rounded-md border border-gray-200 p-2"
              disabled={props.readonly}
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
              className="w-13/16 disabled:text-gray-400 disabled:bg-gray-100 break-words control rounded-md border border-gray-200 p-2"
              disabled={props.readonly}
              value={legalEntity.kpp}
              onChange={(e) => { setLegalEntity((prev) => ({ ...prev, kpp: e.target.value, })); docChanged(); }}
            />
          </div>

          <RadioActiveIsCustomer legalEntity={legalEntity} handleChange={handleChangeIsCustomer} readonly={props.readonly} />
          <RadioActiveIsSupplier legalEntity={legalEntity} handleChange={handleChangeIsSupplier} readonly={props.readonly} />

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
              className="w-13/16 disabled:text-gray-400 disabled:bg-gray-100 break-words control rounded-md border border-gray-200 p-2"
              disabled={props.readonly}
              value={legalEntity.section_name}
              readOnly
              onChange={(e) => { setLegalEntity((prev) => ({ ...prev, section_id: e.target.value, })); docChanged(); }}
            // onKeyDown={(e) => handleKeyDown(e)}
            />
            {!props.readonly && <BtnSectionsRef handleSelectSection={handleSelectSection} />}
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
        <TagInput id="user_tags" value={legalEntity.user_tags} onAdd={addUserTag} handleFormInputChange={handleChangeUserTags} readonly={props.readonly} />
      </div>
      {/* access_tags */}
      <div className="flex max-w-[1150] mt-4">
        <label
          htmlFor="access_tags"
          className={`${lusitana.className} w-[130px] font-medium flex items-center p-2 text-gray-500`}>
          Тэги доступа:
        </label>
        <TagInput id="access_tags" value={legalEntity.access_tags} onAdd={addAccessTag} handleFormInputChange={handleChangeAccessTags} readonly={props.readonly} />
      </div>
      {/* buttons area */}
      <div className="flex justify-between mt-4 mr-4">
        <div className="flex w-full md:w-1/2">
          <div className="w-full md:w-1/2">
            <button
              disabled={!props.readonly}
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
