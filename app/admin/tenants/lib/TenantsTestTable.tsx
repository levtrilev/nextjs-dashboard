'use client';
import { deleteTenant, tenantsTestSlice,TenantsTestState } from '@/app/admin/tenants/lib/tenantsTestSlice';
import { useSelector, useDispatch } from 'react-redux';

export default function TenantsTestTable () {
    const tenants = useSelector((state: { tenantsTest: TenantsTestState }) => tenantsTestSlice.selectors.selectTenants(state));
    const selectedTenantId = useSelector((state: { tenantsTest: TenantsTestState }) => tenantsTestSlice.selectors.selectTenantId(state));
    const deletedIds = useSelector((state: { tenantsTest: TenantsTestState }) => tenantsTestSlice.selectors.selectDeletedIds(state));

    const dispatch = useDispatch();

    // console.log('render TenantsTestTable');
    
    // console.log('selectedTenantId : ' + selectedTenantId.toString());

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border-b-2 border-gray-300 px-4 py-2 text-center">ID</th>
                        <th className="border-b-2 border-gray-300 px-4 py-2 text-center">Name</th>
                        <th className="border-b-2 border-gray-300 px-4 py-2 text-center">Status</th>
                        <th className="border-b-2 border-gray-300 px-4 py-2 text-center">Last Login</th>
                        <th className="border-b-2 border-gray-300 px-4 py-2 text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {tenants.map((tenant, index) => (
                        <tr key={tenant.id} className="border-b border-gray-200">
                            <td className="px-4 py-2 text-center">{tenant.id}</td>
                            <td className="px-4 py-2 text-center">{tenant.name}</td>
                            <td className="px-4 py-2 text-center">{tenant.status}</td>
                            <td className="px-4 py-2 text-center">{tenant.lastLogin}</td>
                            <td className="px-4 py-2 text-center">
                                <button
                                    className="bg-blue-400 hover:bg-blue-600 text-white px-4 py-2 rounded"
                                    onClick={() => dispatch(deleteTenant({index:index, id:tenant.id}))}
                                >delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <span>deleted id:{deletedIds.map((id)=>`${id.toString()},`)}</span>
        </div>
    );
}
