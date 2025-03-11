
import InputForm from "./inputForm";
import { fetchTenantById } from "@/app/lib/data";
import { Tenant } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";

async function Page(props: { params: Promise<{ id: string }> }) {

    const params = await props.params;
    const id = params.id;
    const tenant: Tenant = await fetchTenantById(id);
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Tenant</h1>
            </div>
            <h3 className="text-xs font-medium text-gray-400">id: {id}</h3>
            <InputForm tenant={tenant}></InputForm>
        </div>

    );
}

export default Page;
