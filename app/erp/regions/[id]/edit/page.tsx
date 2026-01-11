
// LegalEntity Page

import RegionEditForm from "./region-edit-form";
import { fetchRegionForm } from "../../lib/region-actions";
import { RegionForm, User } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { fetchSectionById, fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { auth, getUser } from "@/auth";
import { getCurrentSections, tryLockRecord, unlockRecord, getFeshRecord } from "@/app/lib/common-actions";
import { fetchAllTags } from "@/app/lib/tags/tags-actions";
// import { stringify } from "querystring";
import pool from "@/db";
import DocWrapper from "@/app/lib/doc-wrapper";
import { fetchDocUserPermissions } from "@/app/admin/permissions/lib/permissios-actions";
import { checkReadonly } from "@/app/lib/common-utils";
import NotAuthorized from "@/app/lib/not_authorized";

async function Page(props: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const session_user = session ? session.user : null;
    if (!session_user || !session_user.email) return (<h3 className="text-xs font-medium text-gray-400">Вы не авторизованы!</h3>);

    const email = session_user.email;
    const user = await getUser(email as string);
    if (!user) return (<h3 className="text-xs font-medium text-gray-400">Вы не авторизованы!</h3>);
    const userPermissions = await fetchDocUserPermissions(user?.id as string, 'regions');
    if (!(userPermissions.full_access
        || userPermissions.editor
        || userPermissions.author
        || userPermissions.reader)) {
        return <NotAuthorized />
    }
    const pageUser = user ? user : {} as User;

    const current_sections = await getCurrentSections(email as string);

    const params = await props.params;
    const id = params.id;

    const region: RegionForm = await fetchRegionForm(id, current_sections);
    if (!region) {
        return (<h3 className="text-xs font-medium text-gray-400">Not found! id: {id}</h3>);
    }
    const sections = await fetchSectionsForm(current_sections);
    const tenant_id = (await fetchSectionById(region.section_id)).tenant_id;

    //#region Lock Document
    const readonly_permission = checkReadonly(userPermissions, region, pageUser.id);
    // Пытаемся захватить документ, если имеем права на изменение
    const isEditable =
        !readonly_permission &&
        (region.editing_by_user_id === null ||
            region.editing_by_user_id === user.id ||
            (region.editing_since && new Date(region.editing_since) < new Date(Date.now() - 30 * 60 * 1000)));

    let canEdit = false;
    if (isEditable) {
        const lockResult = await tryLockRecord('regions', region.id, user.id);
        canEdit = lockResult.isEditable;
    } else {
        canEdit = false;
    }
    // Перечитываем запись после возможного обновления блокировки
    const freshRecord = !readonly_permission
        ? await getFeshRecord('regions', region.id)
        : { editing_by_user_id: '', editing_by_user_email: '', };

    const editingByCurrentUser = freshRecord.editing_by_user_id === user.id;
    const readonly = readonly_permission ? readonly_permission : !editingByCurrentUser;
    //#endregion
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Регион</h1>
            </div>
            <h3 className="text-xs font-medium text-gray-400">id: {id}</h3>
            <div className="flex w-full items-center justify-between">
                {readonly && <span className="text-xs font-medium text-gray-400">Только чтение для пользователя: {user?.email}</span>}
                {!readonly && <span className="text-xs font-medium text-gray-400">Права на изменение для пользователя: {user?.email} id:{user?.id}</span>}
                {(!readonly_permission && !editingByCurrentUser) && <span className="text-xs font-medium text-gray-400">    Редактируется пользователем: {freshRecord.editing_by_user_email}</span>}
            </div>
            <DocWrapper
                pageUser={pageUser}
                userSections={sections}
                userPermissions={userPermissions}
                docTenantId={tenant_id}
            >
                <RegionEditForm
                    region={region}
                    lockedByUserId={freshRecord.editing_by_user_id}
                    unlockAction={unlockRecord}
                    readonly={readonly}
                />
            </DocWrapper>
        </div>

    );
}

export default Page;
