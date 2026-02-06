'use server';

import { auth, getUser } from "@/auth";
import CreateStockMovementButton from "../movements/create/page";
import { getCurrentSections } from "@/app/lib/common-actions";
// import StockBalancesPage from "./stock-balances-page";
import { fetchGoodsForm } from "@/app/erp/goods/lib/goods-actions";
import { fetchWarehousesForm } from "@/app/erp/warehouses/lib/warehouses-actions";
import { fetchSectionsForm } from "@/app/admin/sections/lib/sections-actions";
import { fetchPeriods, getPeriodByDate } from "../lib/stock-actions";
import StockDashboard from "./stock-dashboard";

export default async function Page() {
    const session = await auth();
    const session_user = session ? session.user : null;
    if (!session_user || !session_user.email) {
        return <h3 className="text-xs font-medium text-gray-400">Вы не авторизованы!</h3>;
    }
    const email = session_user.email;
    const user = await getUser(email as string);
    if (!user) {
        return <h3 className="text-xs font-medium text-gray-400">Вы не авторизованы!</h3>;
    }
    const pageUser = user;
    const current_sections = await getCurrentSections(email as string);
    const goods = await fetchGoodsForm(current_sections);
    const warehouses = await fetchWarehousesForm(current_sections);
    const sections = await fetchSectionsForm(current_sections);
    const periods = await fetchPeriods();
    const initialFilterPeriod = await getPeriodByDate(new Date());
    return (
        <>
            <CreateStockMovementButton
                goods={goods}
                warehouses={warehouses}
                sections={sections}
            />
            {/* <StockBalancesPage
                current_sections={current_sections}
                warehouses={warehouses}
                goods={goods}
                periods={periods}
            /> */}
            <StockDashboard
                current_sections={current_sections}
                initialFilterPeriod={initialFilterPeriod ?? undefined}
                warehouses={warehouses}
                goods={goods}
                periods={periods}
            />
        </>
    );
}