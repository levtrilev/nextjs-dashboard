// Claim create Page

import { fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { auth, getUser } from "@/auth";
import { getCurrentSections } from "@/app/lib/common-actions";
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { checkReadonly, formatDateForInput } from "@/app/lib/common-utils";
import DocWrapper from "@/app/lib/doc-wrapper";
import { fetchDocUserPermissions } from "@/app/admin/permissions/lib/permissios-actions";
import { Claim, ClaimForm } from "@/app/lib/definitions";
import ClaimEditForm from "../[id]/edit/claim-edit-form";
import { read } from "fs";
import { fetchMachinesForm } from "../../machines/lib/machines-actions";
import { fetchLocationsForm } from "../../../erp/locations/lib/locations-actions";
import { fetchSystemsForm } from "../../systems/lib/systems-actions";
import { fetchPersonsForm } from "../../../erp/persons/lib/persons-actions";

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
  const userPermissions = await fetchDocUserPermissions(user.id as string, 'claims');
  const readonly_locked = false;
  //#endregion

  const claim: ClaimForm = {
    id: "",
    name: "",
    claim_date: null,
    created_by_person_id: "",
    created_by_person_name: "",
    priority: "низкий",
    machine_id: "",
    machine_name: "",
    location_id: "",
    location_name: "",
    system_id: "00000000-0000-0000-0000-000000000000",
    system_name: "",
    repair_todo: "",
    repair_reason: "",
    breakdown_reasons: "",
    emergency_act: "",
    approved_by_person_id: "00000000-0000-0000-0000-000000000000",
    approved_by_person_name: "",
    // approved_date: "",
    accepted_by_person_id: "00000000-0000-0000-0000-000000000000",
    accepted_by_person_name: "",
    // accepted_date: "",
    hours_plan: "",
    hours_done: "",
    hours_rest: "",
    hours_percent: "",
    username: "",
    date_created: new Date(),
    section_id: "",
    section_name: "",
    tenant_id: "",
    author_id: "",
    editor_id: "",
    editing_since: null,
    editing_by_user_id: null,
    // approved_date, accepted_date, machine_unit_name, machine_machine_status
    access_tags: null,    // Теги доступа:
    user_tags: null, 
  } as ClaimForm;

  const readonly_permission = checkReadonly(userPermissions, claim, pageUser.id);
  const readonly = readonly_locked || readonly_permission;
  const machines = readonly ? [] : await fetchMachinesForm(current_sections);
  const locations = readonly ? [] : await fetchLocationsForm(current_sections);
  const systems = readonly ? [] : await fetchSystemsForm(current_sections);
  const persons = readonly ? [] : await fetchPersonsForm(current_sections);
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Заявки', href: '/repair/claims' },
          {
            label: 'Создать новую',
            href: '/repair/claims/create',
            active: true,
          },
        ]}
      />
      <div className="flex w-full items-center justify-between">
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
      </div>
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
          unlockAction={null}
          readonly={readonly}
        />
      </DocWrapper>
    </main>
  );
}