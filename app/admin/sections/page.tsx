
// sections Page

'use server';
import { Section, Tenant, User } from "@/app/lib/definitions";
import { NewSection } from "./lib/newSection";
import SectionsTable from "./lib/sections-table";
import { lusitana } from "@/app/ui/fonts";
import { fetchSectionsForm, fetchSectionsFormAdmin, fetchSectionsFormSuperadmin } from "./lib/sections-actions";
import { fetchTenantsAdmin, fetchTenantsSuperadmin } from "../tenants/lib/tenants-actions";
import { auth, getUser } from "@/auth";
import { getCurrentSections } from "@/app/lib/actions";


async function Page() {

    const session = await auth();
    const email = session ? (session.user ? session.user.email : "") : "";
    const current_sections = await getCurrentSections(email as string);
    const current_user = await getUser(email as string) as User;
    const isSuperadmin = current_user.is_superadmin;
    const isAdmin = current_user.is_admin;

    const sections = isSuperadmin ? await fetchSectionsFormSuperadmin()
        : isAdmin ? await fetchSectionsFormAdmin(current_user.tenant_id)
            : await fetchSectionsForm(current_sections);
    const tenants = isSuperadmin ? await fetchTenantsSuperadmin() : await fetchTenantsAdmin(current_user.tenant_id);

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Разделы</h1>
            </div>
            {/* { (isSuperadmin || isAdmin) && <NewSection tenants={tenants} /> } */}
            <SectionsTable sections={sections} admin={ isSuperadmin || isAdmin } tenants={tenants}/>
        </div>
    );
}

export default Page;