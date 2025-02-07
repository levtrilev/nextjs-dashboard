'use server';
import { Section, Tenant } from "@/app/lib/definitions";
import { fetchSections, fetchTenants } from "@/app/lib/data";
import { NewSection } from "@/app/ui/adm/sections/newSection";
import SectionsTable from "@/app/ui/adm/sections/table";
import { lusitana } from "@/app/ui/fonts";

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