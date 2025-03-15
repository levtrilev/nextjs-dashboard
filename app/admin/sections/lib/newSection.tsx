'use client';
import { useState } from 'react';
import { Section, Tenant } from '@/app/lib/definitions';
import { PlusIcon } from '@heroicons/react/24/outline';
import { createSection } from './actions';

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
      <form
        action={() => {
          createSection(name, tenantId);
          setName('');
          setTenantId('');
        }}
        className="flex gap-2"
      >
        <div className="flex-1 flex items-center">
          <input
            id="section-name"
            onChange={(e) => handleChangeName(e)}
            defaultValue={name}
            type="text"
            className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Название"
          />
        </div>
        <div className="flex-1 flex items-center">
          <select
            id="selectTenant"
            name="tenantId"
            className="w-full h-10 cursor-pointer rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-blue-300"
            defaultValue=""
            onChange={(e) => handleSelectTenant(e)}
          >
            <option value="" disabled>
              Организация
            </option>
            {props.tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 flex items-center">
          <button
            className="bg-blue-500 text-white w-full h-10 rounded-md border border-transparent px-3 py-2 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          >
            <div className="flex items-center justify-center h-full">
              <span className="hidden md:block">Создать раздел</span>{' '}
              <PlusIcon className="h-5 md:ml-4" />
            </div>
          </button>
        </div>
      </form>
    </div>
    // <div className="flex items-center p-4">
    //   <form
    //     action={() => { createSection(name, tenantId); setName(''); setTenantId('') }}
    //     className="flex space-x-2">
    //     <div className="flex-1">
    //       <input
    //         id="section-name" onChange={(e) => handleChangeName(e)} defaultValue={name} type="text"
    //         className="w-full rounded-md border p-2 hover:bg-gray-100" placeholder='Название'
    //       />
    //     </div>
    //     <div className="flex-1">
    //       <select
    //         id="selectTenant"
    //         name="tenantId"
    //         className="w-full cursor-pointer rounded-md border p-2 hover:bg-gray-100"
    //         defaultValue=""
    //         onChange={(e) => handleSelectTenant(e)}
    //       >
    //         <option value="" disabled>
    //           Организация
    //         </option>
    //         {props.tenants.map((tenant) => (
    //           <option key={tenant.id} value={tenant.id}>
    //             {tenant.name}
    //           </option>
    //         ))}
    //       </select>
    //     </div>
    //     <div className="flex-2">
    //       <button
    //         className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-500"
    //       >
    //         <div className="flex items-center">
    //           <span className="hidden md:block">Создать раздел</span>{' '}
    //           <PlusIcon className="h-5 md:ml-4" />
    //         </div>
    //       </button>
    //     </div>
    //   </form>
    // </div>
  );
}
