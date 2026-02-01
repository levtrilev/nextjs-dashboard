// components/StockMovementEditForm.tsx

'use client';

import { useState } from 'react';
import { useStockMovementFormStore } from '@/app/ledger/stock/lib/stockMovementFormStore';
import { DocStatus, GoodForm, InOutType, SectionForm, StockMovement, WarehouseForm } from '@/app/lib/definitions';
import BtnGoodsRef from '@/app/erp/goods/lib/btn-goods-ref';
import BtnWarehousesRef from '@/app/erp/warehouses/lib/btn-warehouses-ref';
import BtnSectionsRef from '@/app/admin/sections/lib/btn-sections-ref';
// import { InOutType, DocStatus } from 
// import { StockMovement } from '@/types/stock';

interface Props {
  onSave: (data: StockMovement) => Promise<void>;
  onCancel: () => void;
  goods: GoodForm[];
  warehouses: WarehouseForm[];
  sections: SectionForm[];
}

export default function StockMovementEditForm({ onSave, onCancel, goods, warehouses, sections }: Props) {
  const { form, updateField, reset } = useStockMovementFormStore();
  const [isSaving, setIsSaving] = useState(false);

  if (!form) return null;

  const handleSave = async () => {
    if (!form.id || !form.doc_id) {
      alert(`Не хватает? id или doc_id. form: ${JSON.stringify(form)}`);
      return;
    }

    setIsSaving(true);
    try {
      const movement: StockMovement = {
        ...form,
        id: form.id,
        doc_id: form.doc_id,
        doc_type: form.doc_type,
        section_id: form.section_id,
        tenant_id: form.tenant_id,
        user_id: form.user_id,
        period_id: form.period_id,
        record_date: form.record_date,
        record_in_out: form.record_in_out,
        quantity: form.quantity,
        amount: form.amount,
        good_id: form.good_id,
        warehouse_id: form.warehouse_id,
        movement_status: form.movement_status,
        // Опциональные поля:
        timestamptz: form.timestamptz ?? undefined,
        record_text: form.record_text ?? '',
        editing_by_user_id: form.editing_by_user_id ?? null,
        editing_since: form.editing_since ?? null,
      };

      await onSave(movement);
      reset();
    } catch (err) {
      alert('Ошибка сохранения');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };
  const handleSelectGood = (new_good_id: string, new_good_name: string) => {
    updateField('good_id', new_good_id);
    updateField('good_name', new_good_name);
  };
  const handleSelectWarehouse = (new_warehouse_id: string, new_warehouse_name: string) => {
    updateField('warehouse_id', new_warehouse_id);
    updateField('warehouse_name', new_warehouse_name);
  }
  const handleSelectSection = (new_section_id: string, new_section_name: string) => {
    updateField('section_id', new_section_id);
    updateField('section_name', new_section_name);
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          {form.id ? 'Редактирование движения' : 'Новое движение'}
        </h2>

        <div className="space-y-4">
          {/* Дата записи */}
          <div className='flex flex-row'>
            <label className="w-1/8 block text-sm font-medium">Дата записи</label>
            <input
              type="datetime-local"
              value={form.record_date ? new Date(form.record_date).toISOString().slice(0, 16) : ''}
              onChange={(e) =>
                updateField('record_date', e.target.value + ':00Z')
              }
              className="w-5/16 p-2 border rounded"
            />
            <label className="w-1/8 ml-4 block text-sm font-medium">Раздел</label>
            <input
              type="text"
              value={form.section_name}
              onChange={() => { }}
              disabled
              className="w-7/16 p-2 border rounded"
            />
            <BtnSectionsRef handleSelectSection={handleSelectSection} sections={sections}/>
          </div>

          {/* Тип движения */}
          <div className='flex flex-row'>
            <label className="w-1/8 block text-sm font-medium">Тип</label>
            <select
              value={form.record_in_out}
              onChange={(e) => updateField('record_in_out', e.target.value as InOutType)}
              className="w-full p-2 border rounded"
            >
              <option value="in">Приход</option>
              <option value="out">Расход</option>
            </select>
          </div>

          {/* Количество */}
          <div className='flex flex-row'>
            <label className="w-1/8 block text-sm font-medium">Кол-во</label>
            <input
              type="number"
              step="0.001"
              value={form.quantity}
              onChange={(e) => updateField('quantity', parseFloat(e.target.value) || 0)}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Сумма */}
          <div className='flex flex-row'>
            <label className="w-1/8 block text-sm font-medium">Сумма</label>
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Товар */}
          <div className='flex flex-row'>
            <label className="w-1/8 block text-sm font-medium">Товар</label>
            <input
              type="text"
              value={form.good_name}
              onChange={() => { }}
              disabled
              className="w-full p-2 border rounded"
            />
            <BtnGoodsRef handleSelectGood={handleSelectGood} goods={goods} />
          </div>
          
          {/* Склад */}
          <div className='flex flex-row'>
            <label className="w-1/8 block text-sm font-medium">Cклад</label>
            <input
              type="text"
              value={form.warehouse_name}
              onChange={() => {}}
              disabled 
              className="w-full p-2 border rounded"
            />
            <BtnWarehousesRef handleSelectWarehouse={handleSelectWarehouse} warehouses={warehouses} />
          </div>

          {/* Статус */}
          <div className='flex flex-row'>
            <label className="w-1/8 block text-sm font-medium">Статус</label>
            <select
              value={form.movement_status}
              onChange={(e) => updateField('movement_status', e.target.value as DocStatus)}
              className="w-full p-2 border rounded"
            >
              <option value="draft">Черновик</option>
              <option value="active">Проведено</option>
              <option value="deleted">Отменено</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}