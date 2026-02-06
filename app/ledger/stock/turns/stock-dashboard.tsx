'use client'

import { useState, useEffect } from 'react'
import {
    CalendarIcon,
    BuildingStorefrontIcon,
    CubeIcon
} from '@heroicons/react/24/outline'
import BtnGoodsRef from '@/app/erp/goods/lib/btn-goods-ref'
import BtnWarehousesRef from '@/app/erp/warehouses/lib/btn-warehouses-ref'
import BtnRefGeneric from '@/app/lib/btn-ref-generic'
import { GoodForm, Period, WarehouseForm } from '@/app/lib/definitions'
import { StockTurnover } from '../lib/stock-types'
import { getStockTurnovers } from '../lib/stock-actions'
import StockTurnoverTable from '../lib/stock-turnover-table'

interface StockDashboardProps {
    current_sections: string
    initialFilterPeriod?: Period
    periods: Period[]
    warehouses: WarehouseForm[]
    goods: GoodForm[]
}

export default function StockDashboard({
    current_sections,
    initialFilterPeriod,
    periods,
    warehouses,
    goods
}: StockDashboardProps) {
    // Фильтры

    const [filterPeriod, setFilterPeriod] = useState<{ id: string, name: string } | null>(initialFilterPeriod ?? null);
    const [filterWarehouse, setFilterWarehouse] = useState<{ id: string, name: string } | null>(null);
    const [filterGood, setFilterGood] = useState<{ id: string, name: string } | null>(null);

    // Данные для таблиц
    // const [balances, setBalances] = useState<StockBalanceForm[]>([])
    const [turnovers, setTurnovers] = useState<StockTurnover[]>([])

    // Состояния загрузки и ошибок
    const [isLoadingBalances, setIsLoadingBalances] = useState(false)
    const [isLoadingTurnovers, setIsLoadingTurnovers] = useState(false)
    const [errorBalances, setErrorBalances] = useState<Error | null>(null)
    const [errorTurnovers, setErrorTurnovers] = useState<Error | null>(null)

    // Вспомогательные данные с пустыми значениями
    const periodsWithEmpty = [{ id: '', name: 'Все периоды' }, ...periods]
    const warehousesWithEmpty = [{ id: '', name: 'Все склады' }, ...warehouses]
    const goodsWithEmpty = [{ id: '', name: 'Все товары' }, ...goods]

    // Загрузка данных
    const loadData = async () => {
        setIsLoadingBalances(true)
        setIsLoadingTurnovers(true)
        setErrorBalances(null)
        setErrorTurnovers(null)

        try {
            // const [balancesData, turnoversData] = await Promise.all([
                // getStockBalances(
                //     current_sections,
                //     //   filterPeriod?.id,
                //     //   filterWarehouse?.id,
                //     //   filterGood?.id
                // ),
                const turnoversData = await getStockTurnovers(
                    current_sections,
                    filterPeriod ? filterPeriod.id : undefined,
                    filterWarehouse ? filterWarehouse.id : undefined,
                    filterGood ? filterGood.id : undefined
                )
            // ])

            // setBalances(balancesData)
            setTurnovers(turnoversData)
        } catch (error) {
            if (error instanceof Error) {
                setErrorBalances(error)
                setErrorTurnovers(error)
            }
        } finally {
            setIsLoadingBalances(false)
            setIsLoadingTurnovers(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [filterPeriod, filterWarehouse, filterGood])

    // Обработчики выбора фильтров
    const handleSelectPeriod = (new_period_id: string, new_period_name: string) => {
        setFilterPeriod(new_period_id ? { name: new_period_name, id: new_period_id } : null)
    }

    const handleSelectWarehouse = (new_warehouse_id: string, new_warehouse_name: string) => {
        setFilterWarehouse(new_warehouse_id ? { name: new_warehouse_name, id: new_warehouse_id } : null)
    }

    const handleSelectGood = (new_good_id: string, new_good_name: string) => {
        setFilterGood(new_good_id ? { name: new_good_name, id: new_good_id } : null)
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Фильтры */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
                <div className="flex flex-wrap gap-4">
                    {/* Период */}
                    <div className="flex-1 min-w-[280px]">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 min-w-[100px]">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                                </div>
                                <label className="block text-sm font-semibold text-gray-700">Период</label>
                            </div>

                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={filterPeriod?.name || 'Все периоды'}
                                    onChange={() => { }}
                                    disabled
                                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-800"
                                    placeholder="Выберите период"
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <CalendarIcon className="h-5 w-5" />
                                </div>
                            </div>
                            <BtnRefGeneric<Period>
                                items={periodsWithEmpty as Period[]}
                                handleSelectItem={handleSelectPeriod}
                                title="Выберите период:"
                                additionalColumns={[
                                    { key: 'date_start', label: 'Начало', width: 'w-1/4' },
                                    { key: 'date_end', label: 'Окончание', width: 'w-1/4' }
                                ]}
                                searchPlaceholder="Поиск периода..."
                                saveButtonText="Сохранить"
                                exitButtonText="Отмена"
                            // <BtnRefGeneric
                            //     items={periodsWithEmpty}
                            //     handleSelectItem={handleSelectPeriod}
                            //     title="Выберите период:"
                            //     additionalColumns={[
                            //         { key: 'date_start', label: 'Начало', width: 'w-1/4' },
                            //         { key: 'date_end', label: 'Окончание', width: 'w-1/4' }
                            //     ]}
                            //     searchPlaceholder="Поиск периода..."
                            //     saveButtonText="Сохранить"
                            //     exitButtonText="Отмена"
                            // className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Склад */}
                    <div className="flex-1 min-w-[280px]">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 min-w-[100px]">
                                <div className="bg-orange-100 p-2 rounded-lg">
                                    <BuildingStorefrontIcon className="h-5 w-5 text-orange-600" />
                                </div>
                                <label className="block text-sm font-semibold text-gray-700">Склад</label>
                            </div>

                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={filterWarehouse?.name || 'Все склады'}
                                    onChange={() => { }}
                                    disabled
                                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 text-gray-800"
                                    placeholder="Выберите склад"
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <BuildingStorefrontIcon className="h-5 w-5" />
                                </div>
                            </div>

                            <BtnWarehousesRef
                                handleSelectWarehouse={handleSelectWarehouse}
                                warehouses={warehousesWithEmpty as WarehouseForm[]}
                            // className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Товар */}
                    <div className="flex-1 min-w-[280px]">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 min-w-[100px]">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <CubeIcon className="h-5 w-5 text-green-600" />
                                </div>
                                <label className="block text-sm font-semibold text-gray-700">Товар</label>
                            </div>

                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={filterGood?.name || 'Все товары'}
                                    onChange={() => { }}
                                    disabled
                                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 text-gray-800"
                                    placeholder="Выберите товар"
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <CubeIcon className="h-5 w-5" />
                                </div>
                            </div>

                            <BtnGoodsRef
                                handleSelectGood={handleSelectGood}
                                goods={goodsWithEmpty as GoodForm[]}
                            // className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Таблица остатков */}
            {/* <div className="mb-8">
                <StockBalancesTable
                    key={`balances-${filterWarehouse?.id || 'all'}`}
                    balances={balances}
                    isLoading={isLoadingBalances}
                //   error={errorBalances}
                //   onRefresh={loadData}
                />
            </div> */}

            {/* Таблица оборотов */}
            <StockTurnoverTable
                key={`turnovers-${filterPeriod?.id || 'all'}-${filterWarehouse?.id || 'all'}-${filterGood?.id || 'all'}`}
                turnovers={turnovers}
                isLoading={isLoadingTurnovers}
                error={errorTurnovers}
                onRefresh={loadData}
            />
        </div>
    )
}