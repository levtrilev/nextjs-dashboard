// Workorder Page

import { lusitana } from "@/app/ui/fonts";
import { auth, getUser } from "@/auth";
import { getCurrentSections, getFeshRecord, tryLockRecord, unlockRecord } from "@/app/lib/common-actions";
import DocWrapper from "@/app/lib/doc-wrapper";
import { fetchDocUserPermissions } from "@/app/admin/permissions/lib/permissios-actions";
import { fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { checkReadonly } from "@/app/lib/common-utils";
import { WorkorderForm } from "@/app/lib/definitions";
import WorkorderEditForm from "./workorder-edit-form";
import { fetchWorkorderForm } from "../../lib/workorders-actions";
import { fetchClaimsForm } from "@/app/repair/claims/lib/claims-actions";

async function Page(props: { params: Promise<{ id: string }> }) {
  //#region unified hooks and variables 
  const session = await auth();
  const session_user = session ? session.user : null;
  if (!session_user || !session_user.email) {
    return <h3 className="text-xs font-medium text-gray-400">Вы не авторизованы!</h3>;
  }

  const email = session_user.email;
  const user = await getUser(email as string);
  if (!user) {
    return <h3 className="text-xs font-medium text-gray-400">Вы не авторизованы!</h3>;
  }
  const pageUser = user;

  const current_sections = await getCurrentSections(email as string);
  const sections = await fetchSectionsForm(current_sections);
  const tenant_id = pageUser.tenant_id;
  const userPermissions = await fetchDocUserPermissions(user.id, 'workorders');

  const params = await props.params;
  const id = params.id;
  //#endregion

  const workorder: WorkorderForm = await fetchWorkorderForm(id, current_sections);
  if (!workorder) {
    return <h3 className="text-xs font-medium text-gray-400">Not found! id: {id}</h3>;
  }

  //#region Lock Document
  const isEditable =
    workorder.editing_by_user_id === null ||
    workorder.editing_by_user_id === user.id ||
    (workorder.editing_since && new Date(workorder.editing_since) < new Date(Date.now() - 30 * 60 * 1000));

  let canEdit = false;
  if (isEditable) {
    const lockResult = await tryLockRecord("workorders", workorder.id, user.id);
    canEdit = lockResult.isEditable;
  } else {
    canEdit = false;
  }

  const freshRecord = await getFeshRecord("workorders", workorder.id);

  const editingByCurrentUser = freshRecord.editing_by_user_id === user.id;
  const readonly_locked = !editingByCurrentUser;
  //#endregion

  const readonly_permission = checkReadonly(userPermissions, workorder, pageUser.id);
  const readonly = readonly_locked || readonly_permission;
  const claims = readonly ? [] : await fetchClaimsForm(current_sections);
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Наряд</h1>
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
        {!editingByCurrentUser && freshRecord.editing_by_user_email && (
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
        <WorkorderEditForm
          workorder={workorder}
          lockedByUserId={freshRecord.editing_by_user_id}
          unlockAction={unlockRecord}
          readonly={readonly}
          claims={claims}
        />
      </DocWrapper>
    </div>
  );
}

export default Page;