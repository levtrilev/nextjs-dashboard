
// TaskSchedules EditForm

'use client';
import { useState } from "react";
import { LegalEntity, TaskScheduleForm, RegionForm, SectionForm, PremiseForm } from "@/app/lib/definitions";
import { createTaskSchedule, updateTaskSchedule } from "../../lib/taskSchedulesActions";
import Link from "next/link";
import { formatDateForInput } from "@/app/lib/utils";
import BtnSectionsRef from "@/app/admin/sections/lib/btnSectionsRef";
import BtnLegalEntitiesRef from "@/app/erp/legal-entities/lib/btnLegalEntitiesRef";
import { z } from "zod";
import BtnPremisesRef from "@/app/erp/premises/lib/btnPremisesRef";
import { pdf, PDFViewer } from '@react-pdf/renderer';
import PdfDocument from "./pdfDocument";
import InputField from "./inputField";
// import TextLabelInput from "./textLabelInput";

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
export type FormData = z.infer<typeof TaskScheduleFormSchemaFull>;


export default function TaskScheduleEditForm(props: IEditFormProps) {

  const [showErrors, setShowErrors] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
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
  //#region handles
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
  const handleShowPDF = async () => {
    try {
      // Создаем PDF из компонента PdfDocument
      const blob = await pdf(<PdfDocument formData={formData} />).toBlob();

      // Создаем URL для Blob-объекта
      const url = URL.createObjectURL(blob);

      setPdfUrl(url);

    } catch (error) {
      console.error('Ошибка при экспорте PDF:', error);

    }
  };
  const handleClosePDF = () => {
    if (pdfUrl) {
      // Освобождаем ресурсы Blob-URL
      URL.revokeObjectURL(pdfUrl);
      // Убираем iframe
      setPdfUrl(null);
    }
  };
  const handleInputChange = (field: string, value: string | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  //#endregion

  const errors = showErrors ? validate() : undefined;

  return (
    <div>
      {!pdfUrl && (
        <form id="task-schedule-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full">

            {/* first column */}
            <div className="flex flex-col gap-4 w-full md:w-1/2">

              {/* name */}
              <InputField name="name" value={formData.name}
                label="Название:" type="text" w={["w-4/16", "w-13/16"]}
                onChange={(value) => handleInputChange('name', value)}
                errors={errors?.name as string[] | undefined}
              />
              {/* schedule_owner_name */}
              <InputField name="schedule_owner_name" value={formData.schedule_owner_name}
                label="Владелец плана:" type="text" w={["w-6/16", "w-11/16"]}
                onChange={(value) => handleInputChange('schedule_owner_name', value)}
                refBook={<BtnLegalEntitiesRef legalEntities={props.legalEntities} handleSelectLE={handleSelectOwner} elementIdPrefix="schedule_owner_name_" />}
                errors={errors?.schedule_owner_name as string[] | undefined}
              />
              {/* premise_name */}
              <InputField name="premise_name" value={formData.premise_name}
                label="Помещение:" type="text" w={["w-6/16", "w-11/16"]}
                onChange={(value) => handleInputChange('premise_name', value)}
                refBook={<BtnPremisesRef premises={props.premises} handleSelectPremise={handleSelectPremise} />}
                errors={errors?.premise_name as string[] | undefined}
              />
              {/* description */}
              <InputField name="description" value={formData.description}
                label="Описание:" type="text" w={["w-4/16", "w-13/16"]}
                onChange={(value) => handleInputChange('description', value)}
                errors={errors?.description as string[] | undefined}
              />
            </div>

            {/* second column */}
            <div className="flex flex-col gap-4 w-full md:w-1/2">

              {/* date */}
              <InputField name="date" value={formatDateForInput(formData.date)}
                label="Дата принятия плана:" type="date" w={["w-8/16", "w-10/16"]}
                onChange={(value) => handleInputChange('date', value)}
                errors={errors?.date as string[] | undefined}
              />
              {/* date_start */}
              <InputField name="date_start" value={formatDateForInput(formData.date_start)}
                label="Дата начала действия:" type="date" w={["w-8/16", "w-10/16"]}
                onChange={(value) => handleInputChange('date_start', value)}
                errors={errors?.date_start as string[] | undefined}
              />
              {/* date_end */}
              <InputField name="date_end" value={formatDateForInput(formData.date_end)}
                label="Дата окончания действия:" type="date" w={["w-8/16", "w-10/16"]}
                onChange={(value) => handleInputChange('date_end', value)}
                errors={errors?.date_end as string[] | undefined}
              />
              {/* section_name */}
              <InputField name="section_name" value={formData.section_name}
                label="Раздел:" type="text" w={["w-4/16", "w-13/16"]}
                onChange={(value) => handleInputChange('section_name', value)}
                refBook={<BtnSectionsRef sections={props.sections} handleSelectSection={handleSelectSection} />}
                errors={errors?.section_name as string[] | undefined}
              />

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
              <div className="w-full md:w-1/2">
                <button
                  type="button"
                  onClick={handleShowPDF}
                  className="bg-green-400 text-white w-full rounded-md border p-2 hover:bg-green-100 hover:text-gray-500 cursor-pointer"
                >
                  Открыть PDF
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
      {/* Кнопка закрытия PDF*/}
      {
        pdfUrl &&
        <button
          onClick={handleClosePDF}
          style={{
            position: 'absolute',
            top: '50px',
            right: '50px',
            padding: '5px 10px',
            background: 'red',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Закрыть PDF
        </button>
      }
      {/* Отображение PDF в iframe */}
      {pdfUrl && (
        <iframe
          src={pdfUrl}
          style={{
            width: '100%',
            height: '1200px',
            border: '2px solid red', // Временная граница для отладки
            marginTop: '20px',
          }}
          title="PDF Preview"
        />
      )}
    </div>
  );
}

