'use client';
import { useState } from 'react';
import { createUser } from '../../lib/actions';
import { Tenant } from '@/app/lib/definitions';
import SelectTenants from './select-tenants';
import { useRef } from 'react';
import { useEffect } from 'react';

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
    alert(event.target.value);
  }
  return (
    // <form action={() => { console.log("form action: " + email); console.log("form action: " + password);}}>
    <div className="flex items-center p-4">
      <form action={() => createUser(email, password, tenantId, false)} className="flex space-x-2">
      {/* <form action={() => alert(selectRef.current)} className="flex space-x-2"> */}
        <div className="flex-1">
          <input
            id="create-email" onChange={(e) => handleChangeEmail(e)} defaultValue={email} type="text"
            className="w-full rounded-md border p-2 hover:bg-gray-100" placeholder='email'
          />
        </div>
        <div className="flex-1">
          <input
            id="create-password" onChange={(e) => handleChangePassword(e)} defaultValue={password} type="text"
            className="w-full rounded-md border p-2 hover:bg-gray-100" placeholder='password'
          />
        </div>
        <div className="flex-1">
          <select
            id="selectTenant"
            // ref={props.selectRef}
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
          <button className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-100 hover:text-gray-500">
            {/* <span className="sr-only">Create User</span>
            <FaceSmileIcon className="w-5" /> */}
            Create User
          </button>
        </div>
      </form>
    </div>
  );
}
