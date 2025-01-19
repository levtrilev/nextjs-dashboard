'use client';
import TabsSection from "./tabs-section";
import { useState } from "react";
import { NewUser } from "@/app/ui/users/new-user";
import { DeleteUser } from "@/app/ui/users/delete-user";
import UsersTable from "@/app/ui/users/table";
import { Tenant, User, Section } from '@/app/lib/definitions';
import SectionsTable from "@/app/ui/sections/table";
import { NewSection } from "@/app/ui/sections/new-section";
import TenantsTable from "@/app/ui/tenants/table";
import { NewTenant } from "@/app/ui/tenants/new-tenant";
import { DeleteTenant } from "@/app/ui/tenants/delete-tenant";
import { DeleteSection } from "@/app/ui/sections/delete-section";

interface ITabsPageProps {
    tenants: Tenant[],
    users: User[],
    sections: Section[],
}
export const TabsPage: React.FC<ITabsPageProps> = (props: ITabsPageProps) => {
    // export default function TabsPage() {
    const [tab, setTab] = useState<string>('users');
    const handleSetTab = (value: string) => {
        setTab(value);
        // alert('Tab:' + value);
        // console.log('Tab:' + value);
    };
    return (
        <>
            <TabsSection onClick={handleSetTab} activeTab={tab} />
            {tab === "tenants" &&
                <>
                    <NewTenant />
                    <DeleteTenant />
                    <TenantsTable tenants={props.tenants} />
                </>
            }
            {(tab === null || tab === 'users') &&
                <>
                    <NewUser tenants={props.tenants} />
                    <DeleteUser />
                    <UsersTable users={props.users} />
                </>
            }
            {tab === 'sections' &&
                <>
                    <NewSection tenants={props.tenants} />
                    <DeleteSection tenants={props.tenants} />
                    <SectionsTable sections={props.sections} />
                </>
            }
        </>
    );
}

export default TabsPage;