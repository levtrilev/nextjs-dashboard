// Claim EditForm

'use client';
import { useEffect, useState } from "react";
import { ClaimForm, LocationForm, MachineForm } from "@/app/lib/definitions";
import { formatDateForInput } from "@/app/lib/common-utils";
import BtnSectionsRef from "@/app/admin/sections/lib/btn-sections-ref";
import { z } from "zod";
import { pdf, PDFViewer } from '@react-pdf/renderer';
import MessageBoxOKCancel from "@/app/lib/message-box-ok-cancel";
import {
  setIsDocumentChanged,
  setIsMessageBoxOpen,
  setIsShowMessageBoxCancel,
  setMessageBoxText,
  useDocumentStore,
  useIsDocumentChanged,
  useMessageBox
} from "@/app/store/useDocumentStore";
import InputField from "@/app/lib/input-field";
import { useRouter } from "next/navigation";
import { createClaim, updateClaim } from "../../lib/claims-actions";
import PdfDocument from "./claim-pdf-document";
import BtnMachinesRef from "@/app/repair/machines/lib/btn-machines-ref";
import BtnLocationsRef from "@/app/repair/locations/lib/btn-locations-ref";
import { machine } from "os";

interface IEditFormProps {
  claim: ClaimForm;
  machines: MachineForm[];
  locations: LocationForm[];
  lockedByUserId: string | null;
  unlockAction: ((tableName: string, id: string, userId: string) => Promise<void>) | null;
  readonly: boolean;
}

//#Claim zod schema
const PrioritySchema = z.enum(['высокий', 'низкий']);

const ClaimFormSchemaFull = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, {
    message: "Название должно содержать не менее 2-х символов.",
  }),
  claim_date: z.date({
    required_error: "Поле claim_date должно быть заполнено.",
    invalid_type_error: "Поле claim_date должно быть датой.",
  }),
  priority: PrioritySchema,
  machine_id: z.string(),
  machine_name: z.string(),
  location_id: z.string(),
  location_name: z.string(),
  repair_todo: z.string(),
  repair_reason: z.string(),
  breakdown_reasons: z.string(),
  emergency_act: z.string(),
  machine_unit_name: z.string(),
  machine_machine_status: z.string(),
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

const ClaimFormSchema = ClaimFormSchemaFull.omit({
  id: true,
  timestamptz: true,
  username: true,
  editing_by_user_id: true,
  editing_since: true,
});

export type FormData = z.infer<typeof ClaimFormSchemaFull>;
//#endregion

