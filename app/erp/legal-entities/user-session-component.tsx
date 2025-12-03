// 'use client';

import { useSelector } from "react-redux";
import { userSessionSlice, UserSessionState } from "@/app/lib/features/userSession/userSessionSlice";
import LegalEntitiesTable from "./lib/le-table";

export const UserSessionComponent = ({
    query,
    currentPage,
}: {
    query: string;
    currentPage: number;
}) => {

    const current_sections = useSelector(userSessionSlice.selectors.selectCurrentSections);

    return <LegalEntitiesTable query={query} currentPage={currentPage} current_sections={current_sections} />;
};

export default UserSessionComponent;