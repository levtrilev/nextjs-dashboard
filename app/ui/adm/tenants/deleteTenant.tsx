'use client';

import { TrashIcon } from '@heroicons/react/24/outline';
import { FaceSmileIcon } from '@heroicons/react/20/solid';
import { deleteTenant } from '../../../lib/actions';
import { useState } from 'react';

export default function DeleteTenant() {
  const [tenantToDelete, changeTenantToDelete] = useState<string>("");
  function handleChangeName(event: any) {
    changeTenantToDelete(event.target.value);
  }
  return (
    <div className="flex items-center p-4">
      <form action={() => deleteTenant(tenantToDelete)} className="flex space-x-2">
        <div className="flex-2">
          <input
            id="delete-tenant" onChange={(e) => handleChangeName(e)} defaultValue={tenantToDelete} type="text"
            className=" w-full rounded-md border p-2 hover:bg-gray-100" placeholder='Tenant to delete'
          />
        </div>
        <div className="flex-2">
          <button
            className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-100 hover:text-gray-500"
          >
            {/* <span className="sr-only">Delete User </span>
          <TrashIcon className="w-5" /> */}
            Delete Tenant
          </button>
        </div>
      </form>
    </div>
  );
}
