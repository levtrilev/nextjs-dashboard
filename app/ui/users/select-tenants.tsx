import { Tenant } from "@/app/lib/definitions";
interface INewUserProps {
  tenants: Tenant[],
  selectRef: React.RefObject<HTMLSelectElement|null>,
}
const SelectTenants: React.FC<INewUserProps> = (props: INewUserProps) => {
  // const tenants = await fetchTenants();

  return (
    <select
      id="selectTenant"
      ref={props.selectRef}
      name="tenantId"
      // className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
      className="w-full cursor-pointer rounded-md border p-2 hover:bg-gray-100"
      defaultValue=""
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
  );
}

export default SelectTenants;