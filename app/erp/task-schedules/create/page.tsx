
//TaskSchedule create Page

import TaskScheduleEditForm from "../[id]/edit/tsch-edit-form";
import { TaskScheduleForm, User } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { fetchLegalEntities, fetchLegalEntitiesForm } from "@/app/erp/legal-entities/lib/legal-entities-actions";
import { auth, getUser } from "@/auth";
import { getCurrentSections } from "@/app/lib/common-actions";
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { DateTime } from "next-auth/providers/kakao";
import { formatDateForInput } from "@/app/lib/common-utils";
import { fetchPremisesForm } from "../../premises/lib/premises-actions";
import { fetchTasksForm } from "../../tasks/lib/task-actions";
import DocWrapper from "@/app/lib/doc-wrapper";
import { fetchDocUserPermissions } from "@/app/admin/permissions/lib/permissios-actions";

export default async function Page() {
    const session = await auth();
    const session_user = session ? session.user : null;
    if (!session_user || !session_user.email) return (<h3 className="text-xs font-medium text-gray-400">Вы не авторизованы!</h3>);
    const email = session_user.email;
    const user = await getUser(email as string);
    if (!user) return (<h3 className="text-xs font-medium text-gray-400">Вы не авторизованы!</h3>);
    const pageUser = user ? user : {} as User;
    const current_sections = await getCurrentSections(email as string);

    const tenant_id = pageUser.tenant_id;
    const userPermissions = await fetchDocUserPermissions(user?.id as string, 'task_schedules');


  const tasks = await fetchTasksForm();
  const taskSchedule: TaskScheduleForm = {
    id: "",
    name: "",
    description: "",
    schedule_owner_id: "",
    date: new Date(), //formatDateForInput(new Date()),
    premise_id: "",
    date_start: new Date(),
    date_end: new Date(),
    section_id: "",
    username: "",
    date_created: new Date(), //formatDateForInput(new Date()),
    section_name: "",
    schedule_owner_name: "",
    premise_name: "",


  } as TaskScheduleForm;

  const sections = await fetchSectionsForm(current_sections);
  const premises = await fetchPremisesForm(current_sections);
  const legalEntities = await fetchLegalEntitiesForm(current_sections);
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Планы обслуживания', href: '/erp/task-chedules' },
          {
            label: 'Создать новое',
            href: '/erp/task-chedules/create',
            active: true,
          },
        ]}
      />
      <div className="flex w-full items-center justify-between">
        {/* <h1 className={`${lusitana.className} text-2xl`}>Новое помещение</h1> */}
      </div>
      <DocWrapper
        pageUser={pageUser}
        userSections={sections}
        userPermissions={userPermissions}
        docTenantId={tenant_id}
      >
        <TaskScheduleEditForm
          taskSchedule={taskSchedule}
          premises={premises}
          legalEntities={legalEntities}
          tasks={tasks}
        />
      </DocWrapper>
    </main>
  );
}