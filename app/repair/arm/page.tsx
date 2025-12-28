import TabsPage from "./tabs-page";
import { getCurrentSectionsArray } from "@/app/lib/common-actions";
import { auth } from "@/auth";

export default async function Page() {
    const session = await auth();
    const session_user = session ? session.user : null;
    if (!session_user || !session_user.email) return (<h3 className="text-xs font-medium text-gray-400">Вы не авторизованы!</h3>);

    const email = session_user.email;
    const current_sections_array = await getCurrentSectionsArray(email as string);
    return (
        <TabsPage current_sections_array={current_sections_array}/>
    );
}