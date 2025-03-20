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
                                        <p className="text-sm text-gray-500">tenant_id: {" "+role.tenant_id}</p>
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
                    <table className="hidden min-w-full text-gray-900 md:table">
                        <thead className="rounded-lg text-left text-sm font-normal">
                            <tr>
                                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                                    Роль
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Организация
                                </th>
                                <th scope="col" className="px-2 py-5 font-medium">
                                    Описание
                                </th>
                                <th scope="col" className="px-4 py-5 font-medium">
                                    Разделы
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {roles?.map((role) => (
                                <tr
                                    key={role.id}
                                    className="w-full border-b border-gray-200 py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                                >
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <div className="flex items-center gap-3">
                                            <p>{role.name}</p>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {role.tenant_id}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {role.description}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {role.section_ids}
                                    </td>
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <div className="flex justify-end gap-3">
                                            <BtnDeleteRole id={role.id} />
                                            <BtnEditRoleLink id={role.id} />
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