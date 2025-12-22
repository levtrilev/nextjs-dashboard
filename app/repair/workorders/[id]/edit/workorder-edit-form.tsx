// Workorder EditForm

'use client';
import { useEffect, useMemo, useState } from "react";
import { ClaimForm, OperationForm, PersonForm, WoOperationForm, WoPartForm, Work, WorkForm, WorkorderForm } from "@/app/lib/definitions";
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
import WoOperationsTable from "./wo-operations-table";
import WoPartsTable from "./wo-parts-table";
import { getWoOperationsStore, destroyWoOperationsStore } from "../../lib/store/woOperationsStoreRegistry";
import { getWoPartsStore, destroyWoPartsStore } from "../../lib/store/woPartsStoreRegistry";
interface IEditFormProps {
  workorder: WorkorderForm;
  lockedByUserId: string | null;
  unlockAction: ((tableName: string, id: string, userId: string) => Promise<void>) | null;
  readonly: boolean;
  claims: ClaimForm[];
  persons: PersonForm[];
  // operations: OperationForm[];
  wo_operations: WoOperationForm[] | null;
  wo_parts: WoPartForm[] | null;
  works: Work[] | null;
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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(props.workorder);
  const useCurrentWoOperationsStore = getWoOperationsStore(formData.id);
  const useCurrentWoPartsStore = getWoPartsStore(formData.id);
  const {
    wo_operations,
    saveNewOperationsToDB,
    deleteMarkedOperationsFromDB,
    addNewOperation,
    updateOperationField,
    saveOperation,
    deleteWoOperationFromState
  } = useCurrentWoOperationsStore();

  const {
    wo_parts,
    saveNewPartsToDB,
    deleteMarkedPartsFromDB,
    addNewPart,
    updatePartField,
    savePart,
    // deletePart: deletePartStore
  } = useCurrentWoPartsStore();

  useEffect(() => {
    return () => {
      // Очищаем сторы, когда документ закрывается
      destroyWoOperationsStore(formData.id);
      destroyWoPartsStore(formData.id);
    };
  }, [formData.id]);

  useEffect(() => {
    if (props.wo_operations) {
      useCurrentWoOperationsStore.getState().setInitialOperations(
        props.wo_operations.map(op => ({
          id: op.id,
          name: op.name,
          work_name: op.work_name,
          work_id: op.work_id,
          operation_name: op.operation_name,
          operation_id: op.operation_id,
          hours_norm: String(op.hours_norm),
          isEditing: false,
          isToBeDeleted: false,
        }))
      );
    }
    if (props.wo_parts) {
      useCurrentWoPartsStore.getState().setInitialParts(
        props.wo_parts.map(p => ({
          id: p.id,
          name: p.name,
          work_name: p.work_name,
          part_name: p.part_name,
          quantity: String(p.quantity),
          isEditing: false,
          isToBeDeleted: false,
        }))
      );
    }
  }, [props.wo_operations, props.wo_parts, useCurrentWoOperationsStore, useCurrentWoPartsStore]);



  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      author_id: sessionUserId,
      editor_id: '00000000-0000-0000-0000-000000000000',
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

  const handleSubmit = async (e: React.MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    // console.log("handleSubmit!!! formData: " + JSON.stringify(formData));
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
        // await updateWorkorder(formData);
        // await deleteMarkedOperationsFromDB();
        // await deleteMarkedPartsFromDB();
        // await saveNewOperationsToDB(formData.id, formData.section_id);
        // await saveNewPartsToDB(formData.id, formData.section_id);
        await Promise.all([
          updateWorkorder(formData),
          deleteMarkedOperationsFromDB(),
          deleteMarkedPartsFromDB(),
          saveNewOperationsToDB(formData.id, formData.section_id),
          saveNewPartsToDB(formData.id, formData.section_id),
        ]);
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
        <form id="workorder-form" onSubmit={handleSubmit} className="flex flex-col gap-4 pb-24">
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

          {props.wo_operations &&
            <WoOperationsTable
              readonly={props.readonly}
              onDocumentChanged={docChanged}
              workorderId={formData.id}
              sectionId={formData.section_id}
              works={props.works}
            />}
          {props.wo_parts &&
            <WoPartsTable
              readonly={props.readonly}
              onDocumentChanged={docChanged}
              workorderId={formData.id}
              sectionId={formData.section_id}
              works={props.works}
            />
          }
          <div className="sticky bottom-0 bg-white py-4 z-10"> {/* // border-t  */}
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