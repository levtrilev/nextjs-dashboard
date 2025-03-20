
import { fetchRole } from "../../lib/actions";
import { Role } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import EditForm from "./editForm";

async function Page(props: { params: Promise<{ id: string }> }) {

    const params = await props.params;
    const id = params.id;
    const role: Role = await fetchRole(id);
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Роль</h1>
            </div>
            <h3 className="text-xs font-medium text-gray-400">id: {id}</h3>
            <EditForm role={role}></EditForm>
        </div>

    );
}

export default Page;
