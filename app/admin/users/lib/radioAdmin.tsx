// import { useState } from "react";
import { CheckIcon, StopIcon } from "@heroicons/react/24/outline";
import { User } from "@/app/lib/definitions";

interface IRadioAdminProps {
  user: User,
  handleChangeAdminStatus: (event: any)=>void,
}

export default function RadioAdmin(props: IRadioAdminProps) {
    const user = props.user;

    return (
        <div className="flex justify-between mt-1">
            <legend className="text-sm font-medium flex items-center p-2">
                Admin status:
            </legend>
            <div>
                <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
                    <div className="flex gap-4">
                        <div className="flex items-center">
                            <input
                                id="not-admin"
                                name="status"
                                type="radio"
                                value="pending"
                                defaultChecked={!user.is_admin}
                                onChange={(e) => props.handleChangeAdminStatus(e)}
                                className="h-4 w-4"
                                aria-describedby="status-error"
                            />
                            <label
                                htmlFor="not-admin"
                                className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600"
                            >
                                Not Admin <StopIcon className="h-4 w-4" />
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                id="admin"
                                name="status"
                                type="radio"
                                value="paid"
                                defaultChecked={user.is_admin}
                                onChange={(e) => props.handleChangeAdminStatus(e)}
                                className="h-4 w-4"
                            />
                            <label
                                htmlFor="admin"
                                className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                            >
                                Admin <CheckIcon className="h-4 w-4" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}