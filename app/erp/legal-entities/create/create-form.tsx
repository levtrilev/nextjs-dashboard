
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
import { useActionState, useState } from 'react';
import { createLegalEntity, LegalEntityState } from '@/app/erp/legal-entities/lib/actions';

export default function Form() {
  const [legalEntity, setLegalEntity] = useState({
    id: "",
    name: "",
    fullname: "",
    inn: "",
    address_legal: "",
    phone: "",
    email: "",
    contact: "",
    is_customer: false,
    is_supplier: false,
    kpp: "",
  } as LegalEntity);
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
            value={legalEntity.name}
            maxLength={128}
            id="name"
            className="block w-full rounded-md py-2 px-3 text-sm placeholder:text-gray-500"
            placeholder="Название юрлица"
            aria-describedby="name-error"
            onChange={(e) => setLegalEntity((prev) => ({...prev, name: e.target.value,}))}
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
            value={legalEntity.fullname}
            maxLength={255}
            id="fullname"
            className="block w-full rounded-md py-2 px-3 text-sm placeholder:text-gray-500"
            placeholder="Полное наименование"
            aria-describedby="fullname-error"
            onChange={(e) => setLegalEntity((prev) => ({...prev, fullname: e.target.value,}))}

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
            value={legalEntity.contact}
            maxLength={255}
            id="contact"
            className="block w-full rounded-md py-2 px-3 text-sm placeholder:text-gray-500"
            placeholder="Контакты"
            aria-describedby="contact-error"
            onChange={(e) => setLegalEntity((prev) => ({...prev, contact: e.target.value,}))}
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
            value={legalEntity.phone}
            maxLength={32}
            id="phone"
            className="block w-full rounded-md py-2 px-3 text-sm placeholder:text-gray-500"
            placeholder="Телефон"
            aria-describedby="phone-error"
            onChange={(e) => setLegalEntity((prev) => ({...prev, phone: e.target.value,}))}
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
            value={legalEntity.email}
            maxLength={64}
            id="email"
            className="block w-full rounded-md py-2 px-3 text-sm placeholder:text-gray-500"
            placeholder="Email"
            aria-describedby="email-error"
            onChange={(e) => setLegalEntity((prev) => ({...prev, email: e.target.value,}))}
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
            value={legalEntity.address_legal}
            maxLength={255}
            id="address_legal"
            className="block w-full rounded-md py-2 px-3 text-sm placeholder:text-gray-500"
            placeholder="Юридический адрес"
            aria-describedby="address_legal-error"
            onChange={(e) => setLegalEntity((prev) => ({...prev, address_legal: e.target.value,}))}
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
            value={legalEntity.inn}
            maxLength={32}
            id="inn"
            className="block w-full rounded-md py-2 px-3 text-sm placeholder:text-gray-500"
            placeholder="ИНН"
            aria-describedby="inn-error"
            onChange={(e) => setLegalEntity((prev) => ({...prev, inn: e.target.value,}))}
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
            value={legalEntity.kpp}
            maxLength={32}
            id="kpp"
            className="block w-full rounded-md py-2 px-3 text-sm placeholder:text-gray-500"
            placeholder="КРР"
            aria-describedby="kpp-error"
            onChange={(e) => setLegalEntity((prev) => ({...prev, kpp: e.target.value,}))}
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

        {/* is_customer */}
        <div className="mb-4">
          <label htmlFor="is_customer" className="mb-2 block text-sm font-medium">
            Покупатель?
          </label>
          <input
            id="is_customer"
            name="is_customer"
            type="checkbox"
            defaultChecked={legalEntity.is_customer}
            aria-describedby="is_customer-error"
            onChange={(e) => setLegalEntity((prev) => ({...prev, is_customer: e.target.checked,}))}
          />
        </div>

        {/* is_supplier */}
        <div className="mb-4">
          <label htmlFor="is_supplier" className="mb-2 block text-sm font-medium">
            Поставщик?
          </label>
          <input
            id="is_supplier"
            name="is_supplier"
            type="checkbox"
            defaultChecked={legalEntity.is_supplier}
            aria-describedby="is_supplier-error"
            onChange={(e) => setLegalEntity((prev) => ({...prev, is_supplier: e.target.checked,}))}
          />
        </div>

    {/* str_is_customer
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
                  value={legalEntity.is_customer ? "true" : "false"}
                  className="h-4 w-4"
                  aria-describedby="status-error"
                  onChange={(e) => handleChangeIsCustomer(e)}
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
                  value={legalEntity.is_customer ? "true" : "false"}
                  className="h-4 w-4"
                  onChange={(e) => handleChangeIsCustomer(e)}
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

        {/* str_is_supplier 
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
                  value={legalEntity.is_supplier ? "true" : "false"}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  aria-describedby="status-error"
                  onChange={(e) => handleChangeIsSupplier(e)}
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
                  value={legalEntity.is_supplier ? "true" : "false"}
                  className="h-4 w-4"
                  onChange={(e) => handleChangeIsCustomer(e)}
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
 */}



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
