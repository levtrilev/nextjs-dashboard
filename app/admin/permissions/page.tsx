
// roles Page

'use server';
import { RoleForm, User } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
// import { NewRole } from "./lib/newRole";
import { auth, getUser } from "@/auth";
import { fetchPermissionsSuperadmin, fetchPermissionsAdmin, fetchDoctypes } from "./lib/permissios-actions";
import PermissionsTable from "./lib/permissions-table";
import { fetchTenantsAdmin, fetchTenantsSuperadmin } from "../tenants/lib/tenants-actions";
import { NewPermission } from "./lib/new-permission";
import { fetchRolesFormSuperadmin } from "../roles/lib/roles-actions";

async function Page() {
    const session = await auth();
    const email = session ? (session.user ? session.user.email : "") : "";
    // const current_sections = await getCurrentSections(email as string);
    const user = await getUser(email as string) as User;
    const isSuperadmin = user.is_superadmin;
    const isAdmin = user.is_admin;
    // console.log("user.id: ", user?.id);
    const permissions = isSuperadmin ? await fetchPermissionsSuperadmin()
        : isAdmin ? await fetchPermissionsAdmin(user.tenant_id) : [];
    //     : user ? await getUserRoles(user.id) : [];
    const tenants = isSuperadmin ? await fetchTenantsSuperadmin() : await fetchTenantsAdmin(user.tenant_id);
    const doctypes: { table_name: string }[] = await fetchDoctypes();
    const roles: RoleForm[] = await fetchRolesFormSuperadmin();
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Роли и полномочия</h1>
            </div>
            {(isSuperadmin || isAdmin) && <NewPermission doctypes={doctypes} tenants={tenants} roles={roles} />}
            <PermissionsTable permissions={permissions} admin={isSuperadmin || isAdmin} />
        </div>
    );
}

export default Page;
