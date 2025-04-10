import { RoleForm } from "@/app/lib/definitions";
import RefSearch from "@/app/ui/ref-search";

interface IRolesRefTableProps {
    roles: RoleForm[],
    handleSelectRole: (
        new_role_id: string,
        new_role_name: string,
        new_role_description: string,
        new_role_tenant_id: string,
        new_role_tenant_name: string
    ) => void,
    closeModal: () => void,
    setTerm: (value: string) => void,
    term: string,
}

export default function RolesRefTable(props: IRolesRefTableProps) {
    const handleSearch = (input: string) => {
        props.setTerm(input);
    }
    return (
        <div className="w-full">
            <p>Выберите роль:</p>
            <RefSearch callback={handleSearch} term={props.term} elementIdPrefix="" />
            <div className="mt-0 flow-root">
                {/* Таблица для больших экранов */}
                <div className="overflow-x-auto md:block hidden">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden rounded-md bg-gray-50 p-1 md:pt-0">
                            <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
                                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                                    <tr>
                                        <th scope="col" className="w-1/2 overflow-hidden px-0 py-5 font-medium sm:pl-6">
                                            Название
                                        </th>
                                        <th scope="col" className="w-1/2 px-3 py-5 font-medium">
                                            Описание
                                        </th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                        {/* область прокрутки */}
                        <div className="max-h-[300px] overflow-y-auto rounded-md bg-gray-50 p-2 md:pt-0">
                            <table className="table-fixed hidden w-full rounded-md text-gray-900 md:table">
                                <tbody className="divide-y divide-gray-200 text-gray-900">
                                    {props.roles
                                    .filter((role) =>
                                        role.name.toLowerCase().includes(props.term.toLowerCase()) ||
                                        props.term.length === 0
                                    )
                                    .map((role) => (
                                        <tr key={role.id} className="group">
                                            <td className="w-1/2 overflow-hidden whitespace-nowrap text-ellipsis bg-white py-1 pl-0 text-left  
                          pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                                                <div className="flex items-left gap-3">
                                                    <a
                                                        onClick={(e) => { 
                                                            props.handleSelectRole(role.id, role.name, role.description, role.tenant_id, role.tenant_name); 
                                                            props.setTerm("");
                                                            props.closeModal(); 
                                                        }}
                                                        className="text-blue-800 underline cursor-pointer hover:text-blue-600"
                                                    >{role.name.substring(0, 36)}</a>
                                                </div>
                                            </td>
                                            <td className="w-1/2 overflow-hidden whitespace-nowrap bg-white px-4 py-1 text-sm">
                                                {role.description}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {/* Список для маленьких экранов */}
                <div className="block md:hidden">
                    <div className="max-h-[300px] overflow-y-auto rounded-md bg-gray-50 p-2">
                        {props.roles
                            .filter((role) =>
                                role.name.toLowerCase().includes(props.term.toLowerCase()) ||
                                props.term.length === 0
                            )
                            .map((role) => (
                                <div
                                    key={role.id}
                                    className="border-b border-gray-200 bg-white p-4 text-sm text-gray-900 last:border-b-0"
                                >
                                    <div className="font-medium text-black">
                                        <a
                                            onClick={(e) => {
                                                props.handleSelectRole(role.id, role.name, role.description, role.tenant_id, role.tenant_name);
                                                props.setTerm("");
                                                props.closeModal();
                                            }}
                                            className="text-blue-800 underline cursor-pointer hover:text-blue-600"
                                        >
                                            {role.name.substring(0, 36)}
                                        </a>
                                    </div>
                                    <div className="text-gray-500">{role.description}</div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
