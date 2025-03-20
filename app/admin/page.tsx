// import { fetchUsers } from '../lib/actions';
import { fetchSections } from './sections/lib/actions';
import TabsPage from "./tabs-page";
import { fetchTenants } from './tenants/lib/actions';
import { fetchUsers } from './users/lib/actions';
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