
// LegalEntities Page

import { fetchLegalEntities, fetchLegalEntitiesPages } from "./lib/actions";
import Pagination from "@/app/ui/pagination";
import LegalEntitiesTable from "@/app/erp/legal-entities/lib/table";
import Search from "@/app/ui/search";
import { CreateLegalEntity } from "@/app/erp/legal-entities/lib/buttons";
import { lusitana } from "@/app/ui/fonts";
import { auth } from "@/auth";
import { getCurrentSections } from "@/app/lib/actions";
import UserSessionComponent from "./userSessionComponent";

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {

  const  session = await auth();
  const email = session ? (session.user? session.user.email : "") : "";
  const current_sections = await getCurrentSections(email as string);


  console.log("current_sections: " + current_sections);

  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchLegalEntitiesPages(query, current_sections);

  // const customers = await fetchCustomers();
  const legalEntities = await fetchLegalEntities(current_sections);
  return (
    <>
      {/* <Counter /> */}
      <div className="w-full">
        <div className="flex w-full items-center justify-between">
          <h1 className={`${lusitana.className} text-2xl`}>Юридические лица</h1>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
          <Search placeholder="Найти юридическое лицо..." />
          <CreateLegalEntity />
        </div>

        <LegalEntitiesTable query={query} currentPage={currentPage} current_sections={current_sections}/>
        {/* <UserSessionComponent query={query} currentPage={currentPage} /> */}
        <div className="mt-5 flex w-full justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </>
  );
}


