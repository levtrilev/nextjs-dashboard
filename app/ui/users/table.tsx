import { formatDateToLocal } from "@/app/lib/utils";
import { fetchUsers } from "@/app/lib/data";

export default async function UsersTable() {
    // const users = [
    //     { id: "111", name: "name1", email: "email1", password: "123456", date: "01.01.2025" },
    //     { id: "222", name: "name2", email: "email2", password: "123456", date: "01.01.2025" },
    //     { id: "333", name: "name3", email: "email3", password: "123456", date: "01.01.2025" },
    //     { id: "444", name: "name4", email: "email4", password: "123456", date: "01.01.2025" },
    // ];
    const datePlaceHolder = "01.01.2025";
    const users = await fetchUsers();
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

                                            <p>{user.id}</p>
                                        </div>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex w-full items-center justify-between pt-4">
                                    <div>
                                        <p className="text-xl font-medium">
                                            {user.password}
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
                                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                                    id
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Email
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Password
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Date
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
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                                >
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <div className="flex items-center gap-3">
                                            <p>{user.id}</p>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {user.email}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {user.password}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {formatDateToLocal(datePlaceHolder)}
                                    </td>
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <div className="flex justify-end gap-3">
                                            {/* <DeleteInvoice id={invoice.id} /> */}
                                            <p className="text-xl font-medium">
                                                Delete User
                                            </p>                    </div>
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