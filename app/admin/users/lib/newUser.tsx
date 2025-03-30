'use client';
import { useState } from 'react';
import { createUser } from './users-actions';
import { Tenant } from '@/app/lib/definitions';
import { PlusIcon } from '@heroicons/react/24/outline';

interface INewUserProps {
  tenants: Tenant[],
}
export const NewUser: React.FC<INewUserProps> = (props: INewUserProps) => {

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [tenantId, setTenantId] = useState<string>("");
  function handleChangeEmail(event: any) {
    setEmail(event.target.value);
  }
  function handleChangePassword(event: any) {
    setPassword(event.target.value);
  }
  function handleSelectTenant(event: any) {
    setTenantId(event.target.value);
  }
  return (
    <div className="flex items-center p-4">
      <form
        action={() => {
          createUser(email, password, tenantId, false);
          setEmail(''); setPassword(''); setTenantId('');
        }}
        className="flex gap-2">
        <div className="flex-1 flex items-center">
          <input
            id="create-email"
            onChange={(e) => handleChangeEmail(e)}
            defaultValue={email}
            type="text"
            className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-blue-300"
            placeholder='Email'
          />
        </div>
        <div className="flex-1 flex items-center">
          <input
            id="create-password" 
            onChange={(e) => handleChangePassword(e)} 
            defaultValue={password} 
            type="text"
            className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-blue-300"
            placeholder='Пароль'
          />
        </div>
        <div className="flex-1">
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
        <div className="flex-2 flex items-center">
          <button
            className="bg-blue-500 text-white w-full h-10 rounded-md border border-transparent px-3 py-2 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            >
            <div className="flex items-center justify-center h-full">
              <span className="hidden md:block">Создать пользователя</span>{' '}
              <PlusIcon className="h-5 md:ml-4" />
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}
