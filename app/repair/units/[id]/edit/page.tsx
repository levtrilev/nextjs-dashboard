// Unit Edit Page

import { lusitana } from "@/app/ui/fonts";
import { auth, getUser } from "@/auth";
import { getCurrentSections, getFeshRecord, tryLockRecord, unlockRecord } from "@/app/lib/common-actions";
import DocWrapper from "@/app/lib/doc-wrapper";
import { fetchDocUserPermissions } from "@/app/admin/permissions/lib/permissios-actions";
import pool from "@/db";
import { fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { checkReadonly } from "@/app/lib/common-utils";
import { UnitForm } from "@/app/lib/definitions";
import { fetchUnitForm } from "../../lib/units-actions";
import UnitEditForm from "./unit-edit-form";
import { fetchObjectsForm } from "@/app/repair/objects/lib/objects-actions";
import NotAuthorized from "@/app/lib/not_authorized";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const session_user = session?.user;
  if (!session_user?.email) return <h3 className="text-xs font-medium text-gray-400">Вы не авторизованы!</h3>;

  const email = session_user.email;
  const user = await getUser(email);
  if (!user) return <h3 className="text-xs font-medium text-gray-400">Вы не авторизованы!</h3>;

  const params = await props.params;
  const id = params.id;

  const current_sections = await getCurrentSections(email);
  const sections = await fetchSectionsForm(current_sections);
  const tenant_id = user.tenant_id;
  const userPermissions = await fetchDocUserPermissions(user.id, 'units');
  if (!(userPermissions.full_access
    || userPermissions.editor
    || userPermissions.author
    || userPermissions.reader)) {
    return <NotAuthorized />
  }
  const unit: UnitForm = await fetchUnitForm(id, current_sections);
  if (!unit) {
    return <h3 className="text-xs font-medium text-gray-400">Not found! id: {id}</h3>;
  }

  // Lock logic
  const isEditable =
    unit.editing_by_user_id === null ||
    unit.editing_by_user_id === user.id ||
    (unit.editing_since && new Date(unit.editing_since) < new Date(Date.now() - 30 * 60 * 1000));

  let canEdit = false;
  if (isEditable) {
    // const lockResult = await tryLockRecord(unit.id, user.id);
    const lockResult = await tryLockRecord('units', unit.id, user.id);
    // const lockResult = await unlockRecord('units', unit.id, user.id);
    canEdit = lockResult.isEditable;
  }

  const freshRecord = await getFeshRecord("units", unit.id);

  const editingByCurrentUser = freshRecord.editing_by_user_id === user.id;
  const readonly_locked = !editingByCurrentUser;
  const readonly_permission = checkReadonly(userPermissions, unit, user.id);
  const readonly = readonly_locked || readonly_permission;

  const objects = readonly ? [] : await fetchObjectsForm(current_sections);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Участок</h1>
        {readonly && <span className="text-xs font-medium text-gray-400">только чтение для пользователя: {user.email}</span>}
        {!readonly && <span className="text-xs font-medium text-gray-400">права на изменение для пользователя: {user.email}</span>}
        {!editingByCurrentUser && (
          <span className="text-xs font-medium text-gray-400">
            &nbsp;&nbsp;&nbsp;Редактируется пользователем: {freshRecord.editing_by_user_email}
          </span>
        )}
      </div>
      <h3 className="text-xs font-medium text-gray-400">id: {id}</h3>

      <DocWrapper
        pageUser={user}
        userSections={sections}
        userPermissions={userPermissions}
        docTenantId={tenant_id}
      >
        <UnitEditForm
          unit={unit}
          objects={objects}
          lockedByUserId={freshRecord.editing_by_user_id}
          unlockAction={unlockRecord}
          readonly={readonly}
        />
      </DocWrapper>
    </div>
  );
}