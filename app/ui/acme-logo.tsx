import { GlobeAltIcon, FolderPlusIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

export default function AcmeLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
    >
      <FolderPlusIcon className="h-12 w-12 rotate-[15deg]" />
      <div className="flex flex-col gap-y-1 items-left">
        <p className="text-[22px]">нафиг</p>
        <p className="text-[44px]">ERP</p>
      </div>
    </div>
  );
}
