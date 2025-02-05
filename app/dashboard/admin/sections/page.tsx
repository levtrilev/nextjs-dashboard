'use server';
import { Section, Tenant } from "@/app/lib/definitions";
import { fetchSections, fetchTenants } from "@/app/lib/data";
import { NewSection } from "@/app/ui/adm/sections/new-section";
import SectionsTable from "@/app/ui/adm/sections/table";

async function Page() {
    const sections: Section[] = await fetchSections();
    const tenants: Tenant[] = await fetchTenants();

    return (
        <>
            <NewSection tenants={tenants} />
            <SectionsTable sections={sections} />
        </>
    );
}

export default Page;