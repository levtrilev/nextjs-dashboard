'use server';
import UsersTable from "./lib/table";
import { User, Tenant } from '@/app/lib/definitions';
import { NewUser } from "./lib/newUser";
import { lusitana } from "@/app/ui/fonts";
import { fetchUsers } from "./lib/actions";
import { fetchTenants } from "../tenants/lib/actions";

async function Page() {
    const users: User[] = await fetchUsers();
    const tenants: Tenant[] = await fetchTenants();

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Пользователи</h1>
            </div>
            <NewUser tenants={tenants} />
            <UsersTable users={users} />
        </div>
    );
}

export default Page;