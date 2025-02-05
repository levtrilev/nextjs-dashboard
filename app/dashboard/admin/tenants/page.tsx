'use server';
import TenantsTable from "@/app/ui/adm/tenants/tenantsTable";
import { Tenant } from "@/app/lib/definitions";
import { fetchTenants } from "@/app/lib/data";
// import { Suspense } from 'react';

async function Page() {
    const tenants: Tenant[] = await fetchTenants();

    return (
        // <Suspense fallback={<h2>Loading...</h2>}>
            <TenantsTable tenants={tenants} />
        // </Suspense>
    );
}

export default Page;