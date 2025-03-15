
// LegalEntity Page

import EditForm from "./editForm";
import { fetchLegalEntityForm } from "../../lib/actions";
import { LegalEntityForm } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { fetchRegions } from "@/app/erp/regions/lib/actions";
import { fetchSections, fetchSectionsForm } from "@/app/admin/sections/lib/actions";

async function Page(props: { params: Promise<{ id: string }> }) {

    const regions = await fetchRegions();
    const sections = await fetchSectionsForm();
    const params = await props.params;
    const id = params.id;
    console.log("id: " + id);
    // const legalEntity: LegalEntity = await fetchLegalEntity(id);
    const legalEntity: LegalEntityForm = await fetchLegalEntityForm(id);
        if (!legalEntity) {
            return (<h3 className="text-xs font-medium text-gray-400">Not found! id: {id}</h3>);
        }
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Юридическое лицо</h1>
            </div>
            <h3 className="text-xs font-medium text-gray-400">id: {id}</h3>
            <EditForm legalEntity={legalEntity} regions={regions} sections={sections}></EditForm>
        </div>

    );
}

export default Page;
