// Premise EditForm
'use client';
import { useEffect, useState } from "react";
import { DocUserPermissions, LegalEntity, PremiseForm, RegionForm, SectionForm } from "@/app/lib/definitions";
import { createPremise, updatePremise } from "../../lib/premises-actions";
import BtnSectionsRef from "@/app/admin/sections/lib/btn-sections-ref";
import BtnRegionsRef from "@/app/erp/regions/lib/btn-regions-ref";
import BtnLegalEntitiesRef from "@/app/erp/legal-entities/lib/btn-legal-entities-ref";
import { z } from "zod";
import MessageBoxOKCancel from "@/app/lib/message-box-ok-cancel";
import {
  setIsCancelButtonPressed, setIsDocumentChanged, setIsMessageBoxOpen, setIsOKButtonPressed,
  setIsShowMessageBoxCancel, setMessageBoxText, useDocumentStore, useIsDocumentChanged, useMessageBox
} from "@/app/store/useDocumentStore";
import { TagInput } from "@/app/lib/tags/tag-input";
import { lusitana } from "@/app/ui/fonts";
import { useAccessTagStore, useUserTagStore } from "@/app/lib/tags/tag-store";
import { upsertTags } from "@/app/lib/tags/tags-actions";
import { formatDateForInput } from "@/app/lib/common-utils";

interface IEditFormProps {
  premise: PremiseForm,
  readonly: boolean,
  sections: SectionForm[],
  regions: RegionForm[],
  legalEntities: LegalEntity[],
}
//#region zod schema
const PremiseFormSchemaFull = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, {
    message: "Название должно содержать не менее 2-х символов.",
  }),
  description: z.string().min(2, {
    message: "description должно содержать не менее 2-х символов.",
  }),
  cadastral_number: z.string().min(1, {
    message: "Поле Кадастровый номер должно быть заполнено.",
  }),
  address: z.string().min(1, {
    message: "Поле address должно быть заполнено.",
  }),
  address_alt: z.string().min(1, {
    message: "Поле address_alt должно быть заполнено.",
  }).optional(),
  square: z.number().nonnegative({
    message: "Поле Площадь должно содержать положительное число.",
  }),
  section_name: z.string().min(1, {
    message: "Поле Раздел должно быть заполнено.",
  }),
  owner_name: z.string().min(1, {
    message: "Поле Владелец должно быть заполнено.",
  }),
  operator_name: z.string().min(1, {
    message: "Поле Оператор должно быть заполнено.",
  }),
  region_name: z.string().min(1, {
    message: "Поле Регион должно быть заполнено.",
  }),
  type: z.string().min(1, {
    message: "Поле type должно быть заполнено.",
  }),
  status: z.string().min(1, {
    message: "Поле status должно быть заполнено.",
  }),
  status_until: z.date({
    required_error: "Поле status_until должно быть заполнено.",
    invalid_type_error: "Поле status_until должно быть датой.",
  }),
  region_id: z.string().min(1, {
    message: "Поле region_id должно быть заполнено.",
  }),
  owner_id: z.string().min(1, {
    message: "Поле owner_id должно быть заполнено.",
  }),
  operator_id: z.string().min(1, {
    message: "Поле operator_id должно быть заполнено.",
  }),
  section_id: z.string().min(1, {
    message: "Поле section_id должно быть заполнено.",
  }),
  username: z.string().optional(),
  date_created: z.date().optional(),
  timestamptz: z.string().optional(),
  user_tags: z.array(z.string()).nullable(),
  access_tags: z.array(z.string()).nullable(),
  author_id: z.string(), // z.string().uuid(),
  editor_id: z.string(), // z.string().uuid(),
  tenant_id: z.string(), // z.string().uuid(),
});
const PremiseFormSchema = PremiseFormSchemaFull.omit({ id: true, address_alt: true, timestamptz: true, date_created: true, username: true });
type FormData = z.infer<typeof PremiseFormSchemaFull>;
//#endregion

