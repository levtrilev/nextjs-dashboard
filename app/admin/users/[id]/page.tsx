
// user Page

import UserEditForm from "./user-edit-form";
import { fetchUserById } from "../lib/users-actions";
import { User, UserForm } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { fetchTenantsAdmin, fetchTenantsSuperadmin } from "../../tenants/lib/tenants-actions";
import { fetchRolesFormAdmin, fetchRolesFormSuperadmin } from "../../roles/lib/roles-actions";
import { getUserRoles } from "@/app/lib/common-actions";
import { auth, getUser } from "@/auth";

async function Page({ params }: { params: any }) {

    const session = await auth();
    const email = session ? (session.user ? session.user.email : "") : "";
    // const current_sections = await getCurrentSections(email as string);
    const current_user = await getUser(email as string) as User;
    const isSuperadmin = current_user.is_superadmin;
    const isAdmin = current_user.is_admin;

    const { id } = await params;
    const user: UserForm = await fetchUserById(id as string);
    const user_roles = await getUserRoles(id);



    const roles = isSuperadmin ? await fetchRolesFormSuperadmin()
        : isAdmin ? await fetchRolesFormAdmin(current_user.tenant_id)
            : [];
    const tenants = isSuperadmin ? await fetchTenantsSuperadmin() : await fetchTenantsAdmin(current_user.tenant_id);

    // const tenants: Tenant[] = await fetchTenants();
    // const roles = await fetchRolesForm();

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>User</h1>
            </div>
            <h3>id: {id}</h3>
            <UserEditForm 
            user={user} 
            tenants={tenants} 
            user_roles={user_roles} 
            roles={roles}
            admin={isSuperadmin || isAdmin}
            />
        </div>
    );
}

export default Page;
