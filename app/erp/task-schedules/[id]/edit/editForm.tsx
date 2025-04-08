
// TaskSchedules EditForm

'use client';
import { useState } from "react";
import { LegalEntity, TaskScheduleForm, RegionForm, SectionForm, PremiseForm } from "@/app/lib/definitions";
import { createTaskSchedule, updateTaskSchedule } from "../../lib/taskSchedulesActions";
import Link from "next/link";
import BtnSectionsRef from "@/app/admin/sections/lib/btnSectionsRef";
import BtnRegionsRef from "@/app/erp/regions/lib/btnRegionsRef";
import BtnLegalEntitiesRef from "@/app/erp/legal-entities/lib/btnLegalEntitiesRef";
import { z } from "zod";
import BtnPremisesRef from "@/app/erp/premises/lib/btnPremisesRef";

interface IEditFormProps {
  taskSchedule: TaskScheduleForm,
  sections: SectionForm[],
  premises: PremiseForm[],
  legalEntities: LegalEntity[],
}


const TaskScheduleFormSchemaFull = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, {
    message: "Название должно содержать не менее 2-х символов.",
  }),
  description: z.string(),
  premise_id: z.string().uuid(),
  premise_name: z.string().min(2, {
    message: "Поле premise_name должно быть заполнено.",
  }),
  schedule_owner_id: z.string().uuid(),
  schedule_owner_name: z.string().min(2, {
    message: "Поле schedule_owner_name должно быть заполнено.",
  }),
  date: z.date({
    required_error: "Поле date должно быть заполнено.",
    invalid_type_error: "Поле date должно быть датой.",
  }),
  date_start: z.date({
    required_error: "Поле date_start должно быть заполнено.",
    invalid_type_error: "Поле date_start должно быть датой.",
  }),
  date_end: z.date({
    invalid_type_error: "Поле date_end должно быть датой.",
  }),
  section_id: z.string().uuid(),
  section_name: z.string().min(2, {
    message: "Поле Раздел должно быть заполнено.",
  }),
  username: z.string().optional(),
  date_created: z.date().optional(),
  timestamptz: z.string().optional(),
});
const TaskScheduleFormSchema = TaskScheduleFormSchemaFull.omit({ id: true, timestamptz: true, date_created: true, username: true });
type FormData = z.infer<typeof TaskScheduleFormSchemaFull>;


