'use client';
import { useState } from 'react';
import { createSection } from '../../lib/actions';
import { Section, Tenant } from '@/app/lib/definitions';

interface INewSectionProps {
  tenants: Tenant[],
}
export const NewSection: React.FC<INewSectionProps> = (props: INewSectionProps) => {

  const [name, setName] = useState<string>("");
  const [tenantId, setTenantId] = useState<string>("");
  function handleChangeName(event: any) {
    setName(event.target.value);
  }
    function handleSelectTenant(event: any) {
    setTenantId(event.target.value);
  }
  return (
    <div className="flex items-center p-4">
      <form action={() => createSection(name, tenantId)} className="flex space-x-2">
        <div className="flex-1">
          <input
            id="section-name" onChange={(e) => handleChangeName(e)} defaultValue={name} type="text"
            className="w-full rounded-md border p-2 hover:bg-gray-100" placeholder='Section name'
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
            className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-100 hover:text-gray-500"
          >
            Create Section
          </button>
        </div>
      </form>
    </div>
  );
}
