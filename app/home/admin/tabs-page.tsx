'use client';
import TabsSection from "./tabs-section";
import { useState } from "react";
import { NewUser } from "@/app/ui/adm/users/newUser";
import { DeleteUser } from "@/app/ui/adm/users/deleteUser";
import UsersTable from "@/app/ui/adm/users/table";
import { Tenant, User, Section } from '@/app/lib/definitions';
import SectionsTable from "@/app/ui/adm/sections/table";
import { NewSection } from "@/app/ui/adm/sections/newSection";
import TenantsTable from "@/app/ui/adm/tenants/tenantsTable";
import { NewTenant } from "@/app/ui/adm/tenants/newTenant";
import DeleteTenant from "@/app/ui/adm/tenants/deleteTenant"
import DeleteSection from "@/app/ui/adm/sections/deleteSection";

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