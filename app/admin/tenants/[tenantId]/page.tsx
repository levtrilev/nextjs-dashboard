
import InputForm from "./inputForm";
import { fetchTenantById } from "@/app/lib/data";
import { Tenant } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";

async function Page({ params }: { params: any }) {

    const { tenantId } = await params;
    const tenant: Tenant = await fetchTenantById(tenantId as string);
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Tenant</h1>
            </div>
            <h3>id: {tenantId}</h3>
            <InputForm tenant={tenant}></InputForm>
        </div>

    );
}

export default Page;
