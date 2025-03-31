
// roles Page

'use server';
import { RoleForm } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { RolesTable } from "./lib/rolesTable";
import { fetchRolesFormAdmin, fetchRolesFormSuperadmin } from "./lib/roles-actions";
import { NewRole } from "./lib/newRole";
import { auth, getUser } from "@/auth";
import { getUserRoles } from "@/app/lib/actions";
// import { fetchTenants } from "../tenants/lib/actions";

async function Page() {
    const session = await auth();
    const email = session ? (session.user ? session.user.email : "") : "";
    // const current_sections = await getCurrentSections(email as string);
    const user = await getUser(email as string);
    const isSuperadmin = user?.is_superadmin;
    const isAdmin = user?.is_admin;
console.log("user.id: ", user?.id);
    const roles = isSuperadmin ? await fetchRolesFormSuperadmin()
        : isAdmin ? await fetchRolesFormAdmin(user.tenant_id)
            : user ? await getUserRoles(user.id) : [];

    // const roles: RoleForm[] = await fetchRolesForm();
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Роли</h1>
            </div>
            { (isSuperadmin || isAdmin) && <NewRole /> }
            <RolesTable roles={roles} admin={ isSuperadmin || isAdmin }/>
        </div>
    );
}

export default Page;