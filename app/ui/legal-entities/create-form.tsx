
// LegalEntity Create form

'use client';

import { LegalEntity } from '@/app/lib/definitions';
import Link from 'next/link';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createLegalEntity, LegalEntityState } from '@/app/lib/actions';
import { useActionState } from 'react';

export default function Form() {
  const initialState: LegalEntityState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createLegalEntity, initialState);
  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Название юрлица name */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Название юрлица
          </label>
          <input
            type="text"
            name="name"
            maxLength={128}
            id="name"
            className="block w-full rounded-md py-2 px-3 text-sm placeholder:text-gray-500"
            placeholder="Название юрлица"
            aria-describedby="name-error"
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

        {/* fullname */}
        <div className="mb-4">
          <label htmlFor="fullname" className="mb-2 block text-sm font-medium">
            Полное наименование
          </label>
          <input
            type="text"
            name="fullname"
            maxLength={255}
            id="fullname"
            className="block w-full rounded-md py-2 px-3 text-sm placeholder:text-gray-500"
            placeholder="Полное наименование"
            aria-describedby="fullname-error"
          />
          <div id="fullname-error" aria-live="polite" aria-atomic="true">
            {state.errors?.fullname &&
              state.errors.fullname.map((error: string) => (
                <p className="mt-2 text-xs text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* contact */}
        <div className="mb-4">
          <label htmlFor="contact" className="mb-2 block text-sm font-medium">
            Контакты
          </label>
          <input
            type="text"
            name="contact"
            maxLength={255}
            id="contact"
            className="block w-full rounded-md py-2 px-3 text-sm placeholder:text-gray-500"
            placeholder="Контакты"
            aria-describedby="contact-error"
          />
          <div id="contact-error" aria-live="polite" aria-atomic="true">
            {state.errors?.contact &&
              state.errors.contact.map((error: string) => (
                <p className="mt-2 text-xs text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* phone */}
        <div className="mb-4">
          <label htmlFor="phone" className="mb-2 block text-sm font-medium">
            Телефон
          </label>
          <input
            type="text"
            name="phone"
            maxLength={32}
            id="phone"
            className="block w-full rounded-md py-2 px-3 text-sm placeholder:text-gray-500"
            placeholder="Телефон"
            aria-describedby="phone-error"
          />
          <div id="phone-error" aria-live="polite" aria-atomic="true">
            {state.errors?.phone &&
              state.errors.phone.map((error: string) => (
                <p className="mt-2 text-xs text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* email */}
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <input
            type="text"
            name="email"
            maxLength={64}
            id="email"
            className="block w-full rounded-md py-2 px-3 text-sm placeholder:text-gray-500"
            placeholder="Email"
            aria-describedby="email-error"
          />
          <div id="email-error" aria-live="polite" aria-atomic="true">
            {state.errors?.email &&
              state.errors.email.map((error: string) => (
                <p className="mt-2 text-xs text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* address_legal */}
        <div className="mb-4">
          <label htmlFor="address_legal" className="mb-2 block text-sm font-medium">
            Юридический адрес
          </label>
          <input
            type="text"
            name="address_legal"
            maxLength={255}
            id="address_legal"
            className="block w-full rounded-md py-2 px-3 text-sm placeholder:text-gray-500"
            placeholder="Юридический адрес"
            aria-describedby="address_legal-error"
          />
          <div id="address_legal-error" aria-live="polite" aria-atomic="true">
            {state.errors?.address_legal &&
              state.errors.address_legal.map((error: string) => (
                <p className="mt-2 text-xs text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* inn */}
        <div className="mb-4">
          <label htmlFor="inn" className="mb-2 block text-sm font-medium">
            ИНН
          </label>
          <input
            type="text"
            name="inn"
            maxLength={32}
            id="inn"
            className="block w-full rounded-md py-2 px-3 text-sm placeholder:text-gray-500"
            placeholder="ИНН"
            aria-describedby="inn-error"
          />
          <div id="inn-error" aria-live="polite" aria-atomic="true">
            {state.errors?.inn &&
              state.errors.inn.map((error: string) => (
                <p className="mt-2 text-xs text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* kpp */}
        <div className="mb-4">
          <label htmlFor="kpp" className="mb-2 block text-sm font-medium">
            КПП
          </label>
          <input
            type="text"
            name="kpp"
            maxLength={32}
            id="kpp"
            className="block w-full rounded-md py-2 px-3 text-sm placeholder:text-gray-500"
            placeholder="КРР"
            aria-describedby="kpp-error"
          />
          <div id="kpp-error" aria-live="polite" aria-atomic="true">
            {state.errors?.kpp &&
              state.errors.kpp.map((error: string) => (
                <p className="mt-2 text-xs text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* str_is_customer */}
        <fieldset>

          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-1.5">
            <div className="flex gap-4">
              <div className="flex items-center">
                <p className="text-sm font-medium pr-3 ">
                  Покупатель?
                </p>
                <input
                  id="customer_true"
                  name="str_is_customer"
                  type="radio"
                  value="true"
                  className="h-4 w-4"
                  aria-describedby="status-error"
                />
                <label
                  htmlFor="customer_true"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Yes <ClockIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="customer_false"
                  name="str_is_customer"
                  type="radio"
                  value="false"
                  className="h-4 w-4"
                />
                <label
                  htmlFor="customer_false"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-400"
                >
                  No <CheckIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
          <div id="is_customer-error" aria-live="polite" aria-atomic="true">
            {state.errors?.str_is_customer &&
              state.errors.str_is_customer.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </fieldset>

        {/* str_is_supplier */}
        <fieldset>

          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-1.5 mt-4">
            <div className="flex gap-4">
              <div className="flex items-center">
                <p className="text-sm font-medium pr-3 ">
                  Поставщик?
                </p>
                <input
                  id="supplier_true"
                  name="str_is_supplier"
                  type="radio"
                  value="true"
                  // className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2
                  // focus:ring-red-300"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  aria-describedby="status-error"
                />
                <label
                  htmlFor="supplier_true"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Yes <ClockIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="supplier_false"
                  name="str_is_supplier"
                  type="radio"
                  value="false"
                  className="h-4 w-4"
                />
                <label
                  htmlFor="supplier_false"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-400"
                >
                  No <CheckIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
          <div id="is_customer-error" aria-live="polite" aria-atomic="true">
            {state.errors?.str_is_supplier &&
              state.errors.str_is_supplier.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </fieldset>




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
        <Button type="submit">Создать юр.лицо</Button>
      </div>
    </form>
  );
}
