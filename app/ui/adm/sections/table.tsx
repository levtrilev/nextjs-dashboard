import { formatDateToLocal } from "@/app/lib/utils";
import { Section } from '@/app/lib/definitions';
import { BtnDeleteSection, BtnEditSectionLink } from "./buttons";

interface ISectionsTableProps {
    sections: Section[],
}
export const SectionsTable: React.FC<ISectionsTableProps> = (props: ISectionsTableProps) => {

    // export default async function UsersTable() {
    const datePlaceHolder = "01.01.2025";
    // const users = await fetchUsers();
    const sections = props.sections;
    return (
        <div className="mt-6 flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                    <div className="md:hidden">
                        {sections?.map((sec) => (
                            <div
                                key={sec.id}
                                className="mb-2 w-full rounded-md bg-white p-4"
                            >
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div>
                                        <div className="mb-2 flex items-center">
                                            <p>{sec.tenant_id}</p>
                                        </div>
                                        <p className="text-sm text-gray-500">{sec.name}</p>
                                    </div>
                                </div>
                                <div className="flex w-full items-center justify-between pt-4">
                                    <div>
                                        <p className="text-xl font-medium">
                                            {sec.name}
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
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Section
                                </th>
                                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                                    Tenant
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Date Created
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
                            {sections.map((sec) => (
                                <tr
                                    key={sec.id}
                                    className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                                >
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {sec.name}
                                    </td>
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <div className="flex items-center gap-3">
                                            <p>{sec.tenant_id}</p>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {formatDateToLocal(datePlaceHolder)}
                                    </td>
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <div className="flex justify-end gap-3">
                                            <BtnDeleteSection id={sec.id} />
                                            <BtnEditSectionLink id={sec.id} />

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

export default SectionsTable;