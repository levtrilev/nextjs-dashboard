
'use client';

import { useState, useEffect, useMemo } from 'react';
import StockBalancesTable from './lib/stock-balances-table';
import { StockBalanceForm } from './lib/stock-types';
import { getFullStockBalances, getStockBalances } from './lib/stock-actions';
import BtnWarehousesRef from '@/app/erp/warehouses/lib/btn-warehouses-ref';
import { Good, GoodForm, Period, WarehouseForm } from '@/app/lib/definitions';
import BtnGoodsRef from '@/app/erp/goods/lib/btn-goods-ref';
import BtnRefGeneric from '@/app/lib/btn-ref-generic';
import { CalendarIcon, BuildingStorefrontIcon, CubeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'


interface StockBalancesPageProps {
  current_sections: string;
  warehouses: WarehouseForm[];
  goods: GoodForm[];
  periods: Period[];
}

export default function StockBalancesPage(
  { current_sections, warehouses, goods, periods }: StockBalancesPageProps
) {
  const [balances, setBalances] = useState<StockBalanceForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterWarehouse, setFilterWarehouse] = useState<{ id: string, name: string }>({
    id: '',
    name: 'Все склады',
  });
  const [filterGood, setFilterGood] = useState<{ id: string, name: string }>({
    id: '',
    name: 'Все товары',
  });
  const [filterPeriod, setFilterPeriod] = useState<{ id: string, name: string }>({
    id: '',
    name: 'Все периоды',
  });
  const emptyGood = { ...goods[0], id: '', name: 'Все товары', product_code: '' };
  const goodsWithEmpty = useMemo(() => { return [emptyGood, ...goods] }, [goods]);
  const emptyWarehouse = { ...warehouses[0], id: '', name: 'Все склады' };
  const warehousesWithEmpty = useMemo(() => { return [emptyWarehouse, ...warehouses] }, [warehouses]);
  const emptyPeriod = { ...periods[0], id: '', name: 'Все периоды' };
  const periodsWithEmpty = useMemo(() => { return [emptyPeriod, ...periods] }, [periods]);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        setIsLoading(true);

        const data: StockBalanceForm[] = await getFullStockBalances(current_sections);
        setBalances(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();

  }, []);

  const filteredBalances = useMemo(() => {
    return balances.filter(balance => {
      // Фильтр по складу
      if (filterWarehouse.id && balance.warehouse_id !== filterWarehouse.id) {
        return false;
      }

      // Фильтр по товару
      if (filterGood.id && balance.good_id !== filterGood.id) {
        return false;
      }

      // Фильтр по периоду
      if (filterPeriod.id && balance.period_id !== filterPeriod.id) {
        return false;
      }

      return true;
    });
  }, [balances, filterWarehouse.id, filterGood.id, filterPeriod.id]);
  const handleSelectWarehouse = (id: string, name: string) => {
    setFilterWarehouse({ id, name });
  }
  const handleSelectGood = (id: string, name: string) => {
    setFilterGood({ id, name });
  }
  const handleSelectPeriod = (id: string, name: string) => {
    setFilterPeriod({ id, name });
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
                  value={filterPeriod.name}
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
                items={periodsWithEmpty}
                handleSelectItem={handleSelectPeriod}
                title="Выберите период:"
                additionalColumns={[
                  { key: 'date_start', label: 'Начало', width: 'w-1/4' },
                  { key: 'date_end', label: 'Окончание', width: 'w-1/4' }
                ]}
                searchPlaceholder="Поиск периода..."
                saveButtonText="Сохранить"
                exitButtonText="Отмена"
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
                  value={filterWarehouse.name}
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
                warehouses={warehousesWithEmpty}
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
                  value={filterGood.name}
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
                goods={goodsWithEmpty}
              // className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Таблица */}
      <StockBalancesTable
        key={filterWarehouse.id || 'all'}
        balances={filteredBalances}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}