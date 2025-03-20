'use server';
import TenantsTable from "./lib/tenantsTable";
import { Tenant } from "@/app/lib/definitions";
import { fetchTenants } from "./lib/actions";
import { NewTenant } from "./lib/newTenant";
import { lusitana } from "@/app/ui/fonts";
import TenantsTestTable from "./lib/TenantsTestTable";

async function Page() {
    const tenants: Tenant[] = await fetchTenants();

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Организации</h1>
            </div>
            <NewTenant />
            <TenantsTable tenants={tenants} />
            {/* <TenantsTestTable /> */}
        </div>
    );
}

export default Page;