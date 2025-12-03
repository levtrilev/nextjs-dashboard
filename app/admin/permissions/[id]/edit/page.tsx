
// Role edit page

import { Permission, RoleForm, User } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { getCurrentSections } from "@/app/lib/common-actions";
import { fetchTenantsAdmin, fetchTenantsSuperadmin } from "@/app/admin/tenants/lib/tenants-actions";
import { auth, getUser } from "@/auth";
import { fetchDoctypes, fetchPermission } from "../../lib/permissios-actions";
import PermissionEditForm from "./permission-edit-form";
import { fetchRolesFormSuperadmin } from "../../../roles/lib/roles-actions";

async function Page(props: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const email = session ? (session.user ? session.user.email : "") : "";
    const current_sections = await getCurrentSections(email as string);
    const user = await getUser(email as string);
    const isSuperadmin = user?.is_superadmin;
    const isAdmin = user?.is_admin;

    const params = await props.params;
    const id = params.id;
    const permission: Permission = await fetchPermission(id);
    const doctypes: { table_name: string }[] = await fetchDoctypes();
    const roles: RoleForm[] = await fetchRolesFormSuperadmin();

    const tenants = isSuperadmin ? await fetchTenantsSuperadmin() : await fetchTenantsAdmin(permission.tenant_id);
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Полномочия Роли при работе с Типом документа</h1>
            </div>
            <h3 className="text-xs font-medium text-gray-400">id: {id}</h3>
            <PermissionEditForm permission={permission} doctypes={doctypes} tenants={tenants} roles={roles} />
        </div>

    );
}

export default Page;
