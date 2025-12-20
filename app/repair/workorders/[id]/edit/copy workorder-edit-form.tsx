// Workorder EditForm

'use client';
import { useEffect, useState } from "react";
import { ClaimForm, OperationForm, PersonForm, WoOperationForm, WoPartForm, WorkForm, WorkorderForm } from "@/app/lib/definitions";
import { formatDateForInput } from "@/app/lib/common-utils";
import BtnSectionsRef from "@/app/admin/sections/lib/btn-sections-ref";
import { z } from "zod";
import { pdf, PDFViewer } from '@react-pdf/renderer';
import MessageBoxOKCancel from "@/app/lib/message-box-ok-cancel";
import {
  setIsCancelButtonPressed, setIsDocumentChanged, setIsMessageBoxOpen, setIsOKButtonPressed,
  setIsShowMessageBoxCancel, setMessageBoxText, useDocumentStore, useIsDocumentChanged, useMessageBox
} from "@/app/store/useDocumentStore";
import InputField from "@/app/lib/input-field";
import { useRouter } from "next/navigation";
// import { createWorkorder, updateWorkorder } from "../../../lib/workorders-actions";
import PdfDocument from "./workorder-pdf-document";
import { createWorkorder, updateWorkorder } from "../../lib/workorders-actions";
import BtnClaimsRef from "@/app/repair/claims/lib/btn-claims-ref";
import BtnPersonsRef from "@/app/repair/persons/lib/btn-persons-ref";
import { TrashIcon } from "@heroicons/react/24/outline";

interface IEditFormProps {
  workorder: WorkorderForm;
  lockedByUserId: string | null;
  unlockAction: ((tableName: string, id: string, userId: string) => Promise<void>) | null;
  readonly: boolean;
  claims: ClaimForm[];
  persons: PersonForm[];
  // operations: OperationForm[];
  wo_operations: WoOperationForm[];
  wo_parts: WoPartForm[];
}
const DocStatusSchema = z.enum(['draft', 'active', 'deleted']);

const WorkorderFormSchemaFull = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, {
    message: "Название должно содержать не менее 2-х символов.",
  }),
  claim_name: z.string().min(1, {
    message: "Поле Заявка должно быть заполнено.",
  }),
  doc_number: z.string().min(1, {
    message: "Поле Номер должно быть заполнено.",
  }),
  doc_date: z.date({
    required_error: "Поле Дата должно быть заполнено.",
    invalid_type_error: "Поле Дата должно быть датой.",
  }),
  doc_status: DocStatusSchema,
  performer_id: z.string().uuid(),
  performer_name: z.string().min(1, {
    message: "Поле Исполнитель должно быть заполнено.",
  }),
  claim_id: z.string().min(1, {
    message: "Поле claim_id должно быть заполнено.",
  }),
  claim_machine_id: z.string().min(1, {
    message: "Поле machine_id должно быть заполнено.",
  }),
  claim_machine_name: z.string().min(1, {
    message: "Поле Машина должно быть заполнено.",
  }),
  section_name: z.string().min(1, {
    message: "Поле Раздел должно быть заполнено.",
  }),
  section_id: z.string().min(1, {
    message: "Поле section_id должно быть заполнено.",
  }),
  username: z.string().optional(),
  timestamptz: z.string().optional(),
  author_id: z.string(),
  editor_id: z.string(),
  tenant_id: z.string(),
  editing_by_user_id: z.string().nullable(),
  editing_since: z.string().nullable(),
});

const WorkorderFormSchema = WorkorderFormSchemaFull.omit({
  id: true,
  timestamptz: true,
  username: true,
  editing_by_user_id: true,
  editing_since: true,
  claim_machine_id: true,
  claim_machine_name: true,
  performer_id: true,
  // performer_name: true,
});
export type FormData = z.infer<typeof WorkorderFormSchemaFull>;

