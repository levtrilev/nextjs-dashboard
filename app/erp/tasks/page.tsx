
// Tasks Page

import { fetchTasksForm, fetchTasksPages } from "./lib/task-actions";
// import { StoreProvider } from "@/app/StoreProvider";
import Pagination from "@/app/ui/pagination";
import TasksTable from "@/app/erp/tasks/lib/task-table";
import Search from "@/app/ui/search";
import { CreateTask } from "@/app/erp/tasks/lib/task-buttons";
import { lusitana } from "@/app/ui/fonts";
import { auth } from "@/auth";
import { getCurrentSections } from "@/app/lib/actions";

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
    const session = await auth();
    const email = session ? (session.user ? session.user.email : "") : "";
    const current_sections = await getCurrentSections(email as string);

  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchTasksPages(query);

  // const customers = await fetchCustomers();
  // const regions = await fetchRegionsForm();
  return (
    <>
      {/* <Counter /> */}
      <div className="w-full">
        <div className="flex w-full items-center justify-between">
          <h1 className={`${lusitana.className} text-2xl`}>Задачи</h1>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
          <Search placeholder="Найти регион РФ..." />
          <CreateTask />
        </div>

        <TasksTable query={query} currentPage={currentPage} current_sections={current_sections}/>
        <div className="mt-5 flex w-full justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </>
  );
}
