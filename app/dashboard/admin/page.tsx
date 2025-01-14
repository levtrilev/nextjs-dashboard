import { DeleteUser } from "@/app/ui/users/delete-user";
import { NewUser } from '@/app/ui/users/new-user';
import UsersTable from "@/app/ui/users/table";
import { Tenant } from "@/app/lib/definitions";
import { fetchTenants } from '../../lib/data';

export default async function Page() {
    // const tenants:Tenant[] = [{id: '1', name: 'company11'}, {id: '2', name: 'company12'}];
    const tenants = await fetchTenants();
    return (
        <>
            <p>Admin Page</p>
            <NewUser tenants={tenants}/>
            <DeleteUser />
            <UsersTable />
        </>
    );
}