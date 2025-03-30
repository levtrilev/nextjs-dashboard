
// Role edit page

import { fetchRoleForm } from "../../lib/roles-actions";
import { RoleForm, User } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import RoleEditForm from "./editForm";
import { getCurrentSections, getRoleSections } from "@/app/lib/actions";
import { fetchTenantsAdmin, fetchTenantsSuperadmin } from "@/app/admin/tenants/lib/tenants-actions";
import { fetchSectionsForm, fetchSectionsFormAdmin, fetchSectionsFormSuperadmin } from "@/app/admin/sections/lib/sections-actions";
import { auth, getUser } from "@/auth";

async function Page(props: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const email = session ? (session.user ? session.user.email : "") : "";
    const current_sections = await getCurrentSections(email as string);
    const user = await getUser(email as string);
    const isSuperadmin = user?.is_superadmin;
    const isAdmin = user?.is_admin;

    const params = await props.params;
    const id = params.id;
    const role: RoleForm = await fetchRoleForm(id);

    const role_sections = await getRoleSections(id);

    const sections = isSuperadmin ? await fetchSectionsFormSuperadmin()
        : isAdmin ? await fetchSectionsFormAdmin(role.tenant_id)
            : await fetchSectionsForm(current_sections);

    const tenants = isSuperadmin ? await fetchTenantsSuperadmin() : await fetchTenantsAdmin(role.tenant_id);
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Роль</h1>
            </div>
            <h3 className="text-xs font-medium text-gray-400">id: {id}</h3>
            <RoleEditForm role={role} role_sections={role_sections} tenants={tenants} sections={sections} />
        </div>

    );
}

export default Page;
