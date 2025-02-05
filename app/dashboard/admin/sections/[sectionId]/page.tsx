
import InputForm from "./inputForm";
import { fetchSectionById, fetchTenants } from "@/app/lib/data";
import { Tenant, SectionForm } from "@/app/lib/definitions";

async function Page({ params }:{params:any}) {
const { sectionId } = await params;
const tenants = await fetchTenants();
const section: SectionForm = await fetchSectionById(sectionId as string);

    return (
        <>
            <h3>Edit Section page. SectionId: {sectionId}</h3>
            <InputForm section={ section } tenants={ tenants}></InputForm>
        </>
    );
}

export default Page;
