
// LegalEntity Page

import EditForm from "./task-edit-form";
// import { fetchPremise, fetchPremiseForm } from "../../lib/premisesActions";
import { Task, TaskForm } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { current } from "@reduxjs/toolkit";
import { auth } from "@/auth";
import { getCurrentSections } from "@/app/lib/common-actions";
import TaskEditForm from "./task-edit-form";
import { fetchTaskForm, fetchTasksForm } from "../../lib/task-actions";
import { fetchTaskSchedulesForm } from "@/app/erp/task-schedules/lib/tsch-actions";

async function Page(props: { params: Promise<{ id: string }> }) {

    const params = await props.params;
    const id = params.id;
    // console.log("id: " + id);

    const task: TaskForm = await fetchTaskForm(id);
    if (!task) {
        return (<h3 className="text-xs font-medium text-gray-400">Not found! id: {id}</h3>);
    }
    const session = await auth();
    const email = session ? (session.user ? session.user.email : "") : "";
    const current_sections = await getCurrentSections(email as string);
    const taskSchedules = await fetchTaskSchedulesForm(current_sections);

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Задача обслуживания</h1>
            </div>
            <h3 className="text-xs font-medium text-gray-400">id: {id}</h3>
            <TaskEditForm
                task={task}
                taskSchedules={taskSchedules}
            />
        </div>

    );
}

export default Page;
