'use client';

import { Section } from "@/app/lib/definitions";

interface ChildButtonProps {
    onAddTab: (value: string) => void;
    onDeleteTab: (value: string) => void;
    activeTabs: string[];
    object_records: {
        object: string;
        units: { id: string, name: string }[];
    }[];
}
function TabsSelectUnits(props: ChildButtonProps) {

    return (
        <>
            {props.object_records.map((rec) => (
                rec.units.length > 1 && <div key={rec.object}>  {/*Проверяем на > 1, поскольку в каждом объекте кроме разделов участков есть раздел "-общий"*/}
                    <div className="ml-2 flex items-center p-1">
                        Рудник "{rec.object}". Выберите участки:
                    </div>
                    <div className="flex items-center p-1">
                        {rec.units.map(unit => unit.name)
                            .filter(unitName => unitName !== 'общий')
                            .map((unitName) => (
                                <div key={rec.object + '-' + unitName} className="flex-1">
                                    <button
                                        className={`${props.activeTabs.includes(rec.object + '-' + unitName) ? 'bg-blue-400' : 'bg-blue-200'} text-white w-full rounded-md border p-2 hover:bg-blue-500`}
                                        onClick={() => {
                                            if (props.activeTabs.includes(rec.object + '-' + unitName)) {
                                                props.onDeleteTab(rec.object + '-' + unitName);
                                            } else {
                                                props.onAddTab(rec.object + '-' + unitName);
                                                if (!props.activeTabs.includes(rec.object + '-общий')) {
                                                    props.onAddTab(rec.object + '-общий');
                                                }
                                            }
                                        }}
                                    >
                                        {unitName}
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>
            ))}
        </>
    );
}

export default TabsSelectUnits;
