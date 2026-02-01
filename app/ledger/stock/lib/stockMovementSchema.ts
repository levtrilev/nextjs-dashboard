
import { z } from 'zod';

const optionalDateString = z.string().datetime().optional().nullable();

export const stockMovementSchema = z.object({
  id: z.string().uuid(),
  doc_id: z.string().uuid(),
  doc_type: z.string().min(1),
  timestamptz: z.string().datetime().optional().nullable(),
  section_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid(),
  period_id: z.string().uuid(),
  record_date: z.string().datetime(), // ISO 8601
  record_text: z.string().optional(),
  record_in_out: z.enum(['in', 'out']),
  quantity: z.number().positive(),
  amount: z.number().nonnegative(),
  good_id: z.string().uuid(),
  warehouse_id: z.string().uuid(),
  editing_by_user_id: z.string().uuid().optional().nullable(),
  editing_since: optionalDateString,
  movement_status: z.enum(['draft', 'posted', 'canceled']),
});

export const createStockMovementSchema = stockMovementSchema.omit({ id: true }).extend({
  id: z.string().uuid().optional(), // может генерироваться на сервере
});

export const updateStockMovementSchema = stockMovementSchema.pick({
  id: true,
  record_date: true,
  record_text: true,
  record_in_out: true,
  quantity: true,
  amount: true,
  good_id: true,
  warehouse_id: true,
  movement_status: true,
});