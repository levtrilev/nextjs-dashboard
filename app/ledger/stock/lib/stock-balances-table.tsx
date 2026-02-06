// components/StockBalancesTable.tsx

'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Period, StockBalanceForm } from './stock-types';
import { GoodForm, WarehouseForm } from '@/app/lib/definitions';
import { formatDate, formatNumber, formatCurrencyRUB } from '@/app/lib/common-utils'

interface StockBalancesTableProps {
  balances: StockBalanceForm[];
  filterWarehouseId?: string;
  warehouses?: WarehouseForm[];
  goods?: GoodForm[];
  periods?: Period[];
  isLoading?: boolean;
  error?: string | null;
}

export default function StockBalancesTable({
  balances,
  warehouses,
  goods,
  periods,
  isLoading = false,
  error = null,
}: StockBalancesTableProps) {
  // ===== Сортировка =====
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StockBalanceForm;
    direction: 'asc' | 'desc';
  } | null>(null);

  const sortedBalances = useMemo(() => {
    if (!sortConfig) return balances;

    return [...balances].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === undefined || bValue === undefined) return 0;

      // Сравнение чисел
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }

      // Сравнение дат
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      // Сравнение строк
      const aStr = String(aValue);
      const bStr = String(bValue);

      return sortConfig.direction === 'asc'
        ? aStr.localeCompare(bStr, 'ru')
        : bStr.localeCompare(aStr, 'ru');
    });
  }, [balances, sortConfig]);

  // ===== Пагинация =====
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(sortedBalances.length / itemsPerPage);

  const paginatedBalances = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedBalances.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedBalances, currentPage]);

  // ===== Обработчики =====
  const handleSort = (key: keyof StockBalanceForm) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
    setCurrentPage(1); // Сброс на первую страницу при сортировке
  };

  const getSortIcon = (key: keyof StockBalanceForm) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // ===== Рендер =====
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (balances.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-500">Нет данных об остатках</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Заголовок */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Остатки товаров
          </h2>
          <span className="text-sm text-gray-500">
            Всего: {balances.length} {getPlural(balances.length, ['запись', 'записи', 'записей'])}
          </span>
        </div>
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <TableHeader
                label="Склад"
                onClick={() => handleSort('warehouse_id')}
                sortIcon={getSortIcon('warehouse_id')}
              />
              <TableHeader
                label="Товар"
                onClick={() => handleSort('good_id')}
                sortIcon={getSortIcon('good_id')}
              />
              <TableHeader
                label="Период"
                onClick={() => handleSort('period_end_date')}
                sortIcon={getSortIcon('period_end_date')}
              />
              <TableHeader
                label="Количество"
                onClick={() => handleSort('balance_quantity')}
                sortIcon={getSortIcon('balance_quantity')}
                align="right"
              />
              <TableHeader
                label="Сумма"
                onClick={() => handleSort('balance_amount')}
                sortIcon={getSortIcon('balance_amount')}
                align="right"
              />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paginatedBalances.map((balance, index) => (
              <tr
                key={`${balance.warehouse_id}-${balance.good_id}-${balance.period_id}-${index}`}
                className="hover:bg-gray-50"
              >
                <TableCell>
                  {balance.warehouse_name || balance.warehouse_id}
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate">
                    {balance.good_name || balance.good_id}
                  </div>
                  {balance.good_product_code && (
                    <div className="text-xs text-gray-500">
                      {balance.good_product_code}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {balance.period_name || formatDate(balance.period_end_date)}
                </TableCell>
                <TableCell align="right" className="font-mono">
                  {formatNumber(balance.balance_quantity)}
                </TableCell>
                <TableCell align="right" className="font-medium">
                  {formatCurrencyRUB(balance.balance_amount)}
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Страница {currentPage} из {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Назад
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Вперёд
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Вспомогательные компоненты =====

interface TableHeaderProps {
  label: string;
  onClick: () => void;
  sortIcon: string | null;
  align?: 'left' | 'right';
}

function TableHeader({ label, onClick, sortIcon, align = 'left' }: TableHeaderProps) {
  return (
    <th
      scope="col"
      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer select-none ${
        align === 'right' ? 'text-right' : ''
      }`}
      onClick={onClick}
    >
      <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
        {label}
        {sortIcon && (
          <span className="text-gray-400">{sortIcon}</span>
        )}
      </div>
    </th>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

function TableCell({ children, align = 'left', className = '' }: TableCellProps) {
  return (
    <td
      className={`whitespace-nowrap px-6 py-4 text-sm text-gray-900 ${
        align === 'right' ? 'text-right' : ''
      } ${className}`}
    >
      {children}
    </td>
  );
}

// ===== Вспомогательные функции =====

function getPlural(number: number, titles: [string, string, string]): string {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[
    number % 100 > 4 && number % 100 < 20
      ? 2
      : cases[number % 10 < 5 ? number % 10 : 5]
  ];
}