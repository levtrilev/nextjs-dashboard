
// LegalEntities Page

import { fetchLegalEntities, fetchLegalEntitiesPages } from "./lib/le-actions";
import Pagination from "@/app/ui/pagination";
import LegalEntitiesTable from "@/app/erp/legal-entities/lib/le-table";
import Search from "@/app/ui/search";
import { CreateLegalEntity } from "@/app/erp/legal-entities/lib/le-buttons";
import { lusitana } from "@/app/ui/fonts";
import { auth, getUser } from "@/auth";
import { getCurrentSections } from "@/app/lib/common-actions";
import UserSessionComponent from "./user-session-component";
import { fetchDocUserPermissions } from "@/app/admin/permissions/lib/permissios-actions";
import { checkReadonly } from "@/app/lib/common-utils";

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {

  const session = await auth();
  const email = session ? (session.user ? session.user.email : "") : "";
  const current_sections = await getCurrentSections(email as string);


  const user = await getUser(email as string);
  if (!user) {
    return <h3 className="text-xs font-medium text-gray-400">Вы не авторизованы!</h3>;
  }
  const pageUser = user;
  const userPermissions = await fetchDocUserPermissions(user.id, 'legal_entities');
  const legal_entities = {};
  const readonly_permission = checkReadonly(userPermissions, legal_entities, pageUser.id);

  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchLegalEntitiesPages(query, current_sections);

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

        <LegalEntitiesTable
          query={query}
          currentPage={currentPage}
          current_sections={current_sections}
          showDeleteButton={!readonly_permission}
        />
        {/* <UserSessionComponent query={query} currentPage={currentPage} /> */}
        <div className="mt-5 flex w-full justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </>
  );
}


