import { ArrowLongRightIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

export default function GoNextButton({onClick}: {onClick: () => void;}) {
    return (
        <div className="mt-2 ml-2 mb-2 flex w-full justify-left">
            <button className="rounded-md border border-gray-200 p-2 h-10 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={onClick}>
                <div className="flex flex-row">
                    <span>Продолжать с выбранными участками</span>
                    <ArrowRightIcon className="ml-2 mt-1 w-5 h-5 text-gray-800" />
                </div>
            </button>
        </div>
    );
}