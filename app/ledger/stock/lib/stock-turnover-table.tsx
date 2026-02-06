'use client'

import { useState } from 'react'
import { 
  ArrowPathIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { StockTurnover } from './stock-types'
import { formatNumber, formatCurrencyRUB } from '@/app/lib/common-utils'

interface StockTurnoverTableProps {
  turnovers: StockTurnover[]
  isLoading: boolean
  error: Error | null
  onRefresh: () => void
}

export default function StockTurnoverTable({
  turnovers,
  isLoading,
  error,
  onRefresh
}: StockTurnoverTableProps) {
  const [showInfo, setShowInfo] = useState(false)

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">Ошибка загрузки данных</p>
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  const totals = turnovers.reduce(
    (acc, row) => {
      acc.totalIncomingQuantity += row.incoming_quantity
      acc.totalIncomingAmount += row.incoming_amount
      acc.totalOutgoingQuantity += row.outgoing_quantity
      acc.totalOutgoingAmount += row.outgoing_amount
      return acc
    },
    {
      totalIncomingQuantity: 0,
      totalIncomingAmount: 0,
      totalOutgoingQuantity: 0,
      totalOutgoingAmount: 0
    }
  )

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Заголовок таблицы */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <ArrowDownTrayIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Таблица оборотов товаров</h2>
              <p className="text-sm text-gray-500 mt-1">
                {isLoading ? 'Загрузка...' : `${turnovers.length} записей`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Информация"
            >
              <InformationCircleIcon className="h-5 w-5 text-gray-600" />
            </button>
            
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Обновить</span>
            </button>
          </div>
        </div>

        {showInfo && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <p>
              <strong>Остаток на начало периода</strong> — накопленное количество и сумма на начало выбранного периода.
            </p>
            <p className="mt-1">
              <strong>Поступление</strong> — приход товаров за период. <strong>Выбытие</strong> — расход товаров за период.
            </p>
            <p className="mt-1">
              <strong>Остаток на конец периода</strong> = Остаток на начало + Поступление - Выбытие
            </p>
          </div>
        )}
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Период
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Склад
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Товар
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Остаток на начало
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Поступление
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Выбытие
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Остаток на конец
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">Загрузка данных...</p>
                  </div>
                </td>
              </tr>
            ) : turnovers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <DocumentTextIcon className="h-12 w-12 text-gray-300" />
                    <p className="text-gray-500 font-medium">Нет данных по оборотам</p>
                    <p className="text-sm text-gray-400">
                      Попробуйте изменить фильтры или добавить движения товаров
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              turnovers.map((row, index) => (
                <tr
                  key={`${row.period_id}-${row.warehouse_id}-${row.good_id}`}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    <div className="font-medium">{row.period_name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(row.period_date_start).toLocaleDateString('ru-RU')} -{' '}
                      {new Date(row.period_date_end).toLocaleDateString('ru-RU')}
                    </div>
                  </td>
                  
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {row.warehouse_name}
                  </td>
                  
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{row.good_name}</div>
                    {row.good_code && (
                      <div className="text-xs text-gray-500">Код: {row.good_code}</div>
                    )}
                  </td>
                  
                  {/* Остаток на начало */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="text-center space-y-1">
                      <div className="font-semibold text-blue-700">
                        {formatNumber(row.opening_quantity)} шт
                      </div>
                      <div className="text-gray-700">
                        {formatCurrencyRUB(row.opening_amount)}
                      </div>
                    </div>
                  </td>
                  
                  {/* Поступление */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="text-center space-y-1">
                      <div className="font-semibold text-green-700">
                        {formatNumber(row.incoming_quantity)} шт
                      </div>
                      <div className="text-green-700">
                        {formatCurrencyRUB(row.incoming_amount)}
                      </div>
                    </div>
                  </td>
                  
                  {/* Выбытие */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="text-center space-y-1">
                      <div className="font-semibold text-red-700">
                        {formatNumber(row.outgoing_quantity)} шт
                      </div>
                      <div className="text-red-700">
                        {formatCurrencyRUB(row.outgoing_amount)}
                      </div>
                    </div>
                  </td>
                  
                  {/* Остаток на конец */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="text-center space-y-1">
                      <div className="font-semibold text-indigo-700">
                        {formatNumber(row.closing_quantity)} шт
                      </div>
                      <div className="text-indigo-700">
                        {formatCurrencyRUB(row.closing_amount)}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          
          {/* Итоги */}
          {!isLoading && turnovers.length > 0 && (
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-gray-700">
                  ИТОГО:
                </td>
                <td className="px-4 py-3 text-center text-sm font-bold text-green-800">
                  <div>{formatNumber(totals.totalIncomingQuantity)} шт</div>
                  <div>{formatCurrencyRUB(totals.totalIncomingAmount)}</div>
                </td>
                <td className="px-4 py-3 text-center text-sm font-bold text-red-800">
                  <div>{formatNumber(totals.totalOutgoingQuantity)} шт</div>
                  <div>{formatCurrencyRUB(totals.totalOutgoingAmount)}</div>
                </td>
                <td className="px-4 py-3"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}