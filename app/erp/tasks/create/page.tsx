
//Task create Page

import { TaskForm, TaskScheduleForm, User } from "@/app/lib/definitions";
import { fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { auth, getUser } from "@/auth";
import { getCurrentSections } from "@/app/lib/common-actions";
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { checkReadonly, formatDateForInput } from "@/app/lib/common-utils";
import TaskEditForm from "../[id]/edit/task-edit-form";
import { fetchTaskSchedulesForm } from "../../task-schedules/lib/tsch-actions";
import DocWrapper from "@/app/lib/doc-wrapper";
import { fetchDocUserPermissions } from "@/app/admin/permissions/lib/permissios-actions";

export default async function Page() {
  //#region unified hooks and variables 
  const session = await auth();
  const session_user = session ? session.user : null;
  if (!session_user || !session_user.email) return (<h3 className="text-xs font-medium text-gray-400">Вы не авторизованы!</h3>);

  const email = session_user.email;
  const user = await getUser(email as string);
  if (!user) return (<h3 className="text-xs font-medium text-gray-400">Вы не авторизованы!</h3>);
  const pageUser = user ? user : {} as User;

  const current_sections = await getCurrentSections(email as string);
  const sections = await fetchSectionsForm(current_sections);
  // const tenant_id = (await fetchSectionById(task.section_id)).tenant_id;
  const tenant_id = pageUser.tenant_id;
  const userPermissions = await fetchDocUserPermissions(user.id as string, 'tasks');
  // const readonly_locked = !editingByCurrentUser;
  const readonly_locked = false
  //    #endregion

  const task: TaskForm = {
    id: "",
    name: "",
    task_schedule_id: "",
    task_schedule_name: "",
    date_start: new Date(),
    date_end: new Date(),
    is_periodic: false,
    period_days: null,
    username: "",
    date_created: new Date(), //formatDateForInput(new Date()),
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
  } as TaskForm;
  const readonly_permission = checkReadonly(userPermissions, task, pageUser.id);
  const readonly = readonly_locked || readonly_permission;

  const taskSchedules = await fetchTaskSchedulesForm(current_sections);
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Задачи обслуживания', href: '/erp/tasks' },
          {
            label: 'Создать новую',
            href: '/erp/tasks/create',
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
        <TaskEditForm
          task={task}
          taskSchedules={taskSchedules}
          lockedByUserId={null}
          unlockAction={null}
          readonly={readonly}
        />
      </DocWrapper>
    </main>
  );
}