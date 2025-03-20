'use client';
import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { createRole } from './actions';

export const NewRole = () => {

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
      <form
        action={() => { createRole(name, description, 'a262e083-8e1b-440c-8829-cec98c88f9fb', '{}'); setName(''); setDescription('') }}
        className="flex gap-2">
        <div className="flex-2 flex items-center">
          <input
            id="tenant-name" onChange={(e) => handleChangeName(e)} defaultValue={name} type="text"
            className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-blue-300"
            placeholder='Название'
          />
        </div>
        <div className="flex-4 flex items-center">
          <input
            id="tenant-description" onChange={(e) => handleChangeDescription(e)} defaultValue={description} type="text"
            className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-blue-300"
            placeholder='Описание'
          />
        </div>
        <div className="flex-4">
          <button
            className="bg-blue-500 text-white w-full h-10 rounded-md border border-transparent px-3 py-2 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            >
            <div className="flex items-center justify-center h-full">
            <span className="hidden md:block">Создать роль</span>{' '}
              <PlusIcon className="h-5 md:ml-4" />
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}
