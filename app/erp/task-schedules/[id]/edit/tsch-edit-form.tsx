
// TaskSchedules EditForm

'use client';
import { useEffect, useState } from "react";
import { LegalEntity, TaskScheduleForm, RegionForm, SectionForm, PremiseForm, TaskForm, LegalEntityForm } from "@/app/lib/definitions";
import { createTaskSchedule, updateTaskSchedule } from "../../lib/tsch-actions";
import { formatDateForInput } from "@/app/lib/common-utils";
import BtnSectionsRef from "@/app/admin/sections/lib/btn-sections-ref";
import BtnLegalEntitiesRef from "@/app/erp/legal-entities/lib/btn-legal-entities-ref";
import { z } from "zod";
import BtnPremisesRef from "@/app/erp/premises/lib/btn-premises-ref";
import { pdf, PDFViewer } from '@react-pdf/renderer';
import PdfDocument from "./tsch-pdf-document";
import InputField from "../../../../lib/input-field";
import { TrashIcon } from "@heroicons/react/24/outline";
import MessageBoxOKCancel from "@/app/lib/message-box-ok-cancel";
import {
  setIsCancelButtonPressed, setIsDocumentChanged, setIsMessageBoxOpen, setIsOKButtonPressed,
  setIsShowMessageBoxCancel, setMessageBoxText, useIsDocumentChanged, useMessageBox
} from "@/app/store/useDocumentStore";
import { useRouter } from "next/navigation";
interface IEditFormProps {
  taskSchedule: TaskScheduleForm,
  // sections: SectionForm[],
  premises: PremiseForm[],
  legalEntities: LegalEntityForm[],
  tasks: TaskForm[],
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
  //#region msgBox
  //================================================================
  const isDocumentChanged = useIsDocumentChanged();
  const msgBox = useMessageBox();
  const router = useRouter();

