
// tenant Page

import InputForm from "./inputForm";
import { fetchTenantById } from "../../lib/tenants-actions";
import { Tenant, User } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import TenantsTestTable from "../../lib/TenantsTestTable";
import { auth, getUser } from "@/auth";

async function Page(props: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const email = session ? (session.user ? session.user.email : "") : "";
    // const current_sections = await getCurrentSections(email as string);
    const current_user = await getUser(email as string) as User;
    const isSuperadmin = current_user.is_superadmin;
    const isAdmin = current_user.is_admin;

    const params = await props.params;
    const id = params.id;
    const tenant: Tenant = await fetchTenantById(id);
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Tenant</h1>
            </div>
            <h3 className="text-xs font-medium text-gray-400">id: {id}</h3>
            <InputForm tenant={tenant} admin={ isAdmin || isSuperadmin } />
            <TenantsTestTable />
        </div>

    );
}

export default Page;
