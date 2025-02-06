
import InputForm from "./inputForm";
import { fetchUserById, fetchTenants } from "@/app/lib/data";
import { User, UserForm } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";

async function Page({ params }: { params: any }) {
    const { userId } = await params;
    const tenants = await fetchTenants();
    const user: UserForm = await fetchUserById(userId as string);

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>User</h1>
            </div>
            <h3>id: {userId}</h3>
            <InputForm user={user} tenants={tenants}></InputForm>
        </div>
    );
}

export default Page;
