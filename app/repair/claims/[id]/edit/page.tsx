// Claim Edit Page

import { lusitana } from "@/app/ui/fonts";
import { auth, getUser } from "@/auth";
import { getCurrentSections, getFeshRecord, tryLockRecord, unlockRecord } from "@/app/lib/common-actions";
import DocWrapper from "@/app/lib/doc-wrapper";
import { fetchDocUserPermissions } from "@/app/admin/permissions/lib/permissios-actions";
import pool from "@/db";
import { fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { checkReadonly } from "@/app/lib/common-utils";
import { ClaimForm } from "@/app/lib/definitions";
import { fetchClaimForm } from "../../lib/claims-actions";
import ClaimEditForm from "./claim-edit-form";
import { fetchMachinesForm } from "@/app/repair/machines/lib/machines-actions";
import { fetchLocationsForm } from "@/app/erp/locations/lib/locations-actions";
import { fetchSystemsForm } from "@/app/repair/systems/lib/systems-actions";
import { fetchPersonsForm } from "@/app/erp/persons/lib/persons-actions";
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
  const userPermissions = await fetchDocUserPermissions(user.id, 'claims');
  if (!isUserAuthorized(userPermissions, pageUser)) {
    return <NotAuthorized />
  }
  const params = await props.params;
  const id = params.id;
  //#endregion

  const claim: ClaimForm = await fetchClaimForm(id, current_sections);
  if (!claim) {
    return <h3 className="text-xs font-medium text-gray-400">Not found! id: {id}</h3>;
  }

  //#region Lock Document
  // const isEditable =
  //   claim.editing_by_user_id === null ||
  //   claim.editing_by_user_id === user.id ||
  //   (claim.editing_since && new Date(claim.editing_since) < new Date(Date.now() - 30 * 60 * 1000));


  // let canEdit = false;
  // if (isEditable) {
  //   const lockResult = await tryLockRecord('claims', claim.id, user.id);
  //   canEdit = lockResult.isEditable;
  // } else {
  //   canEdit = false;
  // }

  // // Перечитываем запись после возможного обновления блокировки

  // const freshRecord = await getFeshRecord('claims', claim.id);

  // const editingByCurrentUser = freshRecord.editing_by_user_id === user.id;
  // const readonly_locked = !editingByCurrentUser;
  //#endregion

  //#region Lock Document
  const readonly_permission = checkReadonly(userPermissions, claim, pageUser.id);
  // Пытаемся захватить документ, если имеем права на изменение
  const isEditable =
    !readonly_permission &&
    (claim.editing_by_user_id === null ||
      claim.editing_by_user_id === user.id ||
      (claim.editing_since && new Date(claim.editing_since) < new Date(Date.now() - 30 * 60 * 1000)));

  let canEdit = false;
  if (isEditable) {
    const lockResult = await tryLockRecord('claims', claim.id, user.id);
    canEdit = lockResult.isEditable;
  } else {
    canEdit = false;
  }
  // Перечитываем запись после возможного обновления блокировки
  const freshRecord = !readonly_permission
    ? await getFeshRecord('claims', claim.id)
    : { editing_by_user_id: '', editing_by_user_email: '', };

  const editingByCurrentUser = freshRecord.editing_by_user_id === user.id;
  const readonly = readonly_permission ? readonly_permission : !editingByCurrentUser;
  //#endregion

  // const readonly_permission = checkReadonly(userPermissions, claim, pageUser.id);
  // const readonly = readonly_locked || readonly_permission;

  const machines = readonly ? [] : await fetchMachinesForm(current_sections);
  const locations = readonly ? [] : await fetchLocationsForm(current_sections);
  const systems = readonly ? [] : await fetchSystemsForm(current_sections);
  const persons = readonly ? [] : await fetchPersonsForm(current_sections);
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Заявка</h1>
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
        <ClaimEditForm
          claim={claim}
          machines={machines}
          locations={locations}
          systems={systems}
          persons={persons}
          lockedByUserId={null}
          unlockAction={unlockRecord}
          readonly={readonly}
        />
      </DocWrapper>
    </div>
  );
}

export default Page;