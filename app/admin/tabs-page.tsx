'use client';
import TabsSection from "./tabs-section";
import { useState } from "react";
import { Tenant, User, Section } from '@/app/lib/definitions';
import { NewSection } from "./sections/lib/newSection";
import SectionsTable from "./sections/lib/table";
import { NewTenant } from "./tenants/lib/newTenant";
import TenantsTable from "./tenants/lib/tenantsTable";
import { NewUser } from "./users/lib/newUser";
import UsersTable from "./users/lib/table";

interface ITabsPageProps {
    tenants: Tenant[],
    users: User[],
    sections: Section[],
}
export const TabsPage: React.FC<ITabsPageProps> = (props: ITabsPageProps) => {
    const [tab, setTab] = useState<string>('users');
    const handleSetTab = (value: string) => {
        setTab(value);
    };
    return (
        <>
            <TabsSection onClick={handleSetTab} activeTab={tab} />
            {tab === "tenants" &&
                <>
                    <NewTenant />
                    {/* <DeleteTenant /> */}
                    <TenantsTable tenants={props.tenants} />
                </>
            }
            {(tab === 'users') &&
                <>
                    <NewUser tenants={props.tenants} />
                    {/* <DeleteUser /> */}
                    <UsersTable users={props.users} />
                </>
            }
            {tab === 'sections' &&
                <>
                    <NewSection tenants={props.tenants} />
                    {/* <DeleteSection tenants={props.tenants} /> */}
                    <SectionsTable sections={props.sections} />
                </>
            }
        </>
    );
}

export default TabsPage;