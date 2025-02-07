'use client';
import { useState } from 'react';
import { createUser } from '../../../lib/actions';
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
        className="flex space-x-2">
        <div className="flex-1">
          <input
            id="create-email" onChange={(e) => handleChangeEmail(e)} defaultValue={email} type="text"
            className="w-full rounded-md border p-2 hover:bg-gray-100" placeholder='Email'
          />
        </div>
        <div className="flex-1">
          <input
            id="create-password" onChange={(e) => handleChangePassword(e)} defaultValue={password} type="text"
            className="w-full rounded-md border p-2 hover:bg-gray-100" placeholder='Пароль'
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
              Организация
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
            <div className="flex items-center">
              <span className="hidden md:block">Создать пользователя</span>{' '}
              <PlusIcon className="h-5 md:ml-4" />
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}
