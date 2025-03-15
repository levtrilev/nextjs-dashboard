
import InputForm from "./inputForm";
import { fetchTenants } from "@/app/lib/data";
import { Tenant, SectionForm } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { fetchSectionById } from "../lib/actions";

async function Page({ params }: { params: any }) {
    const { id } = await params;
    const tenants = await fetchTenants();
    const section: SectionForm = await fetchSectionById(id as string);

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Section</h1>
            </div>
            <h3>id: {id}</h3>
            <InputForm section={section} tenants={tenants}></InputForm>
        </div>
    );
}

export default Page;
