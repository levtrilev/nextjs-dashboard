import { createVatInvoiceGoodsStore, VatInvoiceGoodItem } from './vatInvoiceGoodsStoreFactory';

// Карта хранилищ: vatInvoiceId -> useStore
const vatInvoiceGoodsStoreMap = new Map<string, ReturnType<typeof createVatInvoiceGoodsStore>>();

/**
 * Возвращает хук Zustand-хранилища для указанного vatInvoiceId.
 * Если хранилище не существует — создаёт его.
 */
export const getVatInvoiceGoodsStore = (vatInvoiceId: string) => {
  if (!vatInvoiceGoodsStoreMap.has(vatInvoiceId)) {
    const store = createVatInvoiceGoodsStore();
    vatInvoiceGoodsStoreMap.set(vatInvoiceId, store);
  }
  return vatInvoiceGoodsStoreMap.get(vatInvoiceId)!;
};

/**
 * Уничтожает Zustand-хранилище для указанного vatInvoiceId.
 * Используется при размонтировании компонента.
 */
export const destroyVatInvoiceGoodsStore = (vatInvoiceId: string) => {
  if (vatInvoiceGoodsStoreMap.has(vatInvoiceId)) {
    vatInvoiceGoodsStoreMap.delete(vatInvoiceId);
  }
};

/**
 * Инициализирует хранилище с начальными данными.
 * Обычно вызывается один раз при загрузке формы.
 */
export const initializeVatInvoiceGoodsStore = (
  vatInvoiceId: string,
  initialGoods: VatInvoiceGoodItem[]
) => {
  const store = getVatInvoiceGoodsStore(vatInvoiceId);
  store.getState().setInitialGoods(initialGoods);
};