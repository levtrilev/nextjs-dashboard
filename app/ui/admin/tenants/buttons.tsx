import { PencilIcon, PlusIcon, TrashIcon, ServerIcon } from '@heroicons/react/24/outline';
import { deleteTenant, updateTenant } from '@/app/lib/actions';
import Link from "next/link";
import { Tenant } from '@/app/lib/definitions';

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
      <button className="rounded-md border border-gray-200 p-2 h-10 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5 h-5 text-gray-800" />
      </button>
    </form>
  );
}

export function BtnEditTenantLink({ id }: { id: string }) {
  const LinkIcon = PencilIcon;
  return (
    <Link
      key={"Edit"}
      href={"/admin/tenants/" + id + "/edit"}
      className='flex h-10 items-center justify-center space-x-2 rounded-md border border-gray-200 bg-white p-2 text-sm font-medium hover:bg-gray-100 md:flex-none md:justify-start md:p-2 md:px-3'
    >
      <LinkIcon className="w-5 h-5 text-gray-800" />
      <p className="hidden md:block text-gray-700">Edit</p>
    </Link>
  );
}
