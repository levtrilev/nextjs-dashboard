
// LegalEntity Page

import RegionEditForm from "./region-edit-form";
import { fetchRegionForm, tryLockRecord, unlockRecord } from "../../lib/region-actions";
import { RegionForm, User } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { fetchSectionById, fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { auth, getUser } from "@/auth";
import { getCurrentSections } from "@/app/lib/common-actions";
import { fetchAllTags } from "@/app/lib/tags/tags-actions";
// import { stringify } from "querystring";
import pool from "@/db";
import DocWrapper from "@/app/lib/doc-wrapper";
import { fetchDocUserPermissions } from "@/app/admin/permissions/lib/permissios-actions";

async function Page(props: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const session_user = session ? session.user : null;
    if (!session_user || !session_user.email) return (<h3 className="text-xs font-medium text-gray-400">Вы не авторизованы!</h3>);

    const email = session_user.email;
    const user = await getUser(email as string);
    if (!user) return (<h3 className="text-xs font-medium text-gray-400">Вы не авторизованы!</h3>);
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
    const userPermissions = await fetchDocUserPermissions(user?.id as string, 'regions');

    // const allTags = await fetchAllTags(tenant_id);
    // console.log("region tenant: " + (await fetchSectionById(region.section_id)).tenant_name);
    // console.log("region tenant: " + JSON.stringify(allTags));

    // Проверяем, кто редактирует
    const isEditable =
        region.editing_by_user_id === null ||
        region.editing_by_user_id === user.id ||
        (region.editing_since && new Date(region.editing_since) < new Date(Date.now() - 30 * 60 * 1000));
    // Если текущий пользователь — не владелец блокировки, не пытаемся её захватить
    // Но если он может редактировать — захватываем блокировку
    let canEdit = false;
    if (isEditable) {
        const lockResult = await tryLockRecord(region.id, user.id);
        canEdit = lockResult.isEditable;
    } else {
        canEdit = false;
    }
    // Перечитаем запись после возможного обновления блокировки
    const freshRecordRes = await pool.query(
        `SELECT regions.editing_by_user_id, users.email as editing_by_user_email
        FROM regions 
        LEFT JOIN users on regions.editing_by_user_id = users.id 
        WHERE regions.id = $1`
        , [region.id]);
    const freshRecord = freshRecordRes.rows[0];

    const editingByCurrentUser = freshRecord.editing_by_user_id === user.id;
    const readonly = !editingByCurrentUser;
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Регион</h1>
            </div>
            <h3 className="text-xs font-medium text-gray-400">id: {id}</h3>
            <div className="flex w-full items-center justify-between">
                {readonly && <span className="text-xs font-medium text-gray-400">Только чтение для пользователя: {user?.email}</span>}
                {!readonly && <span className="text-xs font-medium text-gray-400">Права на изменение для пользователя: {user?.email} id:{user?.id}</span>}
                {!editingByCurrentUser && <span className="text-xs font-medium text-gray-400">    Редактируется пользователем: {freshRecord.editing_by_user_email}</span>}
            </div>
            <DocWrapper
                pageUser={pageUser}
                userSections={sections}
                userPermissions={userPermissions}
                docTenantId={tenant_id}
            >
                <RegionEditForm
                    region={region}
                    // allTags={allTags}
                    lockedByUserId={freshRecord.editing_by_user_id}
                    unlockAction={unlockRecord}
                    readonly={readonly}
                />
            </DocWrapper>
        </div>

    );
}

export default Page;
