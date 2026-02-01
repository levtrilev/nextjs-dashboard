
'use client';

import StockMovementEditForm from '@/app/ledger/stock/movements/[id]/stock-movement-edit-form';
import { GoodForm, SectionForm, StockMovement, StockMovementForm, WarehouseForm } from '@/app/lib/definitions';
import { useStockMovementFormStore } from './lib/stockMovementFormStore';
import { useState } from 'react';
import { createStockMovement, getPeriodByDate, updateStockMovement } from './lib/stock-actions';
import { setIsDocumentChanged, useDocumentStore, useIsDocumentChanged, useMessageBox } from '@/app/store/useDocumentStore';
import { useRouter } from 'next/navigation';
import { setIsMessageBoxOpen, setIsShowMessageBoxCancel, setMessageBoxText } from '@/app/store/del_useMessageBoxStore';
import MessageBoxOKCancel from '@/app/lib/message-box-ok-cancel';

export default function SomeEditForm(
  { goods, warehouses, sections }: { goods: GoodForm[]; warehouses: WarehouseForm[]; sections: SectionForm[] }
) {
  const docTenantId = useDocumentStore.getState().documentTenantId;
  const sessionUserId = useDocumentStore.getState().sessionUser.id;
  const [showErrors, setShowErrors] = useState(false);
  const isDocumentChanged = useIsDocumentChanged();
  const msgBox = useMessageBox();
  const router = useRouter();
  const docChanged = () => {
    setIsDocumentChanged(true);
    setMessageBoxText('Документ изменен. Закрыть без сохранения?');
  };
  const { form, setForm, reset } = useStockMovementFormStore();

  const handleCreateMovement = () => {
    const newForm: StockMovementForm = {
      id: 'new',
      doc_id: 'b64472e2-2950-4f76-b462-3b1aca06d3c2',
      doc_type: 'vat_invoice',
      section_id: 'e21e9372-91c5-4856-a123-b6f3b53efc0f',
      section_name: '---',
      tenant_id: 'a0f9d540-3631-40c1-adca-224521c8cc7b',
      user_id: '20dcab9d-932a-4b36-9028-4150bfc1eba3',  // user2@ya.ru
      period_id: 'bef010a5-c5e8-4a65-8ad3-035524f0eb2b', // январь 2026
      period_name: 'январь 2026',
      record_text: 'Закупка незамерзающей жидкости для омывателя',
      record_date: new Date().toISOString(),
      record_in_out: 'in',
      quantity: 0,
      amount: 0,
      good_id: '', //'0acc6606-7437-4f68-bbf3-4f212ad34562',
      good_name: '', //'Незамерзающая жидкость для омывателя',
      warehouse_id: '', //'2aac9187-dd4a-4a13-8802-47d42a774d74', //на околице
      warehouse_name: '', //'на околице',
      movement_status: 'draft',
      editing_by_user_id: null,
      editing_since: null,
    };
    setForm(newForm);
  };
  const handleSave = async (data: StockMovement) => {
    // const url = data.id === '' ? '/ledger/stock/movements' : '/api/ledger/movements';
    // const method = data.id === '' ? 'create' : 'update';
    const period = await getPeriodByDate(new Date(data.record_date));
    if (!period) {
      alert('Период не определен!');
      return;
    }
    try {
      if (data.id === 'new') {
        const res = await createStockMovement({ ...data, period_id: period.id });
        setTimeout(() => {
          router.push('/ledger/stock');
        }, 2000);
      } else {
        const res = await updateStockMovement(data);
      }
      setIsDocumentChanged(false);
      setMessageBoxText('Документ сохранен.');
    } catch (error) {
      setMessageBoxText('Документ не сохранен! :' + String(error));
    }
    setIsShowMessageBoxCancel(false);
    setIsMessageBoxOpen(true);
  }


  return (
    <div>
      <button onClick={handleCreateMovement} className="mb-4 px-4 py-2 bg-green-600 text-white rounded">
        Добавить движение
      </button>

      {form && (
        <StockMovementEditForm
          onSave={handleSave}
          onCancel={reset}
          goods={goods}
          warehouses={warehouses}
          sections={sections}
        />
      )}

      {/* Здесь может быть таблица существующих движений */}
      <MessageBoxOKCancel />
    </div>
  );
}