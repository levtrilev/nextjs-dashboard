'use server';
import { Role } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { RolesTable } from "./lib/rolesTable";
import { fetchRoles } from "./lib/actions";
import { NewRole } from "./lib/newRole";

async function Page() {
    const roles: Role[] = await fetchRoles();

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Роли</h1>
            </div>
            <NewRole />
            <RolesTable roles={roles} />
        </div>
    );
}

export default Page;