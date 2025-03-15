'use client';
import TabsSection from "./tabs-section";
import { useState } from "react";
import { NewUser } from "@/app/ui/admin/users/newUser";
import { DeleteUser } from "@/app/ui/admin/users/deleteUser";
import UsersTable from "@/app/ui/admin/users/table";
import { Tenant, User, Section } from '@/app/lib/definitions';
import TenantsTable from "@/app/ui/admin/tenants/tenantsTable";
import { NewTenant } from "@/app/ui/admin/tenants/newTenant";
import DeleteTenant from "@/app/ui/admin/tenants/deleteTenant"
import { NewSection } from "./sections/lib/newSection";
import SectionsTable from "./sections/lib/table";

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