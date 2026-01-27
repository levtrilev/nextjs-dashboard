// Operation Page

import { lusitana } from "@/app/ui/fonts";
import { auth, getUser } from "@/auth";
import { getCurrentSections, getFeshRecord, tryLockRecord, unlockRecord } from "@/app/lib/common-actions";
import DocWrapper from "@/app/lib/doc-wrapper";
import { fetchDocUserPermissions } from "@/app/admin/permissions/lib/permissios-actions";
import { fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { checkReadonly } from "@/app/lib/common-utils";
import { OperationForm } from "@/app/lib/definitions";
import { fetchOperationForm } from "../../lib/operations-actions";
import OperationEditForm from "./operation-edit-form";
import { fetchWorksForm } from "@/app/repair/works/lib/works-actions";
import NotAuthorized, { isUserAuthorized } from "@/app/lib/not_authorized";

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
  const userPermissions = await fetchDocUserPermissions(user.id, 'operations');
  if (!isUserAuthorized(userPermissions, pageUser)) {
    return <NotAuthorized />
  }
  const params = await props.params;
  const id = params.id;
  //#endregion

  const operation: OperationForm = await fetchOperationForm(id, current_sections);
  if (!operation) {
    return <h3 className="text-xs font-medium text-gray-400">Not found! id: {id}</h3>;
  }

  //#region Lock Document
  // const isEditable =
  //   operation.editing_by_user_id === null ||
  //   operation.editing_by_user_id === user.id ||
  //   (operation.editing_since && new Date(operation.editing_since) < new Date(Date.now() - 30 * 60 * 1000));

  // let canEdit = false;
  // if (isEditable) {
  //   const lockResult = await tryLockRecord("operations", operation.id, user.id);
  //   canEdit = lockResult.isEditable;
  // } else {
  //   canEdit = false;
  // }

  // // Перечитываем запись после возможного обновления блокировки
  // const freshRecord = await getFeshRecord("operations", operation.id);

  // const editingByCurrentUser = freshRecord.editing_by_user_id === user.id;
  // const readonly_locked = !editingByCurrentUser;
  //#endregion
  // const readonly_permission = checkReadonly(userPermissions, operation, pageUser.id);
  // const readonly = readonly_locked || readonly_permission;

    //#region Lock Document
    const readonly_permission = checkReadonly(userPermissions, operation, pageUser.id);
    // Пытаемся захватить документ, если имеем права на изменение
    const isEditable =
        !readonly_permission &&
        (operation.editing_by_user_id === null ||
            operation.editing_by_user_id === user.id ||
            (operation.editing_since && new Date(operation.editing_since) < new Date(Date.now() - 30 * 60 * 1000)));

    let canEdit = false;
    if (isEditable) {
        const lockResult = await tryLockRecord('operations', operation.id, user.id);
        canEdit = lockResult.isEditable;
    } else {
        canEdit = false;
    }
    // Перечитываем запись после возможного обновления блокировки
    const freshRecord = !readonly_permission
        ? await getFeshRecord('operations', operation.id)
        : { editing_by_user_id: '', editing_by_user_email: '', };

    const editingByCurrentUser = freshRecord.editing_by_user_id === user.id;
    const readonly = readonly_permission ? readonly_permission : !editingByCurrentUser;
    //#endregion

  const works = readonly ? [] : await fetchWorksForm(current_sections);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Операция</h1>
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
        {!readonly && !editingByCurrentUser && freshRecord.editing_by_user_email && (
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
        <OperationEditForm
          operation={operation}
          lockedByUserId={freshRecord.editing_by_user_id}
          unlockAction={unlockRecord}
          readonly={readonly}
          works={works}
        />
      </DocWrapper>
    </div>
  );
}

export default Page;