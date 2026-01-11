// NewDocRolePermission

'use client';
import { use, useEffect, useRef, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { RoleForm, Tenant } from '@/app/lib/definitions';
import { createPermission } from './permissios-actions';
import { fetchRole, fetchRoleForm } from '../../roles/lib/roles-actions';
import { useRoles } from '../../roles/lib/store/use-role-store';
import MessageBoxOKCancel from '@/app/lib/message-box-ok-cancel';
import { setIsMessageBoxOpen, setIsShowMessageBoxCancel, setMessageBoxText, useMessageBox } from '@/app/store/useDocumentStore';
// import { addRole } from './store/useRoleStore';
interface INewDocRolePermissionProps {
    doctypes: { table_name: string }[],
    tenants: Tenant[]
}
export const NewPermission = (props: INewDocRolePermissionProps) => {
    const [doctype, setDoctype] = useState<string>("");
    const [doctypeName, setDoctypeName] = useState<string>("");
    const [tenantId, setTenantId] = useState<string>("");
    const [tenantName, setTenantName] = useState<string>("");
    const [roleId, setRoleId] = useState<string>("");
    const [roleName, setRoleName] = useState<string>("");
    const allRoles = useRoles();
    // console.log("allRoles: ", JSON.stringify(allRoles));
    const [roles, setRoles] = useState<RoleForm[]>(allRoles);
    const msgBox = useMessageBox();
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
    async function handleSelectRole(event: React.ChangeEvent<HTMLSelectElement>): Promise<void> {
        const value = event.target.value;
        const selectedOption = event.target.selectedOptions[0];

        setRoleId(value);
        setRoleName(selectedOption?.text || '');

        const role = await fetchRoleForm(value);
        setTenantId(role.tenant_id);
        setTenantName(role.tenant_name);
    }
    function handleSelectTenant(event: any) {
        // roleIdRef.current = event.target.value;
        setTenantId(event.target.value);
        setTenantName(event.target.selectedOptions[0].text);

    }
    useEffect(() => {
        if (tenantId !== '') {
            setRoles(allRoles.filter((role) => role.tenant_id === tenantId));
        } else {
            setRoles(allRoles);
        }
    }, [tenantId]);
    useEffect(
        () => {
            setIsShowMessageBoxCancel(false);
        },
        []
    );

    return (
        <div className="w-full p-4">
            <form
                action={ async () => {
                    try {
                        await createPermission(doctype, doctypeName, roleId, roleName, tenantId, tenantName);
                        setDoctype('');
                    } catch (error) {
                        // console.error("Failed to create DocRolePermission:", error);
                        setMessageBoxText(String(error));
                        setIsMessageBoxOpen(true);
                        setRoles(allRoles);
                        setTenantId('');
                    }

                }}
                className="flex flex-col gap-4 w-full"
            >
                {/* Первая строка: "В Организации" — фикс ширина */}
                <div className="flex items-center w-[300px]">
                    <label htmlFor="selectTenant" className="mr-2 whitespace-nowrap">
                        В Организации:
                    </label>
                    <select
                        id="selectTenant"
                        name="tenantId"
                        className="flex-1 h-10 w-full cursor-pointer rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-blue-300"
                        defaultValue=""
                        onChange={(e) => handleSelectTenant(e)}
                    >
                        <option value="">

                        </option>
                        {props.tenants.map((tenant) => (
                            <option key={tenant.id} value={tenant.id}>
                                {tenant.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Вторая строка */}
                <div className="flex items-center gap-2 w-full">
                    {/* Левый блок — "Роль" — такой же ширины, как первая строка */}
                    <div className="flex items-center w-[300px]">
                        <label htmlFor="role" className="mr-2 whitespace-nowrap">
                            Роль:
                        </label>
                        <select
                            id="role"
                            name="roleId"
                            className="flex-1 h-10 w-full cursor-pointer rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-blue-300"
                            defaultValue=""
                            onChange={(e) => handleSelectRole(e)}
                        >
                            <option value="" disabled>
                                Роль
                            </option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Правая часть: "Тип документа" и кнопка — занимают остаток */}
                    <div className="flex items-center flex-1 gap-2 max-w-[600px]">
                        <div className="flex items-center flex-1">
                            <label htmlFor="doctype" className="mr-2 whitespace-nowrap">
                                Тип документа:
                            </label>
                            <select
                                id="doctype"
                                name="doctype"
                                className="flex-1 h-10 cursor-pointer rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-blue-300"
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
                        </div>

                        <div className="w-24">
                            <button
                                type="submit"
                                className="bg-blue-500 text-white w-full h-10 rounded-md border border-transparent px-3 py-2 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                            >
                                <div className="flex items-center justify-center h-full">
                                    <span className="hidden md:block">Новый</span>
                                    <PlusIcon className="h-5 md:ml-2" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </form>
            <MessageBoxOKCancel />
        </div>
    );
}


