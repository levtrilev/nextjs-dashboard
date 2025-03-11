
// LegalEntities Page

import { fetchLegalEntities, fetchLegalEntitiesPages } from "@/app/lib/data";
import { StoreProvider } from "@/app/StoreProvider";
import Pagination from "@/app/ui/pagination";
import CustomersTable from "@/app/ui/legal-entities/table";
import Search from "@/app/ui/search";
import { CreateLegalEntity } from "@/app/ui/legal-entities/buttons";
import { lusitana } from "@/app/ui/fonts";

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchLegalEntitiesPages(query);

    // const customers = await fetchCustomers();
    const legalEntities = await fetchLegalEntities();
    return (
        <StoreProvider>
            {/* <Counter /> */}
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Юридические лица</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
      <Search placeholder="Найти юридическое лицо..." />
        <CreateLegalEntity />
      </div>

            <CustomersTable query={query} currentPage={currentPage} />
       <div className="mt-5 flex w-full justify-center">
         <Pagination totalPages={totalPages} />
       </div>
       </div>
        </StoreProvider>
    );
}

//           <CustomersTable customers={legalEntities as any}/>