'use client';

import { TrashIcon } from '@heroicons/react/24/outline';
import { FaceSmileIcon } from '@heroicons/react/20/solid';
import { deleteUser } from './actions';
import { useState } from 'react';

export function DeleteUser() {
  const [emailToDelete, changeEmailToDelete] = useState<string>("");
  function handleChangeEmail(event: any) {
    changeEmailToDelete(event.target.value);
    // console.log("handleChangeEmail: " + email);
  }
  return (
    <div className="flex items-center p-4">
      <form action={() => deleteUser(emailToDelete)} className="flex space-x-2">
        <div className="flex-2">
          <input
            id="delete-email" onChange={(e) => handleChangeEmail(e)} defaultValue={emailToDelete} type="text"
            className=" w-full rounded-md border p-2 hover:bg-gray-100" placeholder='Email'
          />
        </div>
        <div className="flex-2">
          <button
            className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-500"
          >
            {/* <span className="sr-only">Delete User </span>
          <TrashIcon className="w-5" /> */}
            Delete User
          </button>
        </div>
      </form>
    </div>
  );
}
