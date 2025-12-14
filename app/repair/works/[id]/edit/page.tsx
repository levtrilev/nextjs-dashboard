// Work Edit Page

import { lusitana } from "@/app/ui/fonts";
import { auth, getUser } from "@/auth";
import { getCurrentSections } from "@/app/lib/common-actions";
import DocWrapper from "@/app/lib/doc-wrapper";
import { fetchDocUserPermissions } from "@/app/admin/permissions/lib/permissios-actions";
import pool from "@/db";
import { fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { checkReadonly } from "@/app/lib/common-utils";
import { WorkForm } from "@/app/lib/definitions";
import { fetchWorkForm, tryLockRecord, unlockRecord } from "../../lib/works-actions";
import WorkEditForm from "./work-edit-form";

async function Page(props: { params: Promise<{ id: string }> }) {
    //#region unified hooks and variables 
    const session = await auth();
    const session_user = session ? session.user : null;
    if (!session_user || !session_user.email) return (<h3 className="text-xs font-medium text-gray-400">Вы не авторизованы!</h3>);

    const email = session_user.email;
    const user = await getUser(email as string);
    if (!user) return (<h3 className="text-xs font-medium text-gray-400">Вы не авторизованы!</h3>);
    const pageUser = user;

    const current_sections = await getCurrentSections(email as string);
    const sections = await fetchSectionsForm(current_sections);
    // const tenant_id = (await fetchSectionById(object.section_id)).tenant_id;
    const tenant_id = pageUser.tenant_id;
    const userPermissions = await fetchDocUserPermissions(user.id, 'works');

    const params = await props.params;
    const id = params.id;
    //    #endregion

    const work: WorkForm = await fetchWorkForm(id);
    if (!work) {
        return (<h3 className="text-xs font-medium text-gray-400">Not found! id: {id}</h3>);
    }

    //#region Lock Document
    // Проверяем, кто редактирует
    const isEditable =
        work.editing_by_user_id === null ||
        work.editing_by_user_id === user.id ||
        (work.editing_since && new Date(work.editing_since) < new Date(Date.now() - 30 * 60 * 1000));
    // Если текущий пользователь — не владелец блокировки, не пытаемся её захватить
    // Но если он может редактировать — захватываем блокировку
    // console.log("work: ", JSON.stringify(work));
    // console.log("isEditable: ", isEditable);

    let canEdit = false;
    if (isEditable) {
        const lockResult = await tryLockRecord(work.id, user.id);
        canEdit = lockResult.isEditable;
    } else {
        canEdit = false;
    }
    // Перечитаем запись после возможного обновления блокировки
    const freshRecordRes = await pool.query(
        `SELECT works.editing_by_user_id, users.email as editing_by_user_email
        FROM works 
        LEFT JOIN users on works.editing_by_user_id = users.id 
        WHERE works.id = $1`
        , [work.id]);
    const freshRecord = freshRecordRes.rows[0];

    const editingByCurrentUser = freshRecord.editing_by_user_id === user.id;
    const readonly_locked = !editingByCurrentUser;
    // const readonly_locked = false
    //#endregion
    const readonly_permission = checkReadonly(userPermissions, work, pageUser.id);
    const readonly = readonly_locked || readonly_permission;
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Объект</h1>
                {readonly && <span className="text-xs font-medium text-gray-400">только чтение для пользователя: {user?.email}</span>}
                {!readonly && <span className="text-xs font-medium text-gray-400">права на изменение для пользователя: {user?.email}</span>}
                {!editingByCurrentUser && <span className="text-xs font-medium text-gray-400">    Редактируется пользователем: {freshRecord.editing_by_user_email}</span>}

            </div>
            <h3 className="text-xs font-medium text-gray-400">id: {id}</h3>

            <DocWrapper
                pageUser={pageUser}
                userSections={sections}
                userPermissions={userPermissions}
                docTenantId={tenant_id}
            >
                <WorkEditForm
                    work={work}
                    lockedByUserId={freshRecord.editing_by_user_id}
                    unlockAction={unlockRecord}
                    readonly={readonly}
                />
            </DocWrapper>
        </div>
    );
}

export default Page;