
'use client';

import { useState, useEffect, useMemo } from 'react';
import StockBalancesTable from './lib/stock-balances-table';
import { StockBalanceForm } from './lib/stock-types';
import { getFullStockBalances, getStockBalances } from './lib/stock-actions';
import BtnWarehousesRef from '@/app/erp/warehouses/lib/btn-warehouses-ref';
import { Good, GoodForm, Period, WarehouseForm } from '@/app/lib/definitions';
import BtnGoodsRef from '@/app/erp/goods/lib/btn-goods-ref';
import BtnRefGeneric from '@/app/lib/btn-ref-generic';

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
      <div className='flex'>
        {/* Период */}
        <div className='flex flex-row'>
          <label className="w-1/8 block text-sm font-medium">Период</label>
          <input
            type="text"
            value={filterPeriod.name}
            onChange={() => { }}
            disabled
            className="w-full p-2 border rounded"
          />
          <BtnRefGeneric<Period>
            items={periodsWithEmpty}
            handleSelectItem={handleSelectPeriod}
            title="Выберите период:"
            additionalColumns={[
              { key: 'date_start', label: 'Начало', width: 'w-1/4' },
              { key: 'date_end', label: 'Окончание', width: 'w-1/4' }
            ]}
            searchPlaceholder="Поиск склада..."
            saveButtonText="Сохранить"
            exitButtonText="Отмена"
          />
        </div>

        {/* Склад */}
        <div className='flex flex-row'>
          <label className="w-1/8 block text-sm font-medium">Cклад</label>
          <input
            type="text"
            value={filterWarehouse.name}
            onChange={() => { }}
            disabled
            className="w-full p-2 border rounded"
          />
          <BtnWarehousesRef handleSelectWarehouse={handleSelectWarehouse} warehouses={warehousesWithEmpty} />
        </div>

        {/* Товар */}
        <div className='flex flex-row'>
          <label className="w-1/8 block text-sm font-medium">Товар</label>
          <input
            type="text"
            value={filterGood.name}
            onChange={() => { }}
            disabled
            className="w-full p-2 border rounded"
          />
          <BtnGoodsRef handleSelectGood={handleSelectGood} goods={goodsWithEmpty} />
        </div>
      </div>

      <StockBalancesTable
        key={filterWarehouse.id || 'all'}
        balances={filteredBalances}
        isLoading={isLoading}
        error={error}
      // filterWarehouseId={filterWarehouse.id}
      />
    </div>
  );
}