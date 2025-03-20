'use server';
import { Section, Tenant } from "@/app/lib/definitions";
// import { fetchTenants } from "@/app/lib/data";
import { NewSection } from "./lib/newSection";
import SectionsTable from "./lib/table";
import { lusitana } from "@/app/ui/fonts";
import { fetchSections } from "./lib/actions";
import { fetchTenants } from "../tenants/lib/actions";

async function Page() {
    const sections: Section[] = await fetchSections();
    const tenants: Tenant[] = await fetchTenants();

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Разделы</h1>
            </div>
            <NewSection tenants={tenants} />
            <SectionsTable sections={sections} />
        </div>
    );
}

export default Page;