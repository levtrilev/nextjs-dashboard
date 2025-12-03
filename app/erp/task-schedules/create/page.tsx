
//TaskSchedule create Page

import TaskScheduleEditForm from "../[id]/edit/tsch-edit-form";
import { TaskScheduleForm } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { fetchLegalEntities } from "@/app/erp/legal-entities/lib/le-actions";
import { auth } from "@/auth";
import { getCurrentSections } from "@/app/lib/common-actions";
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { DateTime } from "next-auth/providers/kakao";
import { formatDateForInput } from "@/app/lib/common-utils";
import { fetchPremisesForm } from "../../premises/lib/premises-actions";
import { fetchTasksForm } from "../../tasks/lib/task-actions";

export default async function Page() {
  const session = await auth();
  const email = session ? (session.user ? session.user.email : "") : "";
  const current_sections = await getCurrentSections(email as string);
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
  const legalEntities = await fetchLegalEntities(current_sections);
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
      <TaskScheduleEditForm
        taskSchedule={taskSchedule}
        sections={sections}
        premises={premises}
        legalEntities={legalEntities}
        tasks={tasks}
      />
    </main>
  );
}