export default function TaskScheduleEditForm(props: IEditFormProps) {

  const [showErrors, setShowErrors] = useState(false);

  const [formData, setFormData] = useState<FormData>(props.taskSchedule);

  const validate = () => {
    const res = TaskScheduleFormSchema.safeParse({
      ...formData,
      // square: Number(formData.square),
    });
    if (res.success) {
      return undefined;
    }
    return res.error.format();
  }
  const handleSubmit = async (e: React.MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = validate();
    if (errors) {
      setShowErrors(true);
      console.log("ошибки есть: " + JSON.stringify(errors));
      return;
    }
    if (formData.id === "") {
      await createTaskSchedule(formData);
    } else {
      await updateTaskSchedule(formData);
      handleRedirectBack();
    }

  }
  const handleSelectSection = (new_section_id: string, new_section_name: string) => {
    setFormData((prev) => ({
      ...prev,
      section_id: new_section_id,
      section_name: new_section_name,
    }));
  };
  
  const handleSelectPremise = (new_premise_id: string, new_premise_name: string) => {
    setFormData((prev) => ({
      ...prev,
      premise_id: new_premise_id,
      premise_name: new_premise_name,
    }));
  };
  const handleSelectOwner = (new_le_id: string, new_le_name: string) => {
    setFormData((prev) => ({
      ...prev,
      schedule_owner_id: new_le_id,
      schedule_owner_name: new_le_name,
    }));
  };
  const handleRedirectBack = () => {
    window.history.back(); // Возвращает пользователя на предыдущую страницу
  };
  // Функция для преобразования даты в формат yyyy-MM-dd
  const formatDateForInput = (date: Date | string): string => {
    if (!date) return ''; // Если дата пустая, возвращаем пустую строку
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const errors = showErrors ? validate() : undefined;
  // const errors = validate();
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
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value, }))}
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
          {/* schedule_owner_name */}
          <div className="flex-col">
            <div className="flex justify-between mt-1">
              <label
                htmlFor="schedule_owner_name"
                className="w-2/8 text-sm text-blue-900 font-medium flex items-center p-2">
                Владелец плана:
              </label>
              <input
                id="schedule_owner_name"
                type="text"
                name="schedule_owner_name"
                className="w-13/16 pointer-events-none control rounded-md border border-gray-200 p-2"
                value={formData.schedule_owner_name}
                readOnly
                onChange={(e) => setFormData((prev) => ({ ...prev, schedule_owner_name: e.target.value, }))}
              />
              <BtnLegalEntitiesRef
                legalEntities={props.legalEntities}
                handleSelectLE={handleSelectOwner}
                elementIdPrefix="schedule_owner_name_"
              />
            </div>
            <div id="schedule_owner_name-error" aria-live="polite" aria-atomic="true">
              {errors?.schedule_owner_name &&
                errors.schedule_owner_name._errors.map((error: string) => (
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
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value, }))}
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
          {/* date */}
          <div className="flex-col">
            <div className="flex justify-between mt-1">
              <label
                htmlFor="date"
                className="w-3/8 text-sm text-blue-900 font-medium flex items-center p-2">
                Дата принятия плана:
              </label>
              <input
                id="date"
                type="date"
                name="date"
                className="w-10/16 control rounded-md border border-gray-200 p-2"
                value={formatDateForInput(formData.date)} // Преобразуем дату в нужный формат
                onChange={(e) => {
                  // console.log('New date:', formData.date);
                  setFormData((prev) => ({ ...prev, date: new Date(e.target.value), }));
                }}
              />
            </div>
            <div id="date-error" aria-live="polite" aria-atomic="true">
              {errors?.date &&
                errors.date._errors.map((error: string) => (
                  <p className="mt-2 text-xs text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          {/* date_start */}
          <div className="flex-col">
            <div className="flex justify-between mt-1">
              <label
                htmlFor="date_start"
                className="w-3/8 text-sm text-blue-900 font-medium flex items-center p-2">
                Дата начала действия:
              </label>
              <input
                id="date_start"
                type="date"
                name="date_start"
                className="w-10/16 control rounded-md border border-gray-200 p-2"
                value={formatDateForInput(formData.date_start)} // Преобразуем дату в нужный формат
                onChange={(e) => {
                  // console.log('New date_start:', formData.date_start);
                  setFormData((prev) => ({ ...prev, date_start: new Date(e.target.value), }));
                }}
              />
            </div>
            <div id="date_start-error" aria-live="polite" aria-atomic="true">
              {errors?.date_start &&
                errors.date_start._errors.map((error: string) => (
                  <p className="mt-2 text-xs text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          {/* date_end */}
          <div className="flex-col">
            <div className="flex justify-between mt-1">
              <label
                htmlFor="date_end"
                className="w-3/8 text-sm text-blue-900 font-medium flex items-center p-2">
                Дата окончания действия:
              </label>
              <input
                id="date_end"
                type="date"
                name="date_end"
                className="w-10/16 control rounded-md border border-gray-200 p-2"
                value={formatDateForInput(formData.date_end)} // Преобразуем дату в нужный формат
                onChange={(e) => {
                  // console.log('New date_end:', formData.date_end);
                  setFormData((prev) => ({ ...prev, date_end: new Date(e.target.value), }));
                }}
              />
            </div>
            <div id="date_end-error" aria-live="polite" aria-atomic="true">
              {errors?.date_end &&
                errors.date_end._errors.map((error: string) => (
                  <p className="mt-2 text-xs text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
        </div>
        {/* second column */}
        <div className="flex flex-col gap-4 w-full md:w-1/2">

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
                value={formData.section_name}
                readOnly
                onChange={(e) => setFormData((prev) => ({ ...prev, section_name: e.target.value, }))}
              />
              <BtnSectionsRef sections={props.sections} handleSelectSection={handleSelectSection} />
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
          {/* premise_name */}
          <div className="flex-col">
            <div className="flex justify-between mt-1">
              <label
                htmlFor="premise_name"
                className="w-2/8 text-sm text-blue-900 font-medium flex items-center p-2">
                Помещение:
              </label>
              <input
                id="premise_name"
                type="text"
                name="premise_name"
                className="w-13/16 pointer-events-none control rounded-md border border-gray-200 p-2"
                value={formData.premise_name}
                readOnly
                onChange={(e) => setFormData((prev) => ({ ...prev, premise_name: e.target.value, }))}
              />
              <BtnPremisesRef premises={props.premises} handleSelectPremise={handleSelectPremise} />
            </div>
            <div id="premise_name-error" aria-live="polite" aria-atomic="true">
              {errors?.premise_name &&
                errors.premise_name._errors.map((error: string) => (
                  <p className="mt-2 text-xs text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
        </div>
      </div>
      {/* button area */}
      <div className="flex justify-between mt-4 mr-4">
        <div className="flex w-full md:w-1/2">
          <div className="w-full md:w-1/2">
            <button
              className="bg-blue-400 text-white w-full rounded-md border p-2 
              hover:bg-blue-100 hover:text-gray-500 cursor-pointer"
              type="submit">
              Сохранить
            </button>
          </div>
          <div className="w-full md:w-1/2">
            <Link href={"#"} >
              <button
                onClick={() => handleRedirectBack()}
                className="bg-blue-400 text-white w-full rounded-md border p-2
                 hover:bg-blue-100 hover:text-gray-500 cursor-pointer"
              >
                Отмена
              </button>
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
