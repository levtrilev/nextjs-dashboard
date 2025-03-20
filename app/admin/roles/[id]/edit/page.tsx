
import { fetchRole, fetchRoleForm } from "../../lib/actions";
import { Role } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import EditForm from "./editForm";
import { getRoleSections } from "@/app/lib/actions";

async function Page(props: { params: Promise<{ id: string }> }) {

    const params = await props.params;
    const id = params.id;
    const role: {
        id: string;
        name: string;
        description: string;
        tenant_id: string;
        tenant_name: string;
        section_ids: string;
    } = await fetchRoleForm(id);
    const role_sections = await getRoleSections(id);
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Роль</h1>
            </div>
            <h3 className="text-xs font-medium text-gray-400">id: {id}</h3>
            <EditForm role={role} role_sections={role_sections}></EditForm>
        </div>

    );
}

export default Page;
