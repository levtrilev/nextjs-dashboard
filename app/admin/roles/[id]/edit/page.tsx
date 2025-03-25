
import { fetchRoleForm, fetchRolesForm } from "../../lib/actions";
import { RoleForm } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import EditForm from "./editForm";
import { getRoleSections } from "@/app/lib/actions";
import { fetchTenants } from "@/app/admin/tenants/lib/actions";
import { fetchSectionsForm } from "@/app/admin/sections/lib/actions";

async function Page(props: { params: Promise<{ id: string }> }) {

    const params = await props.params;
    const id = params.id;
    const role: RoleForm = await fetchRoleForm(id);

    const role_sections = await getRoleSections(id);
    const sections = await fetchSectionsForm();
    const tenants = await fetchTenants();
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Роль</h1>
            </div>
            <h3 className="text-xs font-medium text-gray-400">id: {id}</h3>
            <EditForm role={role} role_sections={role_sections} tenants={tenants} sections={sections}/>
        </div>

    );
}

export default Page;
