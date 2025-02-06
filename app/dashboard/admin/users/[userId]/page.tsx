
import InputForm from "./inputForm";
import { fetchUserById, fetchTenants } from "@/app/lib/data";
import { User, UserForm } from "@/app/lib/definitions";

async function Page({ params }:{params:any}) {
const { userId } = await params;
const tenants = await fetchTenants();
const user: UserForm = await fetchUserById(userId as string);

    return (
        <>
            <h3>Edit User page. UserId: {userId}</h3>
            <InputForm user={ user } tenants={ tenants}></InputForm>
        </>
    );
}

export default Page;
