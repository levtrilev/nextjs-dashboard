'use server';
import { fetchTenants, fetchUsers } from "@/app/lib/data";
import UsersTable from "@/app/ui/adm/users/table";
import { User, Tenant } from '@/app/lib/definitions';
import { NewUser } from "@/app/ui/adm/users/new-user";

async function Page() {
    const users: User[] = await fetchUsers();
    const tenants: Tenant[] = await fetchTenants();

    return (
        <>
            <NewUser tenants={tenants}/>
            <UsersTable users={users} />
        </>
    );
}

export default Page;