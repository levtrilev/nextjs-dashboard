// Location Page
'use server';
import { lusitana } from "@/app/ui/fonts";
import { auth, getUser } from "@/auth";
import { getCurrentSections, getFeshRecord, tryLockRecord, unlockRecord } from "@/app/lib/common-actions";
import DocWrapper from "@/app/lib/doc-wrapper";
import { fetchDocUserPermissions } from "@/app/admin/permissions/lib/permissios-actions";
import { fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { checkReadonly } from "@/app/lib/common-utils";
import { LocationForm } from "@/app/lib/definitions";
import { fetchLocationForm } from "../../lib/locations-actions";
import LocationEditForm from "./location-edit-form";
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
  const userPermissions = await fetchDocUserPermissions(user.id, 'locations');
  if (!isUserAuthorized(userPermissions, pageUser)) {
    return <NotAuthorized />
  }
  const params = await props.params;
  const id = params.id;
  //#endregion

  const location: LocationForm = await fetchLocationForm(id, current_sections);
  if (!location) {
    return <h3 className="text-xs font-medium text-gray-400">Not found! id: {id}</h3>;
  }

  //#region Lock Document
  // const isEditable =
  //   location.editing_by_user_id === null ||
  //   location.editing_by_user_id === user.id ||
  //   (location.editing_since && new Date(location.editing_since) < new Date(Date.now() - 30 * 60 * 1000));

  // let canEdit = false;
  // if (isEditable) {
  //   const lockResult = await tryLockRecord("locations", location.id, user.id);
  //   canEdit = lockResult.isEditable;
  // } else {
  //   canEdit = false;
  // }

  // // Перечитываем запись после возможного обновления блокировки
  // const freshRecord = await getFeshRecord("locations", location.id);

  // const editingByCurrentUser = freshRecord.editing_by_user_id === user.id;
  // const readonly_locked = !editingByCurrentUser;
  //#endregion

  // const readonly_permission = checkReadonly(userPermissions, location, pageUser.id);
  // const readonly = readonly_locked || readonly_permission;

  //#region Lock Document
  const readonly_permission = checkReadonly(userPermissions, location, pageUser.id);
  // Пытаемся захватить документ, если имеем права на изменение
  const isEditable =
    !readonly_permission &&
    (location.editing_by_user_id === null ||
      location.editing_by_user_id === user.id ||
      (location.editing_since && new Date(location.editing_since) < new Date(Date.now() - 30 * 60 * 1000)));

  let canEdit = false;
  if (isEditable) {
    const lockResult = await tryLockRecord('locations', location.id, user.id);
    canEdit = lockResult.isEditable;
  } else {
    canEdit = false;
  }
  // Перечитываем запись после возможного обновления блокировки
  const freshRecord = !readonly_permission
    ? await getFeshRecord('locations', location.id)
    : { editing_by_user_id: '', editing_by_user_email: '', };

  const editingByCurrentUser = freshRecord.editing_by_user_id === user.id;
  const readonly = readonly_permission ? readonly_permission : !editingByCurrentUser;
  //#endregion
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Локация</h1>
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
        {(!readonly_permission && !editingByCurrentUser) && freshRecord.editing_by_user_email && (
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
        <LocationEditForm
          location={location}
          lockedByUserId={freshRecord.editing_by_user_id}
          unlockAction={unlockRecord}
          readonly={readonly}
        />
      </DocWrapper>
    </div>
  );
}

export default Page;