  const docChanged = () => {
    setIsDocumentChanged(true);
    setMessageBoxText('Документ изменен. Закрыть без сохранения?');
  };

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
  const showMsgSaved = () => {
    setIsDocumentChanged(false);
    setMessageBoxText('Документ сохранен.');
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
      window.history.back();
    }
    setIsOKButtonPressed(false);
    setIsCancelButtonPressed(false);
    setIsDocumentChanged(false);
    setIsMessageBoxOpen(false);
    setIsShowMessageBoxCancel(true);
  }, [msgBox.isOKButtonPressed, router]);
  //================================================================
  //#endregion

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
      showMsgSaved();
    } else {
      await updateTaskSchedule(formData);
      showMsgSaved();
      // handleRedirectBack();
    }

  }
  const handleSelectSection = (new_section_id: string, new_section_name: string) => {
    setFormData((prev) => ({
      ...prev,
      section_id: new_section_id,
      section_name: new_section_name,
    }));
    docChanged();
  };
  const handleSelectPremise = (new_premise_id: string, new_premise_name: string) => {
    setFormData((prev) => ({
      ...prev,
      premise_id: new_premise_id,
      premise_name: new_premise_name,
    }));
    docChanged();
  };
  const handleSelectOwner = (new_le_id: string, new_le_name: string) => {
    setFormData((prev) => ({
      ...prev,
      schedule_owner_id: new_le_id,
      schedule_owner_name: new_le_name,
    }));
    docChanged();
  };
  const handleDeleteTask = (id: string) => {
    alert("Удаление задачи: " + id);
    docChanged();
  }
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
    docChanged();
  };
  //#endregion

  const errors = showErrors ? validate() : undefined;

  // const tasks = [
  //   {
  //     id: "222ed6f8-1eb0-4759-9e62-633d0e1dfa88",
  //     name: "Задача 1",
  //     is_periodic: true,
  //     task_schedule_id: "adc189c1-d34a-4175-983a-217b61196a4c",
  //     date_start: new Date(),
  //     date_end: new Date(),
  //     username: "admin",
  //     date_created: new Date(),
  //     timestamptz: new Date().toISOString(),
  //   },
  //   {
  //     id: "c7f45051-4cae-4791-bc15-e4101b6e7113",
  //     name: "Задача 2",
  //     is_periodic: false,
  //     task_schedule_id: "adc189c1-d34a-4175-983a-217b61196a4c",
  //     date_start: new Date(),
  //     date_end: new Date(),
  //     username: "admin",
  //     date_created: new Date(),
  //     timestamptz: new Date().toISOString(),
  //   },
  // ];
  const tasks = props.tasks
  const readonly = false;
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
                readonly={readonly}
                errors={errors?.name as string[] | undefined}
              />
              {/* schedule_owner_name */}
              <InputField name="schedule_owner_name" value={formData.schedule_owner_name}
                label="Владелец плана:" type="text" w={["w-6/16", "w-11/16"]}
                onChange={(value) => handleInputChange('schedule_owner_name', value)}
                refBook={<BtnLegalEntitiesRef legalEntities={props.legalEntities} handleSelectLegalEntity={handleSelectOwner} elementIdPrefix="schedule_owner_name_" />}
                readonly={readonly}
                errors={errors?.schedule_owner_name as string[] | undefined}
              />
              {/* premise_name */}
              <InputField name="premise_name" value={formData.premise_name}
                label="Помещение:" type="text" w={["w-6/16", "w-11/16"]}
                onChange={(value) => handleInputChange('premise_name', value)}
                refBook={<BtnPremisesRef premises={props.premises} handleSelectPremise={handleSelectPremise} />}
                readonly={readonly}
                errors={errors?.premise_name as string[] | undefined}
              />
              {/* description */}
              <InputField name="description" value={formData.description}
                label="Описание:" type="text" w={["w-4/16", "w-13/16"]}
                onChange={(value) => handleInputChange('description', value)}
                readonly={readonly}
                errors={errors?.description as string[] | undefined}
              />
            </div>

            {/* second column */}
            <div className="flex flex-col gap-4 w-full md:w-1/2">

              {/* date */}
              <InputField name="date" value={formatDateForInput(formData.date)}
                label="Дата принятия плана:" type="date" w={["w-8/16", "w-10/16"]}
                onChange={(value) => handleInputChange('date', value)}
                readonly={readonly}
                errors={errors?.date as string[] | undefined}
              />
              {/* date_start */}
              <InputField name="date_start" value={formatDateForInput(formData.date_start)}
                label="Дата начала действия:" type="date" w={["w-8/16", "w-10/16"]}
                onChange={(value) => handleInputChange('date_start', value)}
                readonly={readonly}
                errors={errors?.date_start as string[] | undefined}
              />
              {/* date_end */}
              <InputField name="date_end" value={formatDateForInput(formData.date_end)}
                label="Дата окончания действия:" type="date" w={["w-8/16", "w-10/16"]}
                onChange={(value) => handleInputChange('date_end', value)}
                readonly={readonly}
                errors={errors?.date_end as string[] | undefined}
              />
              {/* section_name */}
              <InputField name="section_name" value={formData.section_name}
                label="Раздел:" type="text" w={["w-4/16", "w-13/16"]}
                onChange={(value) => handleInputChange('section_name', value)}
                refBook={<BtnSectionsRef handleSelectSection={handleSelectSection} />}
                readonly={readonly}
                errors={errors?.section_name as string[] | undefined}
              />

            </div>
          </div>
          {/* table part */}
          <div id="table_part" className="mt-2">
            <div className="flex flex-row gap-4 w-full md:w-1/2">
              <h2 className="px-2 pt-1 font-medium">Задачи:</h2>
            </div>
            {/* заголовки таблицы не прокручиваются */}
            <div className="max-h-[50vh] overflow-y-auto rounded-md border border-gray-200 bg-white">
              <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="w-7/16 overflow-hidden px-0 py-5 font-medium sm:pl-6 text-gray-400">
                      Название
                    </th>
                    <th scope="col" className="w-3/8 px-3 py-5 font-medium text-gray-400">
                      Дата начала
                    </th>
                    <th scope="col" className="w-3/16 px-3 py-5 font-medium">
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            {/* таблица прокручивается */}
            <div className="max-h-[50vh] overflow-y-auto rounded-md border border-gray-200 bg-white">
              <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {tasks.map((task) => (
                    <tr key={task.id} className="group">
                      <td className="w-7/16 overflow-hidden whitespace-nowrap text-ellipsis bg-white py-1 pl-0 text-left  
                      pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-left gap-3">
                          <a
                            href={"/erp/tasks/" + task.id + "/edit"}
                            className="text-blue-800 underline"
                          >{task.name.substring(0, 36)}</a>
                        </div>
                      </td>
                      <td className="w-3/8 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                        {task.is_periodic ? "Повторяющаяся" : "Однократная"}
                      </td>
                      <td className="w-3/16 whitespace-nowrap pl-4 py-1 pr-3">
                        <div className="flex justify-end gap-3">
                          <button className="rounded-md border border-gray-200 p-2 h-10 hover:bg-gray-100 
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={() => handleDeleteTask(task.id)}>
                            <span className="sr-only">Delete</span>
                            <TrashIcon className="w-5 h-5 text-gray-800" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                <button
                  onClick={handleBackClick}
                  className="bg-blue-400 text-white w-full rounded-md border p-2
                 hover:bg-blue-100 hover:text-gray-500 cursor-pointer"
                >
                  Закрыть
                </button>
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
      <MessageBoxOKCancel />
    </div>
  );
}

