
//TaskSchedule create Page

import { TaskForm, TaskScheduleForm } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { fetchLegalEntities } from "@/app/erp/legal-entities/lib/le-actions";
import { auth } from "@/auth";
import { getCurrentSections } from "@/app/lib/common-actions";
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { DateTime } from "next-auth/providers/kakao";
import { formatDateForInput } from "@/app/lib/common-utils";
import { fetchPremisesForm } from "../../premises/lib/premises-actions";
import TaskEditForm from "../[id]/edit/task-edit-form";
import { fetchTaskSchedulesForm } from "../../task-schedules/lib/tsch-actions";

export default async function Page() {

  const task: TaskForm = {
    id: "",
    name: "",
    task_schedule_id: "",
    date_start: new Date(),
    date_end: new Date(),
    is_periodic: false,
    period_days: null,
    username: "",
    date_created: new Date(), //formatDateForInput(new Date()),
    schedule_owner_name: "",


  } as TaskForm;
  const session = await auth();
  const email = session ? (session.user ? session.user.email : "") : "";
  const current_sections = await getCurrentSections(email as string);
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
      <TaskEditForm
        task={task}
        taskSchedules={taskSchedules}
      />
    </main>
  );
}