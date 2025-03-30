
// Region Create form

'use client';

import { Region } from '@/app/lib/definitions';
import Link from 'next/link';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { useActionState, useState } from 'react';
import { createRegion, RegionState } from '@/app/erp/regions/lib/region-actions';

export default function Form() {
  const [region, setRegion] = useState({
    id: "",
    name: "",
    capital: "",
    area: "",
    code: "",
    section_id: "",
  } as Region);
  const initialState: RegionState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createRegion, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Название региона name */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Название региона
          </label>
          <input
            type="text"
            name="name"
            value={region.name}
            maxLength={128}
            id="name"
            className="block w-full rounded-md py-2 px-3 text-sm placeholder:text-gray-500"
            placeholder="Название региона"
            aria-describedby="name-error"
            onChange={(e) => setRegion((prev) => ({...prev, name: e.target.value,}))}
          />
          <div id="name-error" aria-live="polite" aria-atomic="true">
            {state.errors?.name &&
              state.errors.name.map((error: string) => (
                <p className="mt-2 text-xs text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* capital */}
        <div className="mb-4">
          <label htmlFor="fullname" className="mb-2 block text-sm font-medium">
            Столица
          </label>
          <input
            type="text"
            name="capital"
            value={region.capital}
            maxLength={255}
            id="capital"
            className="block w-full rounded-md py-2 px-3 text-sm placeholder:text-gray-500"
            placeholder="Столица"
            aria-describedby="capital-error"
            onChange={(e) => setRegion((prev) => ({...prev, capital: e.target.value,}))}

          />
          <div id="capital-error" aria-live="polite" aria-atomic="true">
            {state.errors?.capital &&
              state.errors.capital.map((error: string) => (
                <p className="mt-2 text-xs text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* area */}
        <div className="mb-4">
          <label htmlFor="area" className="mb-2 block text-sm font-medium">
            Округ
          </label>
          <input
            type="text"
            name="area"
            value={region.area}
            maxLength={255}
            id="area"
            className="block w-full rounded-md py-2 px-3 text-sm placeholder:text-gray-500"
            placeholder="Округ"
            aria-describedby="area-error"
            onChange={(e) => setRegion((prev) => ({...prev, area: e.target.value,}))}
          />
          <div id="area-error" aria-live="polite" aria-atomic="true">
            {state.errors?.area &&
              state.errors.area.map((error: string) => (
                <p className="mt-2 text-xs text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* code */}
        <div className="mb-4">
          <label htmlFor="code" className="mb-2 block text-sm font-medium">
            Код
          </label>
          <input
            type="text"
            name="code"
            value={region.code}
            maxLength={32}
            id="code"
            className="block w-full rounded-md py-2 px-3 text-sm placeholder:text-gray-500"
            placeholder="Код"
            aria-describedby="code-error"
            onChange={(e) => setRegion((prev) => ({...prev, code: e.target.value,}))}
          />
          <div id="code-error" aria-live="polite" aria-atomic="true">
            {state.errors?.code &&
              state.errors.code.map((error: string) => (
                <p className="mt-2 text-xs text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* section_id */}
        <div className="mb-4">
          <label htmlFor="section_id" className="mb-2 block text-sm font-medium">
          Id Раздела
          </label>
          <input
            type="text"
            name="section_id"
            value={region.section_id}
            maxLength={64}
            id="section_id"
            className="block w-full rounded-md py-2 px-3 text-sm placeholder:text-gray-500"
            placeholder="Id Раздела"
            aria-describedby="section_id-error"
            onChange={(e) => setRegion((prev) => ({...prev, section_id: e.target.value,}))}
          />
          <div id="section_id-error" aria-live="polite" aria-atomic="true">
            {state.errors?.section_id &&
              state.errors.section_id.map((error: string) => (
                <p className="mt-2 text-xs text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        <div id="form-error" aria-live="polite" aria-atomic="true">
          {state.message &&
            <p className="mt-2 text-sm text-red-500" key={state.message}>
              {state.message}
            </p>
          }
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/erp/legal-entities"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Отмена
        </Link>
        <Button type="submit">Создать Регион</Button>
      </div>
    </form>
  );
}
