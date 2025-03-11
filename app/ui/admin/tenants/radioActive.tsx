// import { useState } from "react";
import { CheckIcon, StopIcon } from "@heroicons/react/24/outline";
import { Tenant } from "@/app/lib/definitions";

interface IRadioActiveProps {
  tenant: Tenant,
  handleChangeActive: (event: any)=>void,
}

export default function RadioActive(props: IRadioActiveProps) {
    //   const [tenant, setTenant] = useState(props.tenant);
    const tenant = props.tenant;

    return (
        <div className="flex justify-between mt-1">
            <legend className="text-sm font-medium flex items-center p-2">
                Active status:
            </legend>
            <div>
                <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
                    <div className="flex gap-4">
                        <div className="flex items-center">
                            <input
                                id="inactive"
                                name="status"
                                type="radio"
                                value="pending"
                                defaultChecked={!tenant.active}
                                onChange={(e) => props.handleChangeActive(e)}
                                className="h-4 w-4"
                                aria-describedby="status-error"
                            />
                            <label
                                htmlFor="inactive"
                                className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600"
                            >
                                Inactive <StopIcon className="h-4 w-4" />
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                id="active"
                                name="status"
                                type="radio"
                                value="paid"
                                defaultChecked={tenant.active}
                                onChange={(e) => props.handleChangeActive(e)}
                                className="h-4 w-4"
                            />
                            <label
                                htmlFor="active"
                                className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                            >
                                Active <CheckIcon className="h-4 w-4" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}