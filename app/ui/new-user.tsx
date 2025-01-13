'use client';

import { TrashIcon } from '@heroicons/react/24/outline';
import { FaceSmileIcon } from '@heroicons/react/20/solid';
import { createUser, deleteUser } from '../lib/actions';
import { useState } from 'react';


// const deleteInvoiceWithId = deleteInvoice.bind(null, id);



export function NewUser() {
  const [email, changeEmail] = useState<string>("");
  const [password, changePassword] = useState<string>("");

  function handleChangeEmail(event: any) {
    changeEmail(event.target.value);
    // console.log("handleChangeEmail: " + email);
  }
  function handleChangePassword(event: any) {
    changePassword(event.target.value);
  }
  return (
    // <form action={() => { console.log("form action: " + email); console.log("form action: " + password);}}>
    <div className="flex items-center p-4">
      <form action={() => createUser(email, password)} className="flex space-x-2">
        <input id="create-email" onChange={(e) => handleChangeEmail(e)} defaultValue={email} type="text" className="rounded-md border p-2 hover:bg-gray-100" placeholder='email' />
        <input id="create-password" onChange={(e) => handleChangePassword(e)} defaultValue={password} type="text" className="rounded-md border p-2 hover:bg-gray-100" placeholder='password' />
        <button className="rounded-md border p-2 hover:bg-blue-100">
          {/* <span className="sr-only">Create User</span>
            <FaceSmileIcon className="w-5" /> */}
          Create User
        </button>
      </form>
    </div>
  );
}

export function DeleteUser() {
  const [emailToDelete, changeEmailToDelete] = useState<string>("");
  function handleChangeEmail(event: any) {
    changeEmailToDelete(event.target.value);
    // console.log("handleChangeEmail: " + email);
  }
  return (
    <div className="flex items-center p-4">
      <form action={() => deleteUser(emailToDelete)} className="flex space-x-2">
        <input id="delete-email" onChange={(e) => handleChangeEmail(e)} defaultValue={emailToDelete} type="text" className="rounded-md border p-2 hover:bg-gray-100" placeholder='email' />
        <button className="rounded-md border p-2 hover:bg-blue-100">
          {/* <span className="sr-only">Delete User </span>
          <TrashIcon className="w-5" /> */}
          Delete User
        </button>
      </form>
    </div>
  );
}
