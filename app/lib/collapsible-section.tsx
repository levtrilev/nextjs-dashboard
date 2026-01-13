'use client'; // Обязательно для клиентских компонентов в Next.js 13+

import { useState } from 'react';

interface ICollapsibleSectionProps {
    header: string,
    children: React.ReactNode
}
const CollapsibleSection = (props: ICollapsibleSectionProps) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <div className="border border-gray-300 rounded-lg p-4 max-w-[1300px] ">
            {/* Заголовок, по которому кликаем */}
            <div
                className="cursor-pointer font-semibold text-blue-600 flex items-center"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? '▼' : '▲'} {props.header}
            </div>

            {/* Контент, который сворачивается */}
            <div
                // className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
                //     }`}
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed
                    ? 'max-h-0 opacity-0'
                    : 'max-h-[2000px] opacity-100'
                    }`}
            >
                <div className="mt-2 text-gray-700">
                    {props.children}
                </div>
            </div>
        </div>
    );
};

export default CollapsibleSection;