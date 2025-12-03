
// LegalEntity Page

import EditForm from "./tsch-edit-form";
// import { fetchPremise, fetchPremiseForm } from "../../lib/premisesActions";
import { Region, PremiseForm, TaskScheduleForm } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { fetchRegionsForm } from "@/app/erp/regions/lib/region-actions";
import PremiseEditForm from "./tsch-edit-form";
import { fetchLegalEntities } from "@/app/erp/legal-entities/lib/le-actions";
import { current } from "@reduxjs/toolkit";
import { auth } from "@/auth";
import { getCurrentSections } from "@/app/lib/common-actions";
import { fetchPremiseForm, fetchPremisesForm } from "@/app/erp/premises/lib/premises-actions";
import TaskScheduleEditForm from "./tsch-edit-form";
import { fetchTaskScheduleForm } from "../../lib/tsch-actions";
import { fetchScheduleTasksForm, fetchTasksForm } from "@/app/erp/tasks/lib/task-actions";

async function Page(props: { params: Promise<{ id: string }> }) {

    const params = await props.params;
    const id = params.id;
    // console.log("id: " + id);

    const session = await auth();
    const email = session ? (session.user ? session.user.email : "") : "";
    const current_sections = await getCurrentSections(email as string);

    const taskSchedule: TaskScheduleForm = await fetchTaskScheduleForm(id, current_sections);
    if (!taskSchedule) {
        return (<h3 className="text-xs font-medium text-gray-400">Not found! id: {id}</h3>);
    }
    const sections = await fetchSectionsForm(current_sections);
    const premises = await fetchPremisesForm(current_sections);
    const legalEntities = await fetchLegalEntities(current_sections);
    const tasks = await fetchScheduleTasksForm(id);
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>План обслуживания</h1>
            </div>
            <h3 className="text-xs font-medium text-gray-400">id: {id}</h3>
            <TaskScheduleEditForm
                taskSchedule={taskSchedule}
                sections={sections}
                premises={premises}
                legalEntities={legalEntities}
                tasks={tasks}
            />
        </div>

    );
}

export default Page;
