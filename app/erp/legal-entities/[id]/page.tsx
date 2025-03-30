
// LegalEntity Page

import EditForm from "./edit/editForm";
import { LegalEntity } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { fetchLegalEntity } from "../lib/le-actions";
import { auth } from "@/auth";
import { getCurrentSections } from "@/app/lib/actions";

async function Page(props: { params: Promise<{ id: string }> }) {

    const params = await props.params;
    const id = params.id;
    console.log("id: " + id);

    const session = await auth();
    const email = session ? (session.user ? session.user.email : "") : "";
    const current_sections = await getCurrentSections(email as string);

    const legalEntity: LegalEntity = await fetchLegalEntity(id, current_sections);
    if (!legalEntity) {
        return (<h3 className="text-xs font-medium text-gray-400">Not found! id: {id}</h3>);
    }
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Юридическое лицо</h1>
            </div>
            <h3 className="text-xs font-medium text-gray-400">id: {id}</h3>
            <h3 className="text-xs font-medium text-gray-400">name: {legalEntity?.name}</h3>
            {/* <EditForm legalEntity={legalEntity}></EditForm> */}
        </div>

    );
}

export default Page;