export default function ClaimEditForm(props: IEditFormProps) {

  //#region unified form hooks and variables 
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
  //#endregion

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(props.claim as FormData);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      author_id: sessionUserId,
      tenant_id: docTenantId,
    }));
  }, []);

  const validate = () => {
    const res = ClaimFormSchema.safeParse({
      ...formData,
    });
    if (res.success) {
      return undefined;
    }
    return res.error.format();
  };

  //#region handles
  const handleSubmit = async (e: React.MouseEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validate();
    if (errors) {
      setShowErrors(true);
      console.log("ошибки есть: " + JSON.stringify(errors));
      return;
    }

    try {
      if (formData.id === "") {
        await createClaim(formData);
        setTimeout(() => {
          router.push('/repair/claims');
        }, 2000);
      } else {
        await updateClaim(formData);
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
    if (props.unlockAction) await props.unlockAction("claims", props.claim.id, sessionUserId);
    if (isDocumentChanged && !msgBox.isOKButtonPressed) {
      setIsShowMessageBoxCancel(true);
      setIsMessageBoxOpen(true);
    } else if (isDocumentChanged && msgBox.isOKButtonPressed) {
      // уже обработано через OK
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

  const handleSelectLocation = (new_location_id: string, new_location_name: string) => {
    setFormData((prev) => ({
      ...prev,
      location_id: new_location_id,
      location_name: new_location_name,
    }));
    docChanged();
  };
  const handleSelectMachine = (new_machine_id: string, new_machine_name: string, new_location_id: string, new_location_name: string) => {
    setFormData((prev) => ({
      ...prev,
      machine_id: new_machine_id,
      machine_name: new_machine_name,
      location_id: new_location_id,
      location_name: new_location_name,
    }));
    docChanged();
  };
  const handleInputChange = (field: string, value: string | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    docChanged();
  };

  const handleRedirectBack = () => {
    window.history.back();
  };
  function handleSelectPriority(event: any) {
    setFormData((prev) => ({
      ...prev,
      priority: event.target.value,
      // priority: event.target.selectedOptions[0].text,
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
  //#endregion

  const errors = showErrors ? validate() : undefined;

  return (
    <div>
      {!pdfUrl && (
        <form id="claim-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full">

            {/* first column */}
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

              <div className="flex flex-row justify-between">
                {/* claim_date */}
                <InputField name="claim_date" value={formatDateForInput(formData.claim_date)}
                  label="Дата заявки:" type="date" w={["w-8/16", "w-10/16"]}
                  onChange={(value) => handleInputChange('claim_date', value)}
                  readonly={props.readonly}
                  errors={errors?.claim_date?._errors as string[] | undefined}
                />

                {/* priority */}
                <div className="flex-1 flex items-center">
                  <label htmlFor="priority" className="text-sm font-medium flex items-center p-2">Приоритет:</label>
                  <select
                    name="priority" id="priority"
                    className="w-full h-10 cursor-pointer rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-blue-300"
                    disabled={props.readonly}
                    value={formData.priority}
                    onChange={(e) => handleSelectPriority(e)}
                  >
                    <option value="" disabled>
                      Приоритет
                    </option>
                    <option key={'низкий'} value={'низкий'}>
                      низкий
                    </option>
                    <option key={'высокий'} value={'высокий'}>
                      высокий
                    </option>
                  </select>
                </div>
              </div>

              {/* machine_name */}
              <InputField
                name="machine_name"
                value={formData.machine_name as string}
                label="Машина:"
                type="text"
                w={["w-4/16", "w-13/16"]}
                onChange={(value) => { }}
                refBook={<BtnMachinesRef handleSelectMachine={handleSelectMachine} machines={props.machines} />}
                readonly={props.readonly}
                errors={errors?.machine_name?._errors as string[] | undefined}
              />

              {/* location_name */}
              <InputField
                name="location_name"
                value={formData.location_name as string}
                label="Местонахождение:"
                type="text"
                w={["w-6/16", "w-11/16"]}
                onChange={(value) => { }}
                refBook={<BtnLocationsRef handleSelectLocation={handleSelectLocation} locations={props.locations} />}
                readonly={props.readonly}
                errors={errors?.location_name?._errors as string[] | undefined}
              />

              {/* repair_todo */}
              <InputField
                name="repair_todo"
                value={formData.repair_todo}
                label="Характер Ремонта:"
                type="text"
                w={["w-4/16", "w-13/16"]}
                onChange={(value) => handleInputChange('repair_todo', value)}
                readonly={props.readonly}
                errors={errors?.repair_todo?._errors as string[] | undefined}
              />

            </div>

            {/* second column */}
            <div className="flex flex-col gap-4 w-full md:w-1/2">

              {/* emergency_act */}
              <InputField
                name="emergency_act"
                value={formData.emergency_act}
                label="Аварийный акт:"
                type="text"
                w={["w-4/16", "w-13/16"]}
                // moreInputClassName="break-words"
                onChange={(value) => handleInputChange('emergency_act', value)}
                readonly={props.readonly}
                errors={errors?.emergency_act?._errors as string[] | undefined}
              />

              {/* repair_reason */}
              <InputField
                name="repair_reason"
                value={formData.repair_reason}
                label="Причина постановки в ремонт:"
                type="text"
                w={["w-4/16", "w-13/16"]}
                onChange={(value) => handleInputChange('repair_reason', value)}
                readonly={props.readonly}
                textArea={true}
                errors={errors?.repair_reason?._errors as string[] | undefined}
              />
              
              {/* breakdown_reasons */}
              <InputField
                name="breakdown_reasons"
                value={formData.breakdown_reasons}
                label="Причины, вызвавшие поломку:"
                type="text"
                w={["w-4/16", "w-13/16"]}
                onChange={(value) => handleInputChange('breakdown_reasons', value)}
                readonly={props.readonly}
                textArea={true}
                errors={errors?.breakdown_reasons?._errors as string[] | undefined}
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

          {/* button area */}
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
      )
      }

      {/* Кнопка закрытия PDF */}
      {
        pdfUrl && (
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
        )
      }

      {/* Отображение PDF в iframe */}
      {
        pdfUrl && (
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
        )
      }

      <MessageBoxOKCancel />
    </div >
  );
}