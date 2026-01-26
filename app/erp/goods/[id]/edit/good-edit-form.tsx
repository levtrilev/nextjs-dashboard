'use client';
import { useEffect, useState } from "react";
import { GoodForm, LegalEntityForm } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
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
import { pdf } from '@react-pdf/renderer';

interface IEditFormProps {
  good: GoodForm;
  suppliers: LegalEntityForm[];
  lockedByUserId: string | null;
  unlockAction: ((tableName: string, id: string, userId: string) => Promise<void>) | null;
  readonly: boolean;
}

//#region Good zod schema
import { z } from "zod";
import { createGood, updateGood } from "../../lib/goods-actions";
import GoodPdfDocument from "../../lib/good-pdf-document";
import BtnLegalEntitiesRef from "@/app/erp/legal-entities/lib/btn-legal-entities-ref";
import BtnSectionsRef from "@/app/admin/sections/lib/btn-sections-ref";
const GoodFormSchemaFull = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: "Название обязательно." }),
  brand: z.string().min(1, { message: "Бренд обязателен." }),
  product_code: z.string().min(1, { message: "Артикул обязателен." }),
  supplier_id: z.string().uuid(),
  supplier_name: z.string().min(1, { message: "Поставщик обязателен." }),
  price_retail: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0, { message: "Цена не может быть отрицательной." })
  ),
  price_wholesale: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0, { message: "Цена не может быть отрицательной." })
  ),
  price_cost: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0, { message: "Цена не может быть отрицательной." })
  ),
  dimensions_height: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0)
  ),
  dimensions_width: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0)
  ),
  dimensions_length: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0)
  ),
  weight: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val) : val),
    z.number().min(0)
  ),
  section_id: z.string().uuid(),
  section_name: z.string().min(1, { message: "Раздел обязателен." }),
  tenant_id: z.string().uuid(),
  author_id: z.string().uuid(),
  editor_id: z.string().uuid(),
  username: z.string().optional(),
  // timestamptz: z.string().optional(),
  editing_by_user_id: z.string().nullable(),
  editing_since: z.string().nullable(),
});
const GoodFormSchema = GoodFormSchemaFull.omit({
  id: true,
  // timestamptz: true,
  username: true,
  editing_by_user_id: true,
  editing_since: true,
});
export type FormData = z.infer<typeof GoodFormSchemaFull>;
//#endregion

