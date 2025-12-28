'use client';

import { ArrowRightIcon, ArrowUpIcon } from "@heroicons/react/16/solid";
import { usePathname, useRouter } from 'next/navigation';

interface ChildButtonProps {
    onClick: (value: string) => void;
    onUpClick: () => void;
    activeStatusTab: string;
}

const TabsStatus: React.FC<ChildButtonProps> = (props: ChildButtonProps) => {
    const router = useRouter();
    const pathname = usePathname(); // текущий путь без query-параметров

    return (
        <div className="flex items-center w-full p-1">
            <div className="w-12">
                <button
                    className={'bg-blue-200 text-white w-12 rounded-md border p-2 hover:bg-blue-500'}
                    onClick={props.onUpClick}>
                    <ArrowUpIcon className="ml-1 mt-1 w-5 h-5 text-white hover:bg-blue-500" />
                </button>
            </div>
            <div className="flex items-center flex-1 p-1">
                <div className="w-30">
                    <button
                        className={(props.activeStatusTab === 'Парк' ? 'bg-blue-600' : 'bg-blue-200') + ' text-white w-full rounded-md border p-2 hover:bg-blue-500'}
                        onClick={() => {
                            props.onClick("Парк");
                            const target = '/repair/machines';
                            if (pathname !== target) {
                                router.push(target);
                            }
                        }}>
                        Парк
                    </button>
                </div>
                <div className="w-30">
                    <button
                        className={(props.activeStatusTab === 'Все норма' ? 'bg-blue-600' : 'bg-blue-200') + ' text-white w-full rounded-md border p-2 hover:bg-blue-500'}
                        onClick={() => {
                            props.onClick("Все норма");
                            const target = '/repair/machines';
                            if (pathname !== target) {
                                router.push(target);
                            }
                        }}>
                        Все норма
                    </button>
                </div>
                <div className="w-30">
                    <button
                        className={(props.activeStatusTab === 'Резерв' ? 'bg-blue-600' : 'bg-blue-200') + ' text-white w-full rounded-md border p-2 hover:bg-blue-500'}
                        onClick={() => {
                            props.onClick("Резерв");
                            const target = '/repair/machines';
                            if (pathname !== target) {
                                router.push(target);
                            }
                        }}>
                        Резерв
                    </button>
                </div>
                <div className="max-w-48">
                    <button
                        className={(props.activeStatusTab === 'заявки в ремонт' ? 'bg-blue-600' : 'bg-blue-200') + ' text-white w-full rounded-md border p-2 hover:bg-blue-500'}
                        onClick={() => {
                            props.onClick("заявки в ремонт");
                            const target = '/repair/claims';
                            if (pathname !== target) {
                                router.push(target);
                            }
                        }}>
                        заявки в ремонт
                    </button>
                </div>
                <div className="max-w-62">
                    <button
                        className={(props.activeStatusTab === 'невыполняемые ремонты' ? 'bg-blue-600' : 'bg-blue-200') + ' text-white w-full rounded-md border p-2 hover:bg-blue-500'}
                        onClick={() => {
                            props.onClick("невыполняемые ремонты");
                            const target = '/repair/workorders';
                            if (pathname !== target) {
                                router.push(target);
                            }
                        }}>
                        невыполняемые ремонты
                    </button>
                </div>
                <div className="w-30">
                    <button
                        className={(props.activeStatusTab === 'Персонал' ? 'bg-blue-600' : 'bg-blue-200') + ' text-white w-full rounded-md border p-2 hover:bg-blue-500'}
                        onClick={() => props.onClick("Персонал")}>
                        Персонал
                    </button>
                </div>
                <div className="max-w-58">
                    <button
                        className={(props.activeStatusTab === 'Выданные запчасти' ? 'bg-blue-600' : 'bg-blue-200') + ' text-white w-full rounded-md border p-2 hover:bg-blue-500'}
                        onClick={() => props.onClick("Выданные запчасти")}>
                        Выданные запчасти
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TabsStatus;