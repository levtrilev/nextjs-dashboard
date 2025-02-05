import TenantsTable from "@/app/ui/adm/tenants/tenantsTable";
import { Tenant } from "@/app/lib/definitions";
import { fetchTenants } from "@/app/lib/data";

async function Page() {
    const tenants:Tenant[] = await fetchTenants();

    if (!tenants) {
        return (<h2>Loading ...</h2>);
      }
      return (
        <TenantsTable tenants={tenants}/>
    );

}

export default Page;