'use server';
import TenantsTable from "@/app/ui/adm/tenants/tenantsTable";
import { Tenant } from "@/app/lib/definitions";
import { fetchTenants } from "@/app/lib/data";
import { NewTenant } from "@/app/ui/adm/tenants/newTenant";

async function Page() {
    const tenants: Tenant[] = await fetchTenants();

    return (
        <>
            <NewTenant />
            <TenantsTable tenants={tenants} />
        </>
    );
}

export default Page;