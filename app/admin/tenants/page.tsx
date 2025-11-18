
// tenants list Page

'use server';
// import TenantsTable from "./lib/tenants-table";
import TenantsTable from "./lib/tenants-table-zust";
import { Tenant, User } from "@/app/lib/definitions";
import { fetchTenantsAdmin, fetchTenantsSuperadmin } from "./lib/tenants-actions";
import { NewTenant } from "./lib/newTenant";
import { lusitana } from "@/app/ui/fonts";
import { auth, getUser } from "@/auth";

async function Page() {
    const session = await auth();
    const email = session ? (session.user ? session.user.email : "") : "";
    // const current_sections = await getCurrentSections(email as string);
    const user = await getUser(email as string) as User;
    const isSuperadmin = user.is_superadmin;
    const isAdmin = user.is_admin;

    // const tenants: Tenant[] = isSuperadmin ? await fetchTenantsSuperadmin()

    const tenants: Tenant[] = isSuperadmin ? await fetchTenantsSuperadmin()
    : await fetchTenantsAdmin(user.tenant_id);
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Организации</h1>
            </div>
            { isSuperadmin && <NewTenant /> }
            <TenantsTable tenants={tenants} superadmin={isSuperadmin} />
            {/* <TenantsTable superadmin={isSuperadmin} user={user} /> */}
        </div>
    );
}

export default Page;