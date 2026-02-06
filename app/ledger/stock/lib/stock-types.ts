

export interface StockBalance {
  warehouse_id: string;
  good_id: string;
  period_id: string;
  period_end_date: Date | string;
  balance_quantity: string | number;
  balance_amount: string | number;
}
export interface StockBalanceForm extends StockBalance {
  warehouse_name?: string;
  good_name?: string;
  good_product_code?: string;
  period_name?: string;
}

export interface StockTurnover {
  period_id: string
  period_name: string
  period_date_start: Date
  period_date_end: Date
  warehouse_id: string
  warehouse_name: string
  good_id: string
  good_name: string
  good_code: string | null
  opening_quantity: number
  opening_amount: number
  incoming_quantity: number
  incoming_amount: number
  outgoing_quantity: number
  outgoing_amount: number
  closing_quantity: number
  closing_amount: number
}
// interface StockBalance {
//   warehouse_id: string;      // uuid → string
//   good_id: string;           // uuid → string
//   period_id: string;         // uuid → string
//   period_end_date: Date;     // date → Date
//   balance_quantity: string;  // numeric(15,3) → string (для точности)
//   balance_amount: string;    // numeric(15,3) → string (для точности)
// }

export interface Warehouse {
  id: string;
  name: string;
}

export interface Good {
  id: string;
  name: string;
  code?: string;
}

export interface Period {
  id: string;
  name: string;
  date_end: Date | string;
}

