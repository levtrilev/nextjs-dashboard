import { NewUser, DeleteUser } from "@/app/ui/new-user";
import UsersTable from "@/app/ui/users/table";

export default function Page() {
    return (
        <>
            <p>Admin Page</p>
            <NewUser />
            <DeleteUser />
            <UsersTable />
        </>
    );
}