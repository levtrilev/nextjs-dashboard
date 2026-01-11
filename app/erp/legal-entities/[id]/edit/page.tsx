
// LegalEntity Page

import LegalEntitiesEditForm from "./le-edit-form";
import { fetchLegalEntityForm } from "../../lib/le-actions";
import { LegalEntityForm, User } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { fetchRegions } from "@/app/erp/regions/lib/region-actions";
import { fetchSectionById, fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { auth, getUser } from "@/auth";
import { getCurrentSections, getFeshRecord, tryLockRecord, unlockRecord } from "@/app/lib/common-actions";
import { fetchAllTags } from "@/app/lib/tags/tags-actions";
import DocWrapper from "@/app/lib/doc-wrapper";
import { fetchDocUserPermissions } from "@/app/admin/permissions/lib/permissios-actions";
import NotAuthorized from "@/app/lib/not_authorized";
import { checkReadonly } from "@/app/lib/common-utils";

async function Page(props: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const session_user = session ? session.user : null;
    if (!session_user || !session_user.email) return (<h3 className="text-xs font-medium text-gray-400">Вы не авторизованы!</h3>);

    const email = session_user.email;
    const user = await getUser(email as string);
    if (!user) return (<h3 className="text-xs font-medium text-gray-400">Вы не авторизованы!</h3>);
    const userPermissions = await fetchDocUserPermissions(user?.id as string, 'legal_entities');
    if (!(userPermissions.full_access
        || userPermissions.editor
        || userPermissions.author
        || userPermissions.reader)) {
        return <NotAuthorized />
    }
    const pageUser = user ? user : {} as User;

    const current_sections = await getCurrentSections(email as string);

    const regions = await fetchRegions(current_sections);
    const sections = await fetchSectionsForm(current_sections);

    const params = await props.params;
    const id = params.id;

    const legalEntity: LegalEntityForm = await fetchLegalEntityForm(id, current_sections);
    if (!legalEntity) {
        return (<h3 className="text-xs font-medium text-gray-400">Not found! id: {id}</h3>);
    }
    const tenant_id = (await fetchSectionById(legalEntity.section_id)).tenant_id;

    //#region Lock Document
    const readonly_permission = checkReadonly(userPermissions, legalEntity, pageUser.id);
    // Пытаемся захватить документ, если имеем права на изменение
    const isEditable =
        !readonly_permission &&
        (legalEntity.editing_by_user_id === null ||
            legalEntity.editing_by_user_id === user.id ||
            (legalEntity.editing_since && new Date(legalEntity.editing_since) < new Date(Date.now() - 30 * 60 * 1000)));

    let canEdit = false;
    if (isEditable) {
        const lockResult = await tryLockRecord('legal_entities', legalEntity.id, user.id);
        canEdit = lockResult.isEditable;
    } else {
        canEdit = false;
    }
    // Перечитываем запись после возможного обновления блокировки
    const freshRecord = !readonly_permission
        ? await getFeshRecord('legal_entities', legalEntity.id)
        : { editing_by_user_id: '', editing_by_user_email: '', };

    const editingByCurrentUser = freshRecord.editing_by_user_id === user.id;
    const readonly = readonly_permission ? readonly_permission : !editingByCurrentUser;
    //#endregion
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Юридическое лицо</h1>
                {readonly && (
                    <span className="text-xs font-medium text-gray-400">
                        только чтение для пользователя: {user?.email}
                    </span>
                )}
                {!readonly && (
                    <span className="text-xs font-medium text-gray-400">
                        права на изменение для пользователя: {user?.email}
                    </span>
                )}
                {(!readonly_permission && !editingByCurrentUser) && (
                    <span className="text-xs font-medium text-gray-400">
                        &nbsp;&nbsp;&nbsp;Редактируется пользователем: {freshRecord.editing_by_user_email}
                    </span>
                )}
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
                    unlockAction={unlockRecord}
                    readonly={readonly}
                />
            </DocWrapper>

        </div>

    );
}

export default Page;
