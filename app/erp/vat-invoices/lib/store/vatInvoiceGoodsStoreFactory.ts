import { create } from 'zustand';
// import { v4 as uuidv4 } from 'uuid';
import {
  createVatInvoiceGood,
  deleteVatInvoiceGood,
  updateVatInvoiceGood,
} from '../vat-invoice-goods-actions';

export interface VatInvoiceGoodItem {
  id: string; // UUID из БД или временный ID
  row_number: string;
  good_id: string;
  good_name: string;
  product_code: string;
  brand: string;
  measure_unit: string;
  quantity: string; // строка для удобства ввода
  price: string;
  discount: string;
  amount: string; // вычисляется как quantity * price * (1 - discount / 100)
  isEditing: boolean;
  isToBeDeleted: boolean;
  vat_invoice_id?: string;
  section_id?: string;
}

interface VatInvoiceGoodsStore {
  vat_invoice_goods: VatInvoiceGoodItem[];
  setInitialGoods: (goods: VatInvoiceGoodItem[]) => void;
  addNewGood: (rowNumber: string) => void;
  deleteGood: (index: number) => void;
  markGoodForDeletion: (index: number) => void;
  unmarkGoodForDeletion: (index: number) => void;
  updateGoodField: (index: number, field: keyof VatInvoiceGoodItem, value: any) => void;
  setGoodFromRefBook: (index: number, good_id: string, good_name: string, product_code: string, measure_unit: string, price_retail: number) => void;
  saveNewGoodsToDB: (vatInvoiceId: string, sectionId: string) => Promise<void>;
  deleteMarkedGoodsFromDB: () => Promise<void>;
}

export const createVatInvoiceGoodsStore = (initialGoods: VatInvoiceGoodItem[] = []) =>
  create<VatInvoiceGoodsStore>((set, get) => ({
    vat_invoice_goods: initialGoods,

    setInitialGoods: (goods) => set({ vat_invoice_goods: goods }),

    addNewGood: (rowNumber) =>
      set((state) => ({
        vat_invoice_goods: [
          ...state.vat_invoice_goods,
          {
            id: `temp-${Date.now()}`, // временный ID
            row_number: rowNumber,
            good_id: '',
            good_name: '',
            product_code: '',
            brand: '',
            measure_unit: '',
            quantity: '1',
            price: '0',
            discount: '0',
            amount: '0',
            isEditing: true,
            isToBeDeleted: false,
          },
        ],
      })),

    deleteGood: (index) =>
      set((state) => {
        const newGoods = [...state.vat_invoice_goods];
        newGoods.splice(index, 1);
        return { vat_invoice_goods: newGoods };
      }),

    markGoodForDeletion: (index) =>
      set((state) => {
        const newGoods = [...state.vat_invoice_goods];
        newGoods[index] = { ...newGoods[index], isToBeDeleted: true };
        return { vat_invoice_goods: newGoods };
      }),

    unmarkGoodForDeletion: (index) =>
      set((state) => {
        const newGoods = [...state.vat_invoice_goods];
        newGoods[index] = { ...newGoods[index], isToBeDeleted: false };
        return { vat_invoice_goods: newGoods };
      }),

    updateGoodField: (index, field, value) =>
      set((state) => {
        const newGoods = [...state.vat_invoice_goods];
        newGoods[index] = { ...newGoods[index], [field]: value };
        return { vat_invoice_goods: newGoods };
      }),

    setGoodFromRefBook: (index, good_id, good_name, product_code, measure_unit, price_retail) =>
      set((state) => {
        const newGoods = [...state.vat_invoice_goods];
        newGoods[index] = {
          ...newGoods[index],
          good_id,
          good_name,
          product_code,
          measure_unit,
          price: price_retail.toString(),
          isEditing: newGoods[index].isEditing, // сохраняем флаг редактирования
        };
        return { vat_invoice_goods: newGoods };
      }),

    saveNewGoodsToDB: async (vatInvoiceId: string, sectionId: string) => {
      const { vat_invoice_goods } = get();
      const newGoods = vat_invoice_goods.filter(
        (g) => !g.id.startsWith('temp-') && g.id.length < 36 // предполагаем, что временные ID не UUID
      );
      // На практике лучше использовать флаг isPersisted, но для простоты — по длине ID
      // В данном случае все новые строки имеют временный ID.
      // Поэтому корректнее: сохраняем только те, у которых isToBeDeleted === false и id не соответствует UUID из БД.
      // Но в нашем случае при создании формы мы получаем уже существующие записи с настоящими UUID.
      // А новые — с временными UUID.
      // Чтобы отличить, можно добавить флаг isPersisted, но для упрощения примем:
      // если id не был в исходных данных — это новая запись.
      // Однако в текущей реализации мы не храним "исходные", поэтому будем считать:
      // все строки, которые не помечены на удаление и у которых id не совпадает с теми, что были загружены из БД — новые.
      // Но так как мы не передаём исходные ID, проще: при сохранении отправляем все непомеченные на удаление.
      // А обновление делаем по наличию id в БД.
      // Для этого разделим логику:

      for (const good of vat_invoice_goods) {
        if (good.isToBeDeleted) continue;

        const payload = {
          id: good.id,
          vat_invoice_id: vatInvoiceId,
          row_number: good.row_number,
          good_id: good.good_id,
          good_name: good.good_name,
          quantity: parseFloat(good.quantity) || 0,
          price: parseFloat(good.price) || 0,
          discount: parseFloat(good.discount) || 0,
          amount: parseFloat(good.amount) || 0,
          section_id: sectionId,
          product_code: good.product_code,
          brand: good.brand,
          measure_unit: good.measure_unit,
        };

        // Если id — это UUID из БД (36 символов и содержит дефисы), то обновляем
        if (good.id.length === 36 && good.id.includes('-')) {
          await updateVatInvoiceGood(payload);
        } else {
          // Иначе создаём новую запись
          const newId = await createVatInvoiceGood(payload);
          // Обновим ID в хранилище
          set((state) => {
            const newGoods = [...state.vat_invoice_goods];
            const index = newGoods.findIndex(g => g.id === good.id);
            if (index !== -1) {
              newGoods[index] = { ...newGoods[index], id: newId };
            }
            return { vat_invoice_goods: newGoods };
          });
        }
      }
    },

    deleteMarkedGoodsFromDB: async () => {
      const { vat_invoice_goods } = get();
      const markedForDeletion = vat_invoice_goods.filter((g) => g.isToBeDeleted);
      for (const good of markedForDeletion) {
        if (good.id.length === 36 && good.id.includes('-')) {
          await deleteVatInvoiceGood(good.id);
        }
      }
      // Удалим из хранилища
      set({ vat_invoice_goods: vat_invoice_goods.filter((g) => !g.isToBeDeleted) });
    },
  }));