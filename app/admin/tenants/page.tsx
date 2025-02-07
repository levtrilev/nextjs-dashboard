'use server';
import TenantsTable from "@/app/ui/adm/tenants/tenantsTable";
import { Tenant } from "@/app/lib/definitions";
import { fetchTenants } from "@/app/lib/data";
import { NewTenant } from "@/app/ui/adm/tenants/newTenant";
import { lusitana } from "@/app/ui/fonts";

async function Page() {
    const tenants: Tenant[] = await fetchTenants();

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Организации</h1>
            </div>
            <NewTenant />
            <TenantsTable tenants={tenants} />
        </div>
    );
}

export default Page;