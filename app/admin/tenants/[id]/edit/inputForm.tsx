'use client';
import { FC, useEffect, useState } from "react";
import { Tenant } from "@/app/lib/definitions";
import { updateTenant } from "../../lib/tenants-actions";
import RadioActive from "../../lib/radioActive";
import { setIsCancelButtonPressed, setIsDocumentChanged, setIsMessageBoxOpen, setIsOKButtonPressed, setMessageBoxText, useIsDocumentChanged, useIsOKButtonPressed, useMessageBoxText } from "@/app/store/useMessageBoxStore";
import { useRouter } from 'next/navigation';
import MessageBoxOKCancel from "@/app/erp/tasks/lib/MessageBoxOKCancel";

interface IInputFormProps {
  tenant: Tenant,
  admin: boolean,
}
export const InputForm: FC<IInputFormProps> = (props: IInputFormProps) => {

  const router = useRouter();
  const [tenant, setTenant] = useState(props.tenant);
  const isDocumentChanged = useIsDocumentChanged();
  const isOKButtonPressed = useIsOKButtonPressed();
  const messageBoxText = useMessageBoxText();

  const handleChangeName = (event: any) => {
    setTenant((prev) => ({
      ...prev,
      name: event.target.value,
    }));
    setIsDocumentChanged(true);
    setMessageBoxText('Документ изменен. Закрыть без сохранения?');
  };
  const handleChangeDescription = (event: any) => {
    setTenant((prev) => ({
      ...prev,
      description: event.target.value,
    }));
    setIsDocumentChanged(true);
    setMessageBoxText('Документ изменен. Закрыть без сохранения?');

  };
  const handleChangeActive = (event: any) => {
    setTenant((prev) => ({
      ...prev,
      active: !prev.active,
    }));
    setIsDocumentChanged(true);
    setMessageBoxText('Документ изменен. Закрыть без сохранения?');
  };
  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDocumentChanged && !isOKButtonPressed) {
      setIsMessageBoxOpen(true);
    } else if (isDocumentChanged && isOKButtonPressed) {
      // router.push('/admin/tenants/');
      // return;
    } else if (!isDocumentChanged) {
      router.push('/admin/tenants/');
      // return;
    }
  };

  useEffect(() => {
    setIsDocumentChanged(false);
    setIsMessageBoxOpen(false);
    setIsOKButtonPressed(false);
    setIsCancelButtonPressed(false);
    setMessageBoxText('');
  }, []);

  useEffect(() => {
    if (isOKButtonPressed && messageBoxText === 'Документ изменен. Закрыть без сохранения?') {
      router.push('/admin/tenants/');
    }
    setIsOKButtonPressed(false);
    setIsCancelButtonPressed(false);
    setIsDocumentChanged(false);
    setIsMessageBoxOpen(false);
  }, [isOKButtonPressed, router]);

  return (
    <div >
      <div className="grid grid-cols-2 gap-4">
        <div className="flex justify-between mt-1">
          <label
            htmlFor="name"
            className="text-sm font-medium flex items-center p-2"
          >
            Name:
          </label>
          <input
            id="name"
            type="text"
            className="w-7/8 control rounded-md border border-gray-200 p-2"
            value={tenant.name}
            onChange={(e) => handleChangeName(e)}
          />
        </div>
        <div className="w-1/2"></div>
        <div className="flex justify-between mt-1">
          <label
            htmlFor="description"
            className="w-2/8 text-sm font-medium flex items-center p-2">
            Description:
          </label>
          <input
            id="description"
            type="text"
            className="w-13/16 control rounded-md border border-gray-200 p-2"
            value={tenant.description}
            onChange={(e) => handleChangeDescription(e)}
          />
        </div>
        <div className="w-1/2"></div>
        <RadioActive tenant={tenant} handleChangeActive={handleChangeActive} />
        <div></div>
      </div>
      <div className="flex justify-between mt-1">
        <div className="flex w-1/2">
          <div className="w-1/4">
            <button
              disabled={!props.admin}
              onClick={() => {
                updateTenant(tenant);
                setIsDocumentChanged(false);
                setMessageBoxText('Документ сохранен.');
                setIsMessageBoxOpen(true);
              }}
              className="bg-blue-400 text-white w-full rounded-md border p-2 
              hover:bg-blue-100 hover:text-gray-500 cursor-pointer"
            >
              Save
            </button>
          </div>
          <div className="w-1/4">
            <button
              onClick={handleBackClick}
              className="bg-blue-400 text-white w-full rounded-md border p-2
                 hover:bg-blue-100 hover:text-gray-500 cursor-pointer"
            >
              Back to list
            </button>
          </div>
        </div>
      </div>
      <MessageBoxOKCancel showCancel={true} />
    </div>
  );
}

export default InputForm;
