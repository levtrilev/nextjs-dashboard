
// admin Page

import { auth, getUser } from '@/auth';
import { fetchSectionsForm, fetchSectionsFormAdmin, fetchSectionsFormSuperadmin } from './sections/lib/sections-actions';
import TabsPage from "./tabs-page";
import { fetchTenantsAdmin, fetchTenantsSuperadmin } from './tenants/lib/tenants-actions';
import { fetchUsersAdmin, fetchUsersSuperadmin, fetchUsersUser } from './users/lib/users-actions';
import { getCurrentSections } from '../lib/common-actions';
import { User } from '../lib/definitions';
// import { Suspense } from 'react';

export default async function Page() {

    const session = await auth();
    const email = session ? (session.user ? session.user.email : "") : "";
    const current_sections = await getCurrentSections(email as string);
    const current_user = await getUser(email as string) as User;
    const isSuperadmin = current_user.is_superadmin;
    const isAdmin = current_user.is_admin;

    const sections = isSuperadmin ? await fetchSectionsFormSuperadmin()
        : isAdmin ? await fetchSectionsFormAdmin(current_user.tenant_id)
            : await fetchSectionsForm(current_sections);
    const tenants = isSuperadmin ? await fetchTenantsSuperadmin() : await fetchTenantsAdmin(current_user.tenant_id);
    const users = isSuperadmin ? await fetchUsersSuperadmin()
        : isAdmin ? await fetchUsersAdmin(current_user.tenant_id)
            : await fetchUsersUser(email as string);

    // const tenants = await fetchTenants();
    // const users = await fetchUsers();
    // const sections = await fetchSectionsForm(current_sections);
    return (

                <TabsPage
                    tenants={tenants}
                    users={users}
                    sections={sections}
                    isSuperadmin={isSuperadmin}
                    isAdmin={isAdmin}
                />

    );
}