export default function PremiseEditForm(props: IEditFormProps) {
  const addUserTag = useUserTagStore().addTag;
  const addAccessTag = useAccessTagStore().addTag;
  const docTenantId = useDocumentStore.getState().documentTenantId;
  const sessionUserId = useDocumentStore.getState().sessionUser.id;
  const [showErrors, setShowErrors] = useState(false);
  const [formData, setFormData] = useState<FormData>(props.premise);
  const isDocumentChanged = useIsDocumentChanged();
  const msgBox = useMessageBox();
  const docChanged = () => {
    setIsDocumentChanged(true);
    setMessageBoxText('Документ изменен. Закрыть без сохранения?');
  };
  const showMsgSaved = () => {
    setIsDocumentChanged(false);
    setMessageBoxText('Документ сохранен.');
    setIsShowMessageBoxCancel(false);
    setIsMessageBoxOpen(true);
  }
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      author_id: sessionUserId,
      editor_id: sessionUserId,
    }));
  }, [sessionUserId]);

  const validate = () => {
    const res = PremiseFormSchema.safeParse({
      ...formData,
      square: Number(formData.square),
      // status_until: new Date(formData.status_until),
    });
    if (res.success) {
      return undefined;
    }
    return res.error.format();
  }

  //#region handles
  const handleSubmit = async (e: React.MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = validate();
    if (errors) {
      setShowErrors(true);
      console.log("ошибки есть: " + JSON.stringify(errors));
      console.log(`author_id: ${formData.author_id}, editor_id: ${formData.editor_id}`);
      return;
    }
    if (formData.user_tags) {
      await upsertTags(formData.user_tags, docTenantId);
      useDocumentStore.getState().addAllTags(formData.user_tags);
    }
    if (formData.access_tags) {
      await upsertTags(formData.access_tags, docTenantId);
      useDocumentStore.getState().addAllTags(formData.access_tags);
    }
    if (formData.id === "") {
      await createPremise(formData);
      showMsgSaved();
    } else {
      await updatePremise(formData);
      showMsgSaved();
    }
  }
  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDocumentChanged && !msgBox.isOKButtonPressed) {
      setIsShowMessageBoxCancel(true);
      setIsMessageBoxOpen(true);
    } else if (isDocumentChanged && msgBox.isOKButtonPressed) {
    } else if (!isDocumentChanged) {
      window.history.back();
    }
  };
  const handleSelectSection = (new_section_id: string, new_section_name: string, new_section_tenant_id: string) => {
    setFormData((prev) => ({
      ...prev,
      section_id: new_section_id,
      section_name: new_section_name,
      tenant_id: new_section_tenant_id,
    }));
    useDocumentStore.getState().setDocumentTenantId(new_section_tenant_id);
    docChanged();
  };
  const handleSelectRegion = (new_region_id: string, new_region_name: string) => {
    setFormData((prev) => ({
      ...prev,
      region_id: new_region_id,
      region_name: new_region_name,
    }));
    docChanged();
  };
  const handleSelectOperator = (new_le_id: string, new_le_name: string) => {
    setFormData((prev) => ({
      ...prev,
      operator_id: new_le_id,
      operator_name: new_le_name,
    }));
    docChanged();
  };
  const handleSelectOwner = (new_le_id: string, new_le_name: string) => {
    setFormData((prev) => ({
      ...prev,
      owner_id: new_le_id,
      owner_name: new_le_name,
    }));
    docChanged();
  };
  const handleChangeUserTags = (event: any) => {
    const currentTags = useUserTagStore.getState().selectedTags;
    setFormData((prev) => ({
      ...prev,
      user_tags: currentTags,
    }));
    docChanged();
  };
  const handleChangeAccessTags = (event: any) => {
    const currentTags = useAccessTagStore.getState().selectedTags;
    setFormData((prev) => ({
      ...prev,
      access_tags: currentTags,
    }));
    docChanged();
  };
  //#endregion

  const errors = showErrors ? validate() : undefined;
  //#region render
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col md:flex-row gap-4 w-full">
        {/* first column */}
        <div className="flex flex-col gap-4 w-full md:w-1/2">

          {/* name */}
          <div className="flex-col">
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
                autoComplete="off"
                className="w-7/8 control rounded-md border border-gray-200 p-2"
                disabled={props.readonly}
                value={formData.name}
                onChange={(e) => { setFormData((prev) => ({ ...prev, name: e.target.value, })); docChanged(); }}
              />
            </div>
            <div id="name-error" aria-live="polite" aria-atomic="true">
              {errors?.name &&
                errors.name._errors.map((error: string) => (
                  <p className="mt-2 text-xs text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          {/* type */}
          <div className="flex-col">
            <div className="flex justify-between mt-1">
              <label
                htmlFor="type"
                className="w-3/8 text-sm text-blue-900 font-medium flex items-center p-2"
              >
                Тип помещения:
              </label>
              <input
                id="type"
                type="text"
                name="type"
                autoComplete="off"
                className="w-5/8 control rounded-md border border-gray-200 p-2"
                disabled={props.readonly}
                value={formData.type}
                onChange={(e) => { setFormData((prev) => ({ ...prev, type: e.target.value, })); docChanged(); }}
              />
            </div>
            <div id="type-error" aria-live="polite" aria-atomic="true">
              {errors?.type &&
                errors.type._errors.map((error: string) => (
                  <p className="mt-2 text-xs text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          {/* description */}
          <div className="flex-col">
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
                disabled={props.readonly}
                value={formData.description}
                onChange={(e) => { setFormData((prev) => ({ ...prev, description: e.target.value, })); docChanged(); }}
              />
            </div>
            <div id="description-error" aria-live="polite" aria-atomic="true">
              {errors?.description &&
                errors.description._errors.map((error: string) => (
                  <p className="mt-2 text-xs text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          {/* cadastral_number */}
          <div className="flex-col">
            <div className="flex justify-between mt-1">
              <label
                htmlFor="cadastral_number"
                className="w-3/8 text-sm text-blue-900 font-medium flex items-center p-2">
                Кадастровый номер:
              </label>
              <input
                id="cadastral_number"
                type="text"
                name="cadastral_number"
                className="w-10/16 control rounded-md border border-gray-200 p-2"
                disabled={props.readonly}
                value={formData.cadastral_number}
                onChange={(e) => { setFormData((prev) => ({ ...prev, cadastral_number: e.target.value, })); docChanged(); }}
              />
            </div>
            <div id="cadastral_number-error" aria-live="polite" aria-atomic="true">
              {errors?.cadastral_number &&
                errors.cadastral_number._errors.map((error: string) => (
                  <p className="mt-2 text-xs text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          {/* operator_name */}
          <div className="flex-col">
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
                disabled={props.readonly}
                value={formData.operator_name}
                readOnly
                onChange={(e) => { setFormData((prev) => ({ ...prev, operator_name: e.target.value, })); docChanged(); }}
              />
              {!props.readonly && <BtnLegalEntitiesRef
                legalEntities={props.legalEntities}
                handleSelectLE={handleSelectOperator}
                elementIdPrefix="operator_name_"
              />}
            </div>
            <div id="operator_name-error" aria-live="polite" aria-atomic="true">
              {errors?.operator_name &&
                errors.operator_name._errors.map((error: string) => (
                  <p className="mt-2 text-xs text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          {/* owner_name */}
          <div className="flex-col">
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
                disabled={props.readonly}
                value={formData.owner_name}
                readOnly
                onChange={(e) => { setFormData((prev) => ({ ...prev, owner_name: e.target.value, })); docChanged(); }}
              />
              {!props.readonly && <BtnLegalEntitiesRef
                legalEntities={props.legalEntities}
                handleSelectLE={handleSelectOwner}
                elementIdPrefix="owner_name_"
              />}
            </div>
            <div id="owner_name-error" aria-live="polite" aria-atomic="true">
              {errors?.owner_name &&
                errors.owner_name._errors.map((error: string) => (
                  <p className="mt-2 text-xs text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
        </div>
        {/* second column */}
        <div className="flex flex-col gap-4 w-full md:w-1/2">
          {/* square */}
          <div className="flex-col">
            <div className="flex justify-between mt-1">
              <label
                htmlFor="square"
                className="w-3/8 text-sm text-blue-900 font-medium flex items-center p-2">
                Площадь, кв.м.:
              </label>
              <input
                id="square"
                type="number"
                name="square"
                className="w-10/16 control rounded-md border border-gray-200 p-2"
                disabled={props.readonly}
                value={formData.square.toString()}
                onChange={(e) => { setFormData((prev) => ({ ...prev, square: parseFloat(e.target.value), })); docChanged(); }}
              />
              {/* // Валидация строки перед отправкой в базу данных
            if (/^\d+(\.\d{1,2})?$/.test(decimalAsString)) {
              console.log("Строка валидна и может быть отправлена в базу данных.");
            } else {
              console.error("Неверный формат строки для decimal(10,2).");
            } */}
            </div>
            <div id="square-error" aria-live="polite" aria-atomic="true">
              {errors?.square &&
                errors.square._errors.map((error: string) => (
                  <p className="mt-2 text-xs text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          {/* region_name */}
          <div className="flex-col">
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
                disabled={props.readonly}
                value={formData.region_name}
                onChange={(e) => { setFormData((prev) => ({ ...prev, region_name: e.target.value, })); docChanged(); }}
              />
              {!props.readonly && <BtnRegionsRef
                regions={props.regions}
                handleSelectRegion={handleSelectRegion}
              />}
            </div>
            <div id="region_name-error" aria-live="polite" aria-atomic="true">
              {errors?.region_name &&
                errors.region_name._errors.map((error: string) => (
                  <p className="mt-2 text-xs text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          {/* address */}
          <div className="flex-col">
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
                autoComplete="off"
                className="w-13/16 control rounded-md border border-gray-200 p-2"
                disabled={props.readonly}
                value={formData.address}
                onChange={(e) => { setFormData((prev) => ({ ...prev, address: e.target.value, })); docChanged(); }}
              />
            </div>
            <div id="address-error" aria-live="polite" aria-atomic="true">
              {errors?.address &&
                errors.address._errors.map((error: string) => (
                  <p className="mt-2 text-xs text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          {/* status */}
          <div className="flex-col">
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
                disabled={props.readonly}
                value={formData.status}
                onChange={(e) => { setFormData((prev) => ({ ...prev, status: e.target.value, })); docChanged(); }}
              />
            </div>
            <div id="status-error" aria-live="polite" aria-atomic="true">
              {errors?.status &&
                errors.status._errors.map((error: string) => (
                  <p className="mt-2 text-xs text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          {/* status_until */}
          <div className="flex-col">
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
                disabled={props.readonly}
                value={formatDateForInput(formData.status_until)} // Преобразуем дату в нужный формат
                onChange={(e) => {
                  // console.log('New status_until:', formData.status_until);
                  setFormData((prev) => ({ ...prev, status_until: new Date(e.target.value), }));
                  docChanged();
                }}
              />
            </div>
            <div id="status_until-error" aria-live="polite" aria-atomic="true">
              {errors?.status_until &&
                errors.status_until._errors.map((error: string) => (
                  <p className="mt-2 text-xs text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          {/* section_name */}
          <div className="flex-col">
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
                value={formData.section_name}
                readOnly
                onChange={(e) => { setFormData((prev) => ({ ...prev, section_name: e.target.value, })); docChanged(); }}
              />
              {!props.readonly && <BtnSectionsRef sections={props.sections} handleSelectSection={handleSelectSection} />}
            </div>
            <div id="section_name-error" aria-live="polite" aria-atomic="true">
              {errors?.section_name &&
                errors.section_name._errors.map((error: string) => (
                  <p className="mt-2 text-xs text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
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
          value={formData.user_tags}
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
          value={formData.access_tags}
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
              // className="bg-blue-400 text-white w-full rounded-md border p-2 
              // hover:bg-blue-100 hover:text-gray-500 cursor-pointer"
              className={`w-full rounded-md border p-2 ${props.readonly
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-400 text-white hover:bg-blue-100 hover:text-gray-500 cursor-pointer'
                }`}
              type="submit">
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
    </form>
  );
  //#endregion
}
