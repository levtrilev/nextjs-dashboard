// import { useState } from "react";
import { CheckIcon, StopIcon } from "@heroicons/react/24/outline";
import { LegalEntity } from "@/app/lib/definitions";

interface IRadioActiveProps {
  legalEntity: LegalEntity,
  handleChange: (event: any)=>void,
  readonly: boolean,
}

export default function RadioActiveIsCustomer(props: IRadioActiveProps) {
    //   const [tenant, setTenant] = useState(props.tenant);
    const legalEntity = props.legalEntity;

    return (
        <div className="flex justify-between mt-1">
            <legend className="text-sm text-blue-900 font-medium flex items-center p-2">
                Покупатель?
            </legend>
            <div>
                <div className="rounded-md border border-gray-200 bg-white px-[14px] py-1.5">
                    <div className="flex gap-4">
                        <div className="flex items-center">
                            <input
                                id="not_customer"
                                name="is_customer"
                                type="radio"
                                disabled={props.readonly}
                                value="pending"
                                defaultChecked={!legalEntity.is_customer}
                                onChange={(e) => props.handleChange(e)}
                                className="h-4 w-4"
                                aria-describedby="status-error"
                            />
                            <label
                                htmlFor="not_customer"
                                className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600"
                            >
                                Нет <StopIcon className="h-4 w-4" />
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                id="is_customer"
                                name="is_customer"
                                type="radio"
                                disabled={props.readonly}
                                value="true"
                                defaultChecked={legalEntity.is_customer}
                                onChange={(e) => props.handleChange(e)}
                                className="h-4 w-4"
                            />
                            <label
                                htmlFor="is_customer"
                                className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                            >
                                Да <CheckIcon className="h-4 w-4" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function RadioActiveIsSupplier(props: IRadioActiveProps) {
    //   const [tenant, setTenant] = useState(props.tenant);
    const legalEntity = props.legalEntity;

    return (
        <div className="flex justify-between mt-1">
            <legend className="text-sm text-blue-900 font-medium flex items-center p-2">
                Поставщик?
            </legend>
            <div>
                <div className="rounded-md border border-gray-200 bg-white px-[14px] py-1.5">
                    <div className="flex gap-4">
                        <div className="flex items-center">
                            <input
                                id="not_supplier"
                                name="is_supplier"
                                type="radio"
                                disabled={props.readonly}
                                value="pending"
                                defaultChecked={!legalEntity.is_supplier}
                                onChange={(e) => props.handleChange(e)}
                                className="h-4 w-4"
                                aria-describedby="status-error"
                            />
                            <label
                                htmlFor="not_supplier"
                                className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600"
                            >
                                Нет <StopIcon className="h-4 w-4" />
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                id="is_supplier"
                                name="is_supplier"
                                type="radio"
                                disabled={props.readonly}
                                value="true"
                                defaultChecked={legalEntity.is_supplier}
                                onChange={(e) => props.handleChange(e)}
                                className="h-4 w-4"
                            />
                            <label
                                htmlFor="is_supplier"
                                className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                            >
                                Да <CheckIcon className="h-4 w-4" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}