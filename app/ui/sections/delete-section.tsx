'use client';

import { TrashIcon } from '@heroicons/react/24/outline';
import { FaceSmileIcon } from '@heroicons/react/20/solid';
import { deleteSection } from '../../lib/actions';
import { useState } from 'react';
import { Tenant } from '@/app/lib/definitions';

interface IDeleteSectionProps {
  tenants: Tenant[],
}

// export function DeleteSection() {
export const DeleteSection: React.FC<IDeleteSectionProps> = (props: IDeleteSectionProps) => {

  const [sectionToDelete, changeSectionToDelete] = useState<string>("");
  const [tenantId, setTenantId] = useState<string>("");

  function handleChangeName(event: any) {
    changeSectionToDelete(event.target.value);
  }
  function handleSelectTenant(event: any) {
    setTenantId(event.target.value);
  }
  return (
    <div className="flex items-center p-4">
      <form action={() => deleteSection(sectionToDelete, tenantId)} className="flex space-x-2">
        <div className="flex-2">
          <input
            id="delete-section" onChange={(e) => handleChangeName(e)} defaultValue={sectionToDelete} type="text"
            className=" w-full rounded-md border p-2 hover:bg-gray-100" placeholder='Section to delete'
          />
        </div>
        <div className="flex-1">
          <select
            id="selectTenant"
            name="tenantId"
            className="w-full cursor-pointer rounded-md border p-2 hover:bg-gray-100"
            defaultValue=""
            onChange={(e) => handleSelectTenant(e)}
          >
            <option value="" disabled>
              Member of
            </option>
            {props.tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-2">
          <button
            className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-500"
          >
            {/* <span className="sr-only">Delete User </span>
          <TrashIcon className="w-5" /> */}
            Delete Section
          </button>
        </div>
      </form>
    </div>
  );
}
