import { PencilIcon, PlusIcon, TrashIcon, ServerIcon } from '@heroicons/react/24/outline';
import { deleteTenant, updateTenant } from '@/app/lib/actions';
import Link from "next/link";
import { Tenant } from '@/app/lib/definitions';

export function CreateInvoice() {
  return (
    <Link
      href="/dashboard/invoices/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create Invoice</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function BtnUpdateTenant({ tenant }: { tenant: Tenant }) {
  const updateTenantWithData = updateTenant.bind(null, tenant);
  return (
    <form action={updateTenantWithData} className="w-full">
      <button className="bg-blue-400 text-white w-full rounded-md border p-2 hover:bg-blue-100 hover:text-gray-500">
        Save
      </button>
    </form>
  );
}

export function BtnDeleteTenant({ name }: { name: string }) {
  const deleteTenantWithName = deleteTenant.bind(null, name);

  return (
    <form action={deleteTenantWithName}>
      <button className="rounded-md border p-2 h-[48px] hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}

export function BtnEditTenantLink({id}:{id:string}) {
  const LinkIcon = PencilIcon;
  return (
    <Link
      key={"Edit"}
      href={"/admin/tenants/"+id}
      className='flex h-[48px] grow items-center justify-center gap-2 rounded-md border p-2 bg-gray-50 p-3 text-sm font-medium hover:bg-gray-100 md:flex-none md:justify-start md:p-2 md:px-3'

    >
      <LinkIcon className="w-6" />
      <p className="hidden md:block">{"Edit"}</p>
    </Link>
  );
}
