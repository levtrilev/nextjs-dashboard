
// section edit Page

import InputForm from "./inputForm";
import { Tenant, SectionForm, User } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { fetchSectionById } from "../lib/sections-actions";
import { fetchTenantsAdmin, fetchTenantsSuperadmin } from "../../tenants/lib/tenants-actions";
import { auth, getUser } from "@/auth";

async function Page({ params }: { params: any }) {
    const session = await auth();
    const email = session ? (session.user ? session.user.email : "") : "";
    // const current_sections = await getCurrentSections(email as string);
    const user = await getUser(email as string) as User;
    const isSuperadmin = user.is_superadmin;
    const isAdmin = user.is_admin;

    const tenants: Tenant[] = isSuperadmin ? await fetchTenantsSuperadmin()
    : await fetchTenantsAdmin(user.tenant_id);

    const { id } = await params;
    // const tenants = await fetchTenants();
    const section: SectionForm = await fetchSectionById(id as string);

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Section</h1>
            </div>
            <h3>id: {id}</h3>
            <InputForm section={section} tenants={tenants} admin={isSuperadmin || isAdmin}></InputForm>
        </div>
    );
}

export default Page;
