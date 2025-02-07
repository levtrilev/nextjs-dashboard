
import InputForm from "./inputForm";
import { fetchSectionById, fetchTenants } from "@/app/lib/data";
import { Tenant, SectionForm } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";

async function Page({ params }: { params: any }) {
    const { sectionId } = await params;
    const tenants = await fetchTenants();
    const section: SectionForm = await fetchSectionById(sectionId as string);

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Section</h1>
            </div>
            <h3>id: {sectionId}</h3>
            <InputForm section={section} tenants={tenants}></InputForm>
        </div>
    );
}

export default Page;
