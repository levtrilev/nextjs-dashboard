import { fetchTenants, fetchSections, fetchUsers } from '../lib/data';
import TabsPage from "./tabs-page";
// import { Suspense } from 'react';

export default async function Page() {
    const tenants = await fetchTenants();
    const users = await fetchUsers();
    const sections = await fetchSections();
    return (

                <TabsPage
                    tenants={tenants}
                    users={users}
                    sections={sections}
                />

    );
}