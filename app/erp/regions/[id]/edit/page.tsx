
// LegalEntity Page

import EditForm from "./region-edit-form";
import { fetchRegion, fetchRegionForm } from "../../lib/region-actions";
import { Region, RegionForm } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { fetchSectionById, fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { auth } from "@/auth";
import { getCurrentSections } from "@/app/lib/common-actions";
import { fetchAllTags } from "@/app/lib/tags/tags-actions";
import { stringify } from "querystring";

async function Page(props: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const email = session ? (session.user ? session.user.email : "") : "";
    const current_sections = await getCurrentSections(email as string);

    const params = await props.params;
    const id = params.id;

    const region: RegionForm = await fetchRegionForm(id, current_sections);
    if (!region) {
        return (<h3 className="text-xs font-medium text-gray-400">Not found! id: {id}</h3>);
    }
    const sections = await fetchSectionsForm(current_sections);
    const tenant_id = (await fetchSectionById(region.section_id)).tenant_id;
    const allTags = await fetchAllTags(tenant_id);
    console.log("region tenant: " + (await fetchSectionById(region.section_id)).tenant_name);
    console.log("region tenant: " + JSON.stringify(allTags));
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Регион</h1>
            </div>
            <h3 className="text-xs font-medium text-gray-400">id: {id}</h3>
            <EditForm region={region} sections={sections} allTags={allTags} tenant_id={tenant_id}></EditForm>
        </div>

    );
}

export default Page;
