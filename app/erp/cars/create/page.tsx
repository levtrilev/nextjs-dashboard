//Car create Page

import { fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { auth, getUser } from "@/auth";
import { getCurrentSections } from "@/app/lib/common-actions";
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { checkReadonly, formatDateForInput } from "@/app/lib/common-utils";
import DocWrapper from "@/app/lib/doc-wrapper";
import { fetchDocUserPermissions } from "@/app/admin/permissions/lib/permissios-actions";
import { CarForm } from "@/app/lib/definitions";
import { fetchUnitsForm } from "../../units/lib/units-actions";
import { fetchLocationsForm } from "../../locations/lib/locations-actions";
import CarEditForm from "../[id]/edit/car-edit-form";
import { fetchLegalEntitiesForm } from "../../legal-entities/lib/legal-entities-actions";

export default async function Page() {
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
  const userPermissions = await fetchDocUserPermissions(user.id as string, 'cars');
  // const readonly_locked = !editingByCurrentUser;
  const readonly_locked = false
  //    #endregion

  const car: CarForm = {
    id: "",
    name: "",
    unit_id: "00000000-0000-0000-0000-000000000000",
    unit_name: "",
    location_id: "00000000-0000-0000-0000-000000000000",
    location_name: "",
    gos_number: "",
    make: "",
    model: "",
    vin: "",
    year: "",
    customer_id: "00000000-0000-0000-0000-000000000000",
    customer_name: "",
    car_status: "неизвестно",
    username: "",
    date_created: new Date(), //formatDateForInput(new Date()),
    section_id: "00000000-0000-0000-0000-000000000000",
    section_name: "",
    tenant_id: "00000000-0000-0000-0000-000000000000",
    author_id: "00000000-0000-0000-0000-000000000000",
    editor_id: "00000000-0000-0000-0000-000000000000",
    editing_since: "",
    editing_by_user_id: "",
    doc_status: "draft"
  } as CarForm;
  const readonly_permission = checkReadonly(userPermissions, car, pageUser.id);
  const readonly = readonly_locked || readonly_permission;
  const units = readonly ? [] : await fetchUnitsForm(current_sections);
  const locations = readonly ? [] : await fetchLocationsForm(current_sections);
  const customers = readonly ? [] : await fetchLegalEntitiesForm(current_sections);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Машины', href: '/erp/cars' },
          {
            label: 'Создать новую',
            href: '/erp/cars/create',
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
        <CarEditForm
          car={car}
          customers={customers}
          units={units}
          locations={locations}
          lockedByUserId={null}
          unlockAction={null}
          readonly={readonly}
        />
      </DocWrapper>
    </main>
  );
}