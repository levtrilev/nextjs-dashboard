
// LegalEntity Page

import EditForm from "./editForm";
import { fetchLegalEntityForm } from "../../lib/le-actions";
import { LegalEntityForm } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { fetchRegions } from "@/app/erp/regions/lib/region-actions";
import { fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { auth } from "@/auth";
import { getCurrentSections } from "@/app/lib/actions";
// import { useSelector } from "react-redux";
// import { userSessionSlice, UserSessionState } from "@/app/lib/features/userSession/userSessionSlice";

async function Page(props: { params: Promise<{ id: string }> }) {

    const session = await auth();
    const email = session ? (session.user ? session.user.email : "") : "";
    const current_sections = await getCurrentSections(email as string);
    // const current_sections = useSelector((state: { userSession: UserSessionState }) => userSessionSlice.selectors.selectCurrentSections(state));

    const regions = await fetchRegions(current_sections);
    const sections = await fetchSectionsForm(current_sections);
    const params = await props.params;
    const id = params.id;
    // console.log("current_sections: " + current_sections);

    // const legalEntity: LegalEntity = await fetchLegalEntity(id);
    const legalEntity: LegalEntityForm = await fetchLegalEntityForm(id, current_sections);
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
