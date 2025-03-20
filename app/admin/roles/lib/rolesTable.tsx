'use client';
import { formatDateToLocal } from "@/app/lib/utils";
import { Role } from '@/app/lib/definitions';
import dynamic from 'next/dynamic';
import { BtnDeleteRole, BtnEditRoleLink } from "./buttons";

interface IRolesTableProps {
    roles: Role[],
}
export const RolesTable: React.FC<IRolesTableProps> = (props: IRolesTableProps) => {

    const datePlaceHolder = "01.01.2025";
    const roles = props.roles.length !== 0 ? props.roles : [];

    return (
        <div className="mt-6 flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                    <div className="md:hidden">
                        {roles.length > 0 && roles.map((role) => (
                            <div
                                key={role.id}
                                className="mb-2 w-full rounded-md bg-white p-4"
                            >
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div>
                                        <div className="mb-2 flex items-center">
                                            <p>{role.name}</p>
                                        </div>
                                        <p className="text-sm text-gray-500">tenant_id: {" " + role.tenant_id}</p>
                                    </div>
                                </div>
                                <div className="flex w-full items-center justify-between pt-4">
                                    <div>
                                        <p className="text-xl font-medium">
                                            {role.description}
                                        </p>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <p className="text-xl font-medium">
                                            Delete
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
                        <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                            <tr>
                                <th scope="col" className="w-1/8 overflow-hidden px-0 py-5 font-medium sm:pl-6">
                                    Роль
                                </th>
                                <th scope="col" className="w-1/8 px-3 py-5 font-medium">
                                    Организация
                                </th>
                                <th scope="col" className="w-1/8 px-3 py-5 font-medium">
                                    Описание
                                </th>
                                <th scope="col" className="w-1/8 px-3 py-5 font-medium">
                                    Разделы
                                </th>
                                <th scope="col" className="w-1/8 px-3 py-5 font-medium">
                                    
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-900">
                            {roles?.map((role) => (
                                <tr key={role.id} className="group">
                                    <td className="w-1/8 overflow-hidden whitespace-nowrap text-ellipsis bg-white py-1 pl-0 text-left  
                      pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                                        <div className="flex items-left gap-3">
                                            <a
                                                href={"/admin/roles/" + role.id + "/edit"}
                                                className="text-blue-800 underline"
                                            >{role.name.substring(0, 20)}</a>
                                        </div>
                                    </td>
                                    <td className="w-1/8 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                                        {role.tenant_id}
                                    </td>
                                    <td className="w-1/8 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                                        {role.description}
                                    </td>
                                    <td className="w-1/8 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                                        {role.section_ids}
                                    </td>
                                    <td className="w-1/16 whitespace-nowrap pl-4 py-1 pr-3">
                                        <div className="flex justify-end gap-3">
                                            <BtnDeleteRole id={role.id} />
                                            {/* <BtnEditRoleLink id={role.id} /> */}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default RolesTable;