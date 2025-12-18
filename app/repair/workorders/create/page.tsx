// Workorder create Page

import { fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { auth, getUser } from "@/auth";
import { getCurrentSections } from "@/app/lib/common-actions";
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { checkReadonly, formatDateForInput } from "@/app/lib/common-utils";
import DocWrapper from "@/app/lib/doc-wrapper";
import { fetchDocUserPermissions } from "@/app/admin/permissions/lib/permissios-actions";
import { WorkorderForm } from "@/app/lib/definitions";
import WorkorderEditForm from "../[id]/edit/workorder-edit-form";
import { fetchClaimsForm } from "../../claims/lib/claims-actions";

export default async function Page() {
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
  const userPermissions = await fetchDocUserPermissions(user.id as string, 'workorders');
  const readonly_locked = false;
  //#endregion

  const workorder: WorkorderForm = {
    id: "",
    name: "",
    claim_id: "",
    claim_name: "",
    claim_machine_id: "",
    claim_machine_name: "",
    username: "",
    date_created: new Date(),
    schedule_owner_name: "",
    section_id: "",
    section_name: "",
    premise_id: "",
    premise_name: "",
    tenant_id: "",
    author_id: "",
    editor_id: "",
    editing_since: "",
    editing_by_user_id: "",
  } as WorkorderForm;

  const readonly_permission = checkReadonly(userPermissions, workorder, pageUser.id);
  const readonly = readonly_locked || readonly_permission;
  const claims = readonly ? [] : await fetchClaimsForm(current_sections);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Наряды', href: '/repair/workorders' },
          {
            label: 'Создать новый',
            href: '/repair/workorders/create',
            active: true,
          },
        ]}
      />
      <div className="flex w-full items-center justify-between">
        {readonly && <span className="text-xs font-medium text-gray-400">только чтение для пользователя: {user?.email}</span>}
        {!readonly && <span className="text-xs font-medium text-gray-400">права на изменение для пользователя: {user?.email}</span>}
      </div>
      <DocWrapper
        pageUser={pageUser}
        userSections={sections}
        userPermissions={userPermissions}
        docTenantId={tenant_id}
      >
        <WorkorderEditForm
          workorder={workorder}
          lockedByUserId={null}
          unlockAction={null}
          readonly={readonly}
          claims={claims}
        />
      </DocWrapper>
    </main>
  );
}