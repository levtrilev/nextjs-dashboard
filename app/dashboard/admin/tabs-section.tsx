'use client';

interface ChildButtonProps {
    onClick: (value: string) => void;
    activeTab: string;
}

const TabsSection: React.FC<ChildButtonProps> = (props: ChildButtonProps) => {

    return (
        <div className="flex items-center p-4">
            <div className="flex-1">
                <button
                    className={(props.activeTab === 'tenants' ? 'bg-blue-400':'bg-blue-200')+' text-white w-full rounded-md border p-2 hover:bg-blue-600'}
                    onClick={() => props.onClick("tenants")}>
                    Tenants
                </button>
            </div>
            <div className="flex-1">
                <button
                    className={(props.activeTab === 'users' ? 'bg-blue-400':'bg-blue-200')+' text-white w-full rounded-md border p-2 hover:bg-blue-500'}
                    onClick={() => props.onClick("users")}>
                    Users
                </button>
            </div>
            <div className="flex-1">
                <button
                    className={(props.activeTab === 'sections' ? 'bg-blue-400':'bg-blue-200')+' text-white w-full rounded-md border p-2 hover:bg-blue-500'}
                    onClick={() => props.onClick("sections")}>
                    Sections
                </button>
            </div>
        </div>
    );
}

export default TabsSection;