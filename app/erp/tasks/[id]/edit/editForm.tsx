
// Task EditForm

'use client';
import { useState } from "react";
import { SectionForm, Task, TaskForm, TaskScheduleForm } from "@/app/lib/definitions";
import { createTask, updateTask } from "../../lib/task-actions";
import Link from "next/link";
import { formatDateForInput } from "@/app/lib/utils";
import BtnSectionsRef from "@/app/admin/sections/lib/btnSectionsRef";
import { z } from "zod";
import { pdf, PDFViewer } from '@react-pdf/renderer';
import PdfDocument from "./pdfDocument";
import InputField from "./inputField";
import BtnTaskScheduleRef from "@/app/erp/task-schedules/lib/BtnTaskScheduleRef";

interface IEditFormProps {
  task: TaskForm,
  taskSchedules: TaskScheduleForm[],
}

const TaskFormSchemaFull = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, {
    message: "Название должно содержать не менее 2-х символов.",
  }),
  task_schedule_id: z.string().nullable(),
  // task_schedule_id: z.string().uuid(),
  date_start: z.date({
    required_error: "Поле date_start должно быть заполнено.",
    invalid_type_error: "Поле date_start должно быть датой.",
  }),
  date_end: z.date({
    invalid_type_error: "Поле date_end должно быть датой.",
  }),
  is_periodic: z.boolean(),
  period_days: z.number().nullable(),
  username: z.string().optional(),
  timestamptz: z.string().optional(),
});
const TaskFormSchema = TaskFormSchemaFull.omit({ id: true, timestamptz: true, username: true });
export type FormData = z.infer<typeof TaskFormSchemaFull>;


export default function TaskEditForm(props: IEditFormProps) {

  const [showErrors, setShowErrors] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(props.task as FormData);

  const validate = () => {
    const res = TaskFormSchema.safeParse({
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
    // if (formData.task_schedule_id === null) {
    //   formData.task_schedule_id = "";
    // }
    if (formData.is_periodic === null) {
      formData.is_periodic = false;
    }
    const errors = validate();
    if (errors) {
      setShowErrors(true);
      console.log("ошибки есть: " + JSON.stringify(errors));
      return;
    }
    if (formData.id === "") {
      await createTask(formData);
    } else {
      await updateTask(formData);
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

  const handleSelectTaskSchedule = (new_ts_id: string, new_ts_name: string) => {
    setFormData((prev) => ({
      ...prev,
      task_schedule_id: new_ts_id,
      // task_schedule_name: new_ts_name,
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
        <form id="task-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full">

            {/* first column */}
            <div className="flex flex-col gap-4 w-full md:w-1/2">

              {/* name */}
              <InputField name="name" value={formData.name}
                label="Название:" type="text" w={["w-4/16", "w-13/16"]}
                onChange={(value) => handleInputChange('name', value)}
                errors={errors?.name as string[] | undefined}
              />
              {/* taskSchedule_id */}
              <InputField name="task_schedule_id" value={formData.task_schedule_id as string}
                label="принадлежит плану обслуживания:" type="text" w={["w-6/16", "w-11/16"]}
                onChange={(value) => handleInputChange('task_schedule_id', value)}
                refBook={<BtnTaskScheduleRef taskSchedules={props.taskSchedules} handleSelectTaskSchedule={handleSelectTaskSchedule} />}
                errors={errors?.task_schedule_id as string[] | undefined}
              />
            </div>

            {/* second column */}
            <div className="flex flex-col gap-4 w-full md:w-1/2">

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

