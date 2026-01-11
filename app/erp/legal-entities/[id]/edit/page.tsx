
// LegalEntity Page

import LegalEntitiesEditForm from "./le-edit-form";
import { fetchLegalEntityForm } from "../../lib/le-actions";
import { LegalEntityForm, User } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { fetchRegions } from "@/app/erp/regions/lib/region-actions";
import { fetchSectionById, fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { auth, getUser } from "@/auth";
import { getCurrentSections } from "@/app/lib/common-actions";
import { fetchAllTags } from "@/app/lib/tags/tags-actions";
import DocWrapper from "@/app/lib/doc-wrapper";
import { fetchDocUserPermissions } from "@/app/admin/permissions/lib/permissios-actions";
import NotAuthorized from "@/app/lib/not_authorized";
// import { useSelector } from "react-redux";
// import { userSessionSlice, UserSessionState } from "@/app/lib/features/userSession/userSessionSlice";

async function Page(props: { params: Promise<{ id: string }> }) {

    const session = await auth();
    const email = session ? (session.user ? session.user.email : "") : "";
    const user = await getUser(email as string);
    const pageUser = user ? user : {} as User;

    const current_sections = await getCurrentSections(email as string);
    // const current_sections = useSelector((state: { userSession: UserSessionState }) => userSessionSlice.selectors.selectCurrentSections(state));

    const regions = await fetchRegions(current_sections);
    const sections = await fetchSectionsForm(current_sections);
    const userPermissions = await fetchDocUserPermissions(user?.id as string, 'legal_entities');
        if (!(userPermissions.full_access
            || userPermissions.editor
            || userPermissions.author
            || userPermissions.reader)) {
            return <NotAuthorized />
        }
    const params = await props.params;
    const id = params.id;
    // console.log("current_sections: " + current_sections);

    // const legalEntity: LegalEntity = await fetchLegalEntity(id);
    const legalEntity: LegalEntityForm = await fetchLegalEntityForm(id, current_sections);
    if (!legalEntity) {
        return (<h3 className="text-xs font-medium text-gray-400">Not found! id: {id}</h3>);
    }
    const tenant_id = (await fetchSectionById(legalEntity.section_id)).tenant_id;
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Юридическое лицо</h1>
            </div>
            <h3 className="text-xs font-medium text-gray-400">id: {id}</h3>
            <DocWrapper
                pageUser={pageUser}
                userSections={sections}
                userPermissions={userPermissions}
                docTenantId={tenant_id}
            >
                <LegalEntitiesEditForm
                    legalEntity={legalEntity}
                    regions={regions}
                    // sections={sections}
                    // allTags={allTags}
                    // tenant_id={tenant_id}
                    readonly={false}
                />
            </DocWrapper>

        </div>

    );
}

export default Page;
