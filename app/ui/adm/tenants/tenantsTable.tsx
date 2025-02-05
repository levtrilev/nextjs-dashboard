'use client';
import { formatDateToLocal } from "@/app/lib/utils";
import { Tenant } from '@/app/lib/definitions';
import { BtnDeleteTenant } from "./buttons";
import BtnEditTenantModal from "./btnEditTenantModal";
import { BtnEditTenantLink } from "./buttons";
import { useEffect, useState } from "react";
import { fetchTenants } from "@/app/lib/data";

interface ITenantsTableProps {
    tenants: Tenant[],
}
export const TenantsTable: React.FC<ITenantsTableProps> = (props: ITenantsTableProps) => {

    const datePlaceHolder = "01.01.2025";
    const tenants = props.tenants.length !== 0 ? props.tenants : [];

    return (
        <div className="mt-6 flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                    <div className="md:hidden">
                        {tenants.length > 0 && tenants.map((tenant) => (
                            <div
                                key={tenant.id}
                                className="mb-2 w-full rounded-md bg-white p-4"
                            >
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div>
                                        <div className="mb-2 flex items-center">
                                            <p>{tenant.name}</p>
                                        </div>
                                        <p className="text-sm text-gray-500">{tenant.active}</p>
                                    </div>
                                </div>
                                <div className="flex w-full items-center justify-between pt-4">
                                    <div>
                                        <p className="text-xl font-medium">
                                            {tenant.description}
                                        </p>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        {/* <DeleteInvoice id={invoice.id} /> */}
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
                                    Tenant
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Description
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Active
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Date created
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Action
                                </th>
                                <th scope="col" className="relative py-3 pl-6 pr-3">
                                    <span className="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {tenants?.map((tenant) => (
                                <tr
                                    key={tenant.id}
                                    className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                                >
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <div className="flex items-center gap-3">
                                            <p>{tenant.name}</p>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {tenant.description}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {tenant.active.toString()}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {formatDateToLocal(datePlaceHolder)}
                                    </td>
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <div className="flex justify-end gap-3">
                                            {/* <DeleteInvoice id={invoice.id} /> */}
                                            {/* <p className="text-m font-medium"> */}
                                            <BtnEditTenantModal tenant={tenant} />
                                            <BtnDeleteTenant name={tenant.name} />
                                            <BtnEditTenantLink id={tenant.id} />
                                            {/* </p> */}
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

export default TenantsTable;