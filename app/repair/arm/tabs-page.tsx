'use client';

import TabsSelectUnits from "./tabs-select-units";
import TabsStatus from "./tabs-status";
import GoNextButton from "./go-next-button";
import { Section } from "@/app/lib/definitions";
import { useTabsStore } from "./tabsStore";
import { useDocumentStore } from "@/app/store/useDocumentStore";
import { useEffect } from "react";


interface ITabsPageProps {
    current_sections_array: Section[]
}
export const ArmTabsPage: React.FC<ITabsPageProps> = (props: ITabsPageProps) => {
    // export const TabsPage: React.FC = () => {
    const userSections = props.current_sections_array;
    const { isSelected, tabs, statusTab, _hasHydrated, setIsSelected, addTab,
        deleteTab, setStatusTab, dropTabs, setEffectiveSections, setHasHydrated } = useTabsStore();

    const handleSetStatusTab = (value: string) => {
        setStatusTab(value);
    };
    const handleGoNextClick = () => {
        setIsSelected(true);
        const tab_ids = userSections
            .filter(section => tabs.includes(section.name))
            .map(section => section.id);
        setEffectiveSections(tab_ids);
        // dropTabs();
    };
    const object_records = unitsGroupByObject(userSections);
    
    // После первого рендера (на клиенте) — помечаем, что можно рендерить
    useEffect(() => {
        // Это сработает после того, как Zustand применит персистентное состояние
        setHasHydrated();
    }, [setHasHydrated]);

    // Показываем "загрузку" или ничего, пока состояние не загружено
    if (!_hasHydrated) {
        return null; // <div>Loading...</div>;
    }
    return (
        <div className="w-full">
            {!isSelected &&
                <>
                    <TabsSelectUnits
                        onAddTab={addTab}
                        onDeleteTab={deleteTab}
                        activeTabs={tabs}
                        object_records={object_records} />
                    <GoNextButton onClick={() => { handleGoNextClick() }} />
                    {/* <GoNextButton onClick={() => { setIsSelected(true); }} /> */}
                </>
            }
            {isSelected && <TabsStatus onClick={handleSetStatusTab} activeStatusTab={statusTab} onUpClick={() => setIsSelected(false)} />}
        </div>
    );
}

export default ArmTabsPage;

function unitsGroupByObject(section: Section[]): { object: string; units: { id: string, name: string }[]; }[] {
    const grouped: Record<string, { id: string, name: string }[]> = {};

    for (const item of section) {
        const object = item.name.split('-')[0];
        const units = ({ id: item.id, name: item.name.split('-')[1] });
        if (!object || !units) continue; // пропускаем некорректные строки

        if (!grouped[object]) {
            grouped[object] = [];
        }
        grouped[object].push(units);
    }

    return Object.entries(grouped).map(([object, units]) => ({
        object,
        units,
    }));
}