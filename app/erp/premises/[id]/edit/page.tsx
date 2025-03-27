
// LegalEntity Page

import EditForm from "./editForm";
import { fetchPremise, fetchPremiseForm } from "../../lib/actions";
import { Region, PremiseForm } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { fetchSectionsForm } from "@/app/admin/sections/lib/actions";
import { fetchRegionsForm } from "@/app/erp/regions/lib/actions";
import PremiseEditForm from "./editForm";
import { fetchLegalEntities } from "@/app/erp/legal-entities/lib/actions";
import { current } from "@reduxjs/toolkit";
import { auth } from "@/auth";
import { getCurrentSections } from "@/app/lib/actions";

async function Page(props: { params: Promise<{ id: string }> }) {

    const params = await props.params;
    const id = params.id;
    // console.log("id: " + id);

    const session = await auth();
    const email = session ? (session.user ? session.user.email : "") : "";
    const current_sections = await getCurrentSections(email as string);
    const premise: PremiseForm = await fetchPremiseForm(id);
        if (!premise) {
            return (<h3 className="text-xs font-medium text-gray-400">Not found! id: {id}</h3>);
        }
    const sections = await fetchSectionsForm();
    const regions = await fetchRegionsForm();
    const legalEntities = await fetchLegalEntities(current_sections);
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Помещение</h1>
            </div>
            <h3 className="text-xs font-medium text-gray-400">id: {id}</h3>
            <PremiseEditForm 
            premise={premise} 
            sections={sections} 
            regions={regions}
            legalEntities={legalEntities}
            />
        </div>

    );
}

export default Page;
