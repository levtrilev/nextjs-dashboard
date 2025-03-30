
// LegalEntity Page

import EditForm from "./editForm";
import { fetchRegion, fetchRegionForm } from "../../lib/region-actions";
import { Region, RegionForm } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { auth } from "@/auth";
import { getCurrentSections } from "@/app/lib/actions";

async function Page(props: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const email = session ? (session.user ? session.user.email : "") : "";
    const current_sections = await getCurrentSections(email as string);

    const params = await props.params;
    const id = params.id;
    // console.log("id: " + id);
    const region: RegionForm = await fetchRegionForm(id, current_sections);
        if (!region) {
            return (<h3 className="text-xs font-medium text-gray-400">Not found! id: {id}</h3>);
        }
    const sections = await fetchSectionsForm(current_sections);
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Регион</h1>
            </div>
            <h3 className="text-xs font-medium text-gray-400">id: {id}</h3>
            <EditForm region={region} sections={sections}></EditForm>
        </div>

    );
}

export default Page;
