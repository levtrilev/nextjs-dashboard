
import InputForm from "./inputForm";
import { fetchTenantById } from "@/app/lib/data";
import { Tenant } from "@/app/lib/definitions";

async function Page({ params }:{params:any}) {
const { tenantId } = await params;
const tenant:Tenant = await fetchTenantById(tenantId as string);

    return (
        <>
            <h3>Edit Tenant page. TenantId: {tenantId}</h3>
            <InputForm tenant={tenant}></InputForm>
        </>

    );
}

export default Page;
