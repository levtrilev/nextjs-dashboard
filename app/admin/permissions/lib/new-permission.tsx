// NewDocRolePermission

'use client';
import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { RoleForm, Tenant } from '@/app/lib/definitions';
import { createDocRolePermission } from './permissios-actions';
// import { addRole } from './store/useRoleStore';
interface INewDocRolePermissionProps {
    doctypes: { table_name: string }[],
    tenants: Tenant[],
    roles: RoleForm[]
}
export const NewPermission = (props: INewDocRolePermissionProps) => {
    const [doctype, setDoctype] = useState<string>("");
    const [doctypeName, setDoctypeName] = useState<string>("");
    const [tenantId, setTenantId] = useState<string>("");
    const [tenantName, setTenantName] = useState<string>("");
    const [roleId, setRoleId] = useState<string>("");
    const [roleName, setRoleName] = useState<string>("");
    function handleSelectDoctype(event: any) {
        setDoctype(event.target.value);
        switch (event.target.value) {
            case 'regions': 
                setDoctypeName('Регионы');
                break;
            case 'legal_entities': 
                setDoctypeName('Юридические лица');
                break;
            case 'premises':
                setDoctypeName('Помещения');
                break;
            case 'tasks':
                setDoctypeName('Задачи обслуживания');
                break;
            case 'task_schedules':
                setDoctypeName('Планы обслуживания');
                break;

            default:
                setDoctypeName(event.target.value)
                break;
        }
        // setDoctypeName(event.target.selectedOptions[0].text)
    }
    function handleSelectRole(event: any) {
        setRoleId(event.target.value);
        setRoleName(event.target.selectedOptions[0].text);
    }
    function handleSelectTenant(event: any) {
        setTenantId(event.target.value);
        setTenantName(event.target.selectedOptions[0].text);
    }
    return (
        <div className="flex items-center p-4">
            <form
                action={() => { createDocRolePermission(doctype, doctypeName, roleId, roleName, tenantId, tenantName); setDoctype(''); }}
                // '00000000-0000-0000-0000-000000000000'
                className="flex gap-2">
                <div className="flex-2 flex items-center">
                    <select
                        id="selectDoctype"
                        name="doctype"
                        className="w-full h-10 cursor-pointer rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-blue-300"
                        defaultValue=""
                        onChange={(e) => handleSelectDoctype(e)}
                    >
                        <option value="" disabled>
                            Тип документа
                        </option>
                        {props.doctypes.map((doctype) => (
                            <option key={doctype.table_name} value={doctype.table_name}>
                                {doctype.table_name}
                            </option>
                        ))}
                    </select>
                    {/* <input
                        id="doctype-name" onChange={(e) => handleChangeDoctype(e)} defaultValue={doctype} type="text"
                        className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-blue-300"
                        placeholder='Тип документа'
                    /> */}
                </div>
                <div className="flex-3 flex items-center">
                    <select
                        id="selectRole"
                        name="roleId"
                        className="w-full h-10 cursor-pointer rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-blue-300"
                        defaultValue=""
                        onChange={(e) => handleSelectRole(e)}
                    >
                        <option value="" disabled>
                            Роль
                        </option>
                        {props.roles.map((role) => (
                            <option key={role.id} value={role.id}>
                                {role.name}
                            </option>
                        ))}
                    </select>

                </div>
                <div className="flex-2 flex items-center">
                    <select
                        id="selectTenant"
                        name="tenantId"
                        className="w-full h-10 cursor-pointer rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-blue-300"
                        defaultValue=""
                        onChange={(e) => handleSelectTenant(e)}
                    >
                        <option value="" disabled>
                            Организация
                        </option>
                        {props.tenants.map((tenant) => (
                            <option key={tenant.id} value={tenant.id}>
                                {tenant.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex-2">
                    <button
                        className="bg-blue-500 text-white w-full h-10 rounded-md border border-transparent px-3 py-2 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                    >
                        <div className="flex items-center justify-center h-full">
                            <span className="hidden md:block">Новый</span>{' '}
                            <PlusIcon className="h-5 md:ml-4" />
                        </div>
                    </button>
                </div>
            </form>
        </div>
    );
}