export default function GoodEditForm(props: IEditFormProps) {
  const userSections = useDocumentStore.getState().userSections;
  const sessionUser = useDocumentStore.getState().sessionUser;
  const docTenantId = useDocumentStore.getState().documentTenantId;
  const [showErrors, setShowErrors] = useState(false);
  const isDocumentChanged = useIsDocumentChanged();
  const msgBox = useMessageBox();
  const router = useRouter();

  const docChanged = () => {
    setIsDocumentChanged(true);
    setMessageBoxText('Документ изменен. Закрыть без сохранения?');
  };

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(props.good as FormData);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      author_id: sessionUser.id,
      editor_id: sessionUser.id,
      tenant_id: docTenantId,
    }));
  }, [sessionUser.id, docTenantId]);

  const validate = () => {
    const res = GoodFormSchema.safeParse({
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
      return;
    }
    try {
      if (formData.id === "") {
        await createGood(formData);
        setTimeout(() => {
          router.push('/goods');
        }, 2000);
      } else {
        await updateGood(formData);
        router.refresh();
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
    if (props.unlockAction) await props.unlockAction("goods", props.good.id, sessionUser.id);
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

  const handleSelectSupplier = (new_supplier_id: string, new_supplier_name: string) => {
    setFormData((prev) => ({
      ...prev,
      supplier_id: new_supplier_id,
      supplier_name: new_supplier_name,
    }));
    docChanged();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    docChanged();
  };

  const handleNumberChange = (field: string, value: string) => {
    const num = Number(value);
    if (!isNaN(num)) {
      setFormData((prev) => ({ ...prev, [field]: num }));
      docChanged();
    }
  };

  const handleShowPDF = async () => {
    try {
      const blob = await pdf(<GoodPdfDocument formData={formData} />).toBlob();
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
        <form id="good-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            {/* first column */}
            <div className="flex flex-col gap-4 w-full md:w-1/2">
              <InputField
                name="name"
                value={formData.name}
                label="Название:"
                type="text"
                w={["w-4/16", "w-13/16"]}
                onChange={(value) => handleInputChange('name', String(value))}
                readonly={props.readonly}
                errors={errors?.name?._errors as string[] | undefined}
              />
              <InputField
                name="brand"
                value={formData.brand}
                label="Брэнд:"
                type="text"
                w={["w-4/16", "w-13/16"]}
                onChange={(value) => handleInputChange('brand', String(value))}
                readonly={props.readonly}
                errors={errors?.brand?._errors as string[] | undefined}
              />
              <InputField
                name="product_code"
                value={formData.product_code}
                label="Артикул:"
                type="text"
                w={["w-4/16", "w-13/16"]}
                onChange={(value) => handleInputChange('product_code', String(value))}
                readonly={props.readonly}
                errors={errors?.product_code?._errors as string[] | undefined}
              />
              <InputField
                name="supplier_name"
                value={formData.supplier_name}
                label="Поставщик:"
                type="text"
                w={["w-4/16", "w-13/16"]}
                onChange={() => { }}
                refBook={<BtnLegalEntitiesRef handleSelectLegalEntity={handleSelectSupplier} legalEntities={props.suppliers} elementIdPrefix="supplier" />}
                readonly={props.readonly}
                errors={errors?.supplier_name?._errors as string[] | undefined}
              />
              <InputField
                name="dimensions_height"
                value={String(formData.dimensions_height)}
                label="Размеры высота (см):"
                type="number"
                w={["w-4/16", "w-13/16"]}
                onChange={(value) => handleNumberChange('dimensions_height', String(value))}
                readonly={props.readonly}
                errors={errors?.dimensions_height?._errors as string[] | undefined}
              />
              <InputField
                name="dimensions_width"
                value={String(formData.dimensions_width)}
                label="Размеры ширина (см):"
                type="number"
                w={["w-4/16", "w-13/16"]}
                onChange={(value) => handleNumberChange('dimensions_width', String(value))}
                readonly={props.readonly}
                errors={errors?.dimensions_width?._errors as string[] | undefined}
              />
            </div>

            {/* second column */}
            <div className="flex flex-col gap-4 w-full md:w-1/2">
              <InputField
                name="dimensions_length"
                value={String(formData.dimensions_length)}
                label="Размеры длина (см):"
                type="number"
                w={["w-4/16", "w-13/16"]}
                onChange={(value) => handleNumberChange('dimensions_length', String(value))}
                readonly={props.readonly}
                errors={errors?.dimensions_length?._errors as string[] | undefined}
              />
              <InputField
                name="weight"
                value={String(formData.weight)}
                label="Вес (кг):"
                type="number"
                w={["w-4/16", "w-13/16"]}
                onChange={(value) => handleNumberChange('weight', String(value))}
                readonly={props.readonly}
                errors={errors?.weight?._errors as string[] | undefined}
              />
              <InputField
                name="price_retail"
                value={String(formData.price_retail)}
                label="Цена розница (руб):"
                type="number"
                w={["w-4/16", "w-13/16"]}
                onChange={(value) => handleNumberChange('price_retail', String(value))}
                readonly={props.readonly}
                errors={errors?.price_retail?._errors as string[] | undefined}
              />
              <InputField
                name="price_wholesale"
                value={String(formData.price_wholesale)}
                label="Цена опт (руб):"
                type="number"
                w={["w-4/16", "w-13/16"]}
                onChange={(value) => handleNumberChange('price_wholesale', String(value))}
                readonly={props.readonly}
                errors={errors?.price_wholesale?._errors as string[] | undefined}
              />
              <InputField
                name="price_cost"
                value={String(formData.price_cost)}
                label="Цена закупки (руб):"
                type="number"
                w={["w-4/16", "w-13/16"]}
                onChange={(value) => handleNumberChange('price_cost', String(value))}
                readonly={props.readonly}
                errors={errors?.price_cost?._errors as string[] | undefined}
              />
              <InputField
                name="section_name"
                value={formData.section_name}
                label="Раздел:"
                type="text"
                w={["w-4/16", "w-13/16"]}
                onChange={() => { }}
                refBook={<BtnSectionsRef handleSelectSection={handleSelectSection} />}
                readonly={props.readonly}
                errors={errors?.section_name?._errors as string[] | undefined}
              />
            </div>
          </div>
          <div id="form-error" aria-live="polite" aria-atomic="true">
            {errors &&
              <p className="mt-2 text-sm text-red-500" key={'form_errors'}>
                {JSON.stringify(errors)}
              </p>
            }
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
      )}

      {/* Кнопка закрытия PDF */}
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

      {/* Отображение PDF в iframe */}
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