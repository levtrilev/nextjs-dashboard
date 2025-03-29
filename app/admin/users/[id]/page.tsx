
import InputForm from "./inputForm";
import { fetchUserById } from "../lib/actions";
import { Tenant, User, UserForm } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { fetchTenants } from "../../tenants/lib/actions";
import { fetchRolesForm } from "../../roles/lib/actions";
import { getUserRoles } from "@/app/lib/actions";

async function Page({ params }: { params: any }) {
    const { id } = await params;
    const tenants: Tenant[] = await fetchTenants();
    const user: UserForm = await fetchUserById(id as string);
    const user_roles = await getUserRoles(id);
    const roles = await fetchRolesForm();

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>User</h1>
            </div>
            <h3>id: {id}</h3>
            <InputForm user={user} tenants={tenants} user_roles={user_roles} roles={roles}></InputForm>
        </div>
    );
}

export default Page;
