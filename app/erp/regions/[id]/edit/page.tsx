
// LegalEntity Page

import EditForm from "./editForm";
import { fetchRegion } from "../../lib/actions";
import { Region } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";

async function Page(props: { params: Promise<{ id: string }> }) {

    const params = await props.params;
    const id = params.id;
    console.log("id: " + id);
    const region: Region = await fetchRegion(id);
        if (!region) {
            return (<h3 className="text-xs font-medium text-gray-400">Not found! id: {id}</h3>);
        }
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Регион</h1>
            </div>
            <h3 className="text-xs font-medium text-gray-400">id: {id}</h3>
            <EditForm region={region}></EditForm>
        </div>

    );
}

export default Page;