export default function WorkorderEditForm(props: IEditFormProps) {
  const docTenantId = useDocumentStore.getState().documentTenantId;
  const sessionUserId = useDocumentStore.getState().sessionUser.id;
  const [showErrors, setShowErrors] = useState(false);
  const isDocumentChanged = useIsDocumentChanged();
  const msgBox = useMessageBox();
  const router = useRouter();
  const docChanged = () => {
    setIsDocumentChanged(true);
    setMessageBoxText('Документ изменен. Закрыть без сохранения?');
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      author_id: sessionUserId,
      editor_id: sessionUserId,
    }));
  }, [sessionUserId]);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(props.workorder);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      author_id: sessionUserId,
      tenant_id: docTenantId,
    }));
  }, []);

  const validate = () => {
    const res = WorkorderFormSchema.safeParse({
      ...formData,
    });
    if (res.success) {
      return undefined;
    }
    return res.error.format();
  };
  const handleAddWorkOpertions = (
    new_operations:
      {
        new_operation_id: string;
        new_operation_name: string;
        new_work_id: string;
        new_work_name: string;
      }[]
  ) => {
    // setRoleSections(role_sections.concat({
    //   id: new_section_id,
    //   name: new_section_name,
    //   tenant_id: new_section_tenant_id,
    //   tenant_name: new_section_tenant_name
    // }));
    // prepareRoleSectionIds(role_sections.concat({
    //   id: new_section_id,
    //   name: new_section_name,
    //   tenant_id: new_section_tenant_id,
    //   tenant_name: new_section_tenant_name
    // }));

    docChanged();
  };
  const handleDeleteOperation = (operation_id: string) => {

  }

  const handleDeletePart = (part_id: string) => {
    
  }
  const handleSubmit = async (e: React.MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    // console.log("formData: " + JSON.stringify(formData));
    const errors = validate();
    if (errors) {
      console.log("Ошибки есть! :" + JSON.stringify(errors));
      setShowErrors(true);
      return;
    }

    try {
      if (formData.id === "") {
        await createWorkorder(formData);
        setTimeout(() => {
          router.push('/repair/workorders');
        }, 2000);
      } else {
        await updateWorkorder(formData);
      }
      setIsDocumentChanged(false);
      setMessageBoxText('Документ сохранен.');
    } catch (error) {
      setMessageBoxText('Документ не сохранен! :' + String(error));
    }

    setIsShowMessageBoxCancel(false);
    setIsMessageBoxOpen(true);
  };

  const handleBackClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (props.unlockAction) await props.unlockAction("workorders", props.workorder.id, sessionUserId);
    if (isDocumentChanged && !msgBox.isOKButtonPressed) {
      setIsShowMessageBoxCancel(true);
      setIsMessageBoxOpen(true);
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

  const handleSelectClaim = (new_claim_id: string, new_claim_name: string, new_claim_machine_id: string, new_claim_machine_name: string) => {
    // const handleSelectClaim = (new_claim_id: string, new_claim_name: string) => {
    setFormData((prev) => ({
      ...prev,
      claim_id: new_claim_id,
      claim_name: new_claim_name,
      claim_machine_id: new_claim_machine_id,
      claim_machine_name: new_claim_machine_name,
    }));
    docChanged();
  };
  const handleSelectPerson = (new_performer_id: string, new_performer_name: string) => {
    setFormData((prev) => ({
      ...prev,
      performer_id: new_performer_id,
      performer_name: new_performer_name,
    }));
    docChanged();
  }
  const handleShowPDF = async () => {
    try {
      const blob = await pdf(<PdfDocument formData={formData} />).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Ошибка при экспорте PDF:', error);
    }
  };

  const handleClosePDF = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const handleInputChange = (field: string, value: string | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    docChanged();
  };

  const errors = showErrors ? validate() : undefined;

  return (
    <div>
      {!pdfUrl && (
        <form id="workorder-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full">

            {/* первая колонка */}
            <div className="flex flex-col gap-4 w-full md:w-1/2">

              {/* doc_number */}
              <InputField
                name="doc_number"
                value={formData.doc_number}
                label="Номер:"
                type="text"
                w={["w-4/16", "w-13/16"]}
                onChange={(value) => handleInputChange('doc_number', value)}
                readonly={props.readonly}
                errors={errors?.doc_number?._errors as string[] | undefined}
              />

              {/* doc_date */}
              <InputField name="doc_date" value={formatDateForInput(formData.doc_date)}
                label="Дата:" type="date" w={["w-8/16", "w-10/16"]}
                onChange={(value) => handleInputChange('doc_date', value)}
                readonly={props.readonly}
                errors={errors?.doc_date?._errors as string[] | undefined}
              />


              {/* claim_name */}
              <InputField
                name="claim_name"
                value={formData.claim_name as string}
                label="Заявка:"
                type="text"
                w={["w-6/16", "w-11/16"]}
                onChange={(value) => { }}
                refBook={<BtnClaimsRef handleSelectClaim={handleSelectClaim} claims={props.claims} />}
                readonly={props.readonly}
                errors={errors?.claim_name?._errors as string[] | undefined}
              />

              {/* machine_name */}
              <InputField
                name="machine_name"
                value={formData.claim_machine_name as string}
                label="Машина:"
                type="text"
                w={["w-6/16", "w-11/16"]}
                onChange={(value) => { }}
                // refBook={<BtnMachinesRef handleSelectMachine={handleSelectClaim} machines={props.machines} />}
                readonly={true}
              // errors={errors?.claim_machine_name?._errors as string[] | undefined}
              />

            </div>

            {/* вторая колонка */}
            <div className="flex flex-col gap-4 w-full md:w-1/2">

              {/* name */}
              <InputField
                name="name"
                value={formData.name}
                label="Название:"
                type="text"
                w={["w-4/16", "w-13/16"]}
                onChange={(value) => handleInputChange('name', value)}
                readonly={props.readonly}
                errors={errors?.name?._errors as string[] | undefined}
              />

              {/* performer_name */}
              <InputField
                name="performer_name"
                value={formData.performer_name as string}
                label="ФИО исполнителя:"
                type="text"
                w={["w-6/16", "w-11/16"]}
                onChange={(value) => { }}
                refBook={<BtnPersonsRef handleSelectPerson={handleSelectPerson} persons={props.persons} />}
                readonly={props.readonly}
                errors={errors?.performer_name?._errors as string[] | undefined}
              />

              {/* section_name */}
              <InputField
                name="section_name"
                value={formData.section_name as string}
                label="Раздел:"
                type="text"
                w={["w-6/16", "w-11/16"]}
                onChange={(value) => { }}
                refBook={<BtnSectionsRef handleSelectSection={handleSelectSection} />}
                readonly={props.readonly}
                errors={errors?.section_name?._errors as string[] | undefined}
              />

            </div>
          </div>

          {/* table part wo_operations */}
          <div id="table_part_wo_operations" className="mt-2">
            <div className="flex flex-row gap-4 w-full md:w-1/2">
              <h2 className="px-2 pt-1 font-medium">Работы:</h2>
            </div>
            {/* заголовки таблицы не прокручиваются */}
            <div className="max-h-[50vh] overflow-y-auto rounded-md border border-gray-200 bg-white">
              <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="w-7/16 overflow-hidden px-0 py-5 font-medium sm:pl-6 text-gray-400">
                      Работа
                    </th>
                    <th scope="col" className="w-4/8 px-3 py-5 font-medium text-gray-400">
                      Операция
                    </th>
                    <th scope="col" className="w-2/8 px-3 py-5 font-medium text-gray-400">
                      Норма,часов
                    </th>
                    <th scope="col" className="w-1/16 px-3 py-5 font-medium">
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            {/* таблица прокручивается */}
            <div className="max-h-[50vh] overflow-y-auto rounded-md border border-gray-200 bg-white">
              <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {props.wo_operations.map((operation) => (
                    <tr key={operation.id} className="group">
                      <td className="w-7/16 overflow-hidden whitespace-nowrap text-ellipsis bg-white py-1 pl-0 text-left  
                      pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-left gap-3">
                          <a
                            href={"/admin/sections/" + operation.id + "/edit"}
                            className="text-blue-800 underline"
                          >{operation.work_name.substring(0, 36)}</a>
                        </div>
                      </td>
                      <td className="w-4/8 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                        {operation.operation_name}
                      </td>
                      <td className="w-2/8 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                        {operation.hours_norm}
                      </td>
                      <td className="w-1/16 whitespace-nowrap pl-4 py-1 pr-3">
                        <div className="flex justify-end gap-3">
                          <button className="rounded-md border border-gray-200 p-2 h-10 hover:bg-gray-100 
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={() => handleDeleteOperation(operation.id)}>
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

          {/* table part wo_parts */}
          <div id="table_part_wo_parts" className="mt-2">
            <div className="flex flex-row gap-4 w-full md:w-1/2">
              <h2 className="px-2 pt-1 font-medium">Запчасти:</h2>
            </div>
            {/* заголовки таблицы не прокручиваются */}
            <div className="max-h-[50vh] overflow-y-auto rounded-md border border-gray-200 bg-white">
              <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="w-7/16 overflow-hidden px-0 py-5 font-medium sm:pl-6 text-gray-400">
                      Работа
                    </th>
                    <th scope="col" className="w-4/8 px-3 py-5 font-medium text-gray-400">
                      Запчасть
                    </th>
                    <th scope="col" className="w-2/8 px-3 py-5 font-medium text-gray-400">
                      Количество
                    </th>
                    <th scope="col" className="w-1/16 px-3 py-5 font-medium">
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            {/* таблица прокручивается */}
            <div className="max-h-[50vh] overflow-y-auto rounded-md border border-gray-200 bg-white">
              <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {props.wo_parts.map((part) => (
                    <tr key={part.id} className="group">
                      <td className="w-7/16 overflow-hidden whitespace-nowrap text-ellipsis bg-white py-1 pl-0 text-left  
                      pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-left gap-3">
                          <a
                            href={"/admin/sections/" + part.id + "/edit"}
                            className="text-blue-800 underline"
                          >{part.work_name.substring(0, 36)}</a>
                        </div>
                      </td>
                      <td className="w-4/8 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                        {part.part_name}
                      </td>
                      <td className="w-2/8 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                        {part.quantity}
                      </td>
                      <td className="w-1/16 whitespace-nowrap pl-4 py-1 pr-3">
                        <div className="flex justify-end gap-3">
                          <button className="rounded-md border border-gray-200 p-2 h-10 hover:bg-gray-100 
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={() => handleDeletePart(part.id)}>
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



          <div className="flex justify-between mt-4 mr-4">
            <div className="flex w-full md:w-3/4">
              <div className="w-full md:w-1/2">
                <button
                  disabled={props.readonly}
                  className={`w-full rounded-md border p-2 ${props.readonly
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-400 text-white hover:bg-blue-100 hover:text-gray-500 cursor-pointer'
                    }`}
                  type="submit"
                >
                  Сохранить
                </button>
              </div>
              <div className="w-full md:w-1/2">
                <button
                  onClick={handleBackClick}
                  className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-100 hover:text-gray-500 cursor-pointer"
                >
                  {props.readonly ? 'Закрыть' : 'Закрыть и освободить'}
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

      {pdfUrl && (
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
      )}

      {pdfUrl && (
        <iframe
          src={pdfUrl}
          style={{
            width: '100%',
            height: '1200px',
            border: '2px solid red',
            marginTop: '20px',
          }}
          title="PDF Preview"
        />
      )}

      <MessageBoxOKCancel />
    </div>
  );
}