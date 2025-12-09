
// LegalEntity Page

import { fetchPremiseForm } from "../../lib/premises-actions";
import { PremiseForm } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { fetchSectionById, fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { fetchRegionsForm } from "@/app/erp/regions/lib/region-actions";
import PremiseEditForm from "./premise-edit-form";
import { fetchLegalEntities } from "@/app/erp/legal-entities/lib/le-actions";
// import { current } from "@reduxjs/toolkit";
import { auth, getUser } from "@/auth";
import { getCurrentSections } from "@/app/lib/common-actions";
// import { fetchAllTags } from "@/app/lib/tags/tags-actions";
import { fetchDocUserPermissions } from "@/app/admin/permissions/lib/permissios-actions";

async function Page(props: { params: Promise<{ id: string }> }) {

    const params = await props.params;
    const id = params.id;
    // console.log("id: " + id);

    const session = await auth();
    const session_user = session ? session.user : null;
    const email = session_user ? session_user.email : "";
    const current_sections = await getCurrentSections(email as string);

    const premise: PremiseForm = await fetchPremiseForm(id, current_sections);
    if (!premise) {
        return (<h3 className="text-xs font-medium text-gray-400">Not found! id: {id}</h3>);
    }
    const sections = await fetchSectionsForm(current_sections);
    const regions = await fetchRegionsForm(current_sections);
    const legalEntities = await fetchLegalEntities(current_sections);
    const tenant_id = (await fetchSectionById(premise.section_id)).tenant_id;
    const user = await getUser(email as string);
    const userPermissions = await fetchDocUserPermissions(user?.id as string, 'premises');
    const readonly =   userPermissions.full_access ? false
                        : userPermissions.editor ? false
                            : (userPermissions.author && premise.author_id === user?.id) ? false
                                : userPermissions.reader ? true
                                    : true;
    console.log(`user: ${email}; id: ${user?.id as string}; doctype: premises; userPermissions: ${JSON.stringify(userPermissions)}`);
    // const allTags = await fetchAllTags(tenant_id);
    // console.log("premise tenant: " + (await fetchSectionById(premise.section_id)).tenant_name);
    // console.log("premise allTags: " + JSON.stringify(allTags));
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Помещение</h1>
                {readonly && <span className="text-xs font-medium text-gray-400">только чтение для пользователя: {user?.email}</span>}
            </div>
            <h3 className="text-xs font-medium text-gray-400">id: {id}</h3>
            <PremiseEditForm
                premise={premise}
                userPermissions={userPermissions}
                user_id={user?.id as string}
                readonly={readonly}
                sections={sections}
                regions={regions}
                legalEntities={legalEntities}
                tenant_id={tenant_id}
            />
        </div>

    );
}

export default Page;
