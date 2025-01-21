'use client';
import { useState } from 'react';
import { createTenant } from '../../lib/actions';
import { Tenant } from '@/app/lib/definitions';

// interface INewSectionProps {
//   tenants: Tenant[],
// }
export const NewTenant = () => {

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  function handleChangeName(event: any) {
    setName(event.target.value);
  }
    function handleChangeDescription(event: any) {
      setDescription(event.target.value);
  }
  return (
    <div className="flex items-center p-4">
      <form action={() => createTenant(name, description)} className="flex space-x-2">
        <div className="flex-2">
          <input
            id="tenant-name" onChange={(e) => handleChangeName(e)} defaultValue={name} type="text"
            className="w-full rounded-md border p-2 hover:bg-gray-100" placeholder='Tenant name'
          />
        </div>
        <div className="flex-4">
          <input
            id="tenant-description" onChange={(e) => handleChangeDescription(e)} defaultValue={description} type="text"
            className="w-full rounded-md border p-2 hover:bg-gray-100" placeholder='Description'
          />
        </div>
        <div className="flex-2">
          <button
            className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-500"
          >
            Create Tenant
          </button>
        </div>
      </form>
    </div>
  );
}
