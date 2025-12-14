
// Object Edit Page

import { lusitana } from "@/app/ui/fonts";
import { auth, getUser } from "@/auth";
import { getCurrentSections } from "@/app/lib/common-actions";
import DocWrapper from "@/app/lib/doc-wrapper";
import { fetchDocUserPermissions } from "@/app/admin/permissions/lib/permissios-actions";
import pool from "@/db";
import { fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { checkReadonly } from "@/app/lib/common-utils";
import { ObjectForm } from "@/app/lib/definitions";
import { fetchObjectForm, tryLockRecord, unlockRecord } from "../../lib/objects-actions";
import ObjectEditForm from "./object-edit-form";

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
    const userPermissions = await fetchDocUserPermissions(user.id, 'objects');

    const params = await props.params;
    const id = params.id;
    //    #endregion

    const object: ObjectForm = await fetchObjectForm(id);
    if (!object) {
        return (<h3 className="text-xs font-medium text-gray-400">Not found! id: {id}</h3>);
    }

    //#region Lock Document
    // Проверяем, кто редактирует
    const isEditable =
        object.editing_by_user_id === null ||
        object.editing_by_user_id === user.id ||
        (object.editing_since && new Date(object.editing_since) < new Date(Date.now() - 30 * 60 * 1000));
    // Если текущий пользователь — не владелец блокировки, не пытаемся её захватить
    // Но если он может редактировать — захватываем блокировку
    // console.log("object: ", JSON.stringify(object));
    // console.log("isEditable: ", isEditable);

    let canEdit = false;
    if (isEditable) {
        const lockResult = await tryLockRecord(object.id, user.id);
        canEdit = lockResult.isEditable;
    } else {
        canEdit = false;
    }
    // Перечитаем запись после возможного обновления блокировки
    const freshRecordRes = await pool.query(
        `SELECT objects.editing_by_user_id, users.email as editing_by_user_email
        FROM objects 
        LEFT JOIN users on objects.editing_by_user_id = users.id 
        WHERE objects.id = $1`
        , [object.id]);
    const freshRecord = freshRecordRes.rows[0];

    const editingByCurrentUser = freshRecord.editing_by_user_id === user.id;
    const readonly_locked = !editingByCurrentUser;
    // const readonly_locked = false
    //#endregion
    const readonly_permission = checkReadonly(userPermissions, object, pageUser.id);
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
                <ObjectEditForm
                    object={object}
                    lockedByUserId={freshRecord.editing_by_user_id}
                    unlockAction={unlockRecord}
                    readonly={readonly}
                />
            </DocWrapper>
        </div>
    );
}

export default Page;
