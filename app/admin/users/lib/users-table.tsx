'use client';
import { formatDateToLocal } from "@/app/lib/utils";
import { User, UserForm } from '@/app/lib/definitions';
import { BtnDeleteUser, BtnEditUserLink } from "./users-buttons";
import { setIsShowMessageBoxCancel } from "@/app/store/useMessageBoxStore";
import { useEffect } from "react";

interface IUsersTableProps {
    users: UserForm[],
    admin: boolean,
}
export const UsersTable: React.FC<IUsersTableProps> = (props: IUsersTableProps) => {

    // export default async function UsersTable() {
    const datePlaceHolder = "01.01.2025";
    // const users = await fetchUsers();
    const users = props.users;
        useEffect(
            () => {
                setIsShowMessageBoxCancel(false);
            },
            []
        );
    return (
        <div className="mt-6 flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                    <div className="md:hidden">
                        {users?.map((user) => (
                            <div
                                key={user.id}
                                className="mb-2 w-full rounded-md bg-white p-4"
                            >
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div>
                                        <div className="mb-2 flex items-center">

                                            <p>{user.tenant_id}</p>
                                        </div>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex w-full items-center justify-between pt-4">
                                    <div>
                                        <p className="text-xl font-medium">
                                            {user.is_admin?.toString()}
                                        </p>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        {/* <DeleteInvoice id={invoice.id} /> */}
                                        <p className="text-xl font-medium">
                                            Delete User
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <table className="hidden min-w-full text-gray-900 md:table">
                        <thead className="rounded-lg text-left text-sm font-normal">
                            <tr>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Email
                                </th>                                
                                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                                    Организация
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    admin?
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Дата создания
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Действия
                                </th>
                                <th scope="col" className="relative py-3 pl-6 pr-3">
                                    <span className="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="w-full border-b border-gray-200 py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                                >
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {user.email}
                                    </td>
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <div className="flex items-center gap-3">
                                            <p>{user.tenant_name}</p>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {user.is_superadmin ? "super" : user.is_admin ? "admin" : " -- "}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {formatDateToLocal(datePlaceHolder)}
                                    </td>
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <div className="flex justify-end gap-3">
                                            { props.admin && !user.is_superadmin && <BtnDeleteUser id={user.id} /> }
                                            { props.admin && !user.is_superadmin && <BtnEditUserLink id={user.id} /> }
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

export default UsersTable;