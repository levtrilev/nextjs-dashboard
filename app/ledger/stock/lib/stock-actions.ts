"use server";
import pool from "@/db";
import { revalidatePath } from "next/cache";
import { LedgerRecord, Period, StockMovement } from "@/app/lib/definitions";
import { StockBalanceForm } from "./stock-types";

export type StockMovementForm = StockMovement & {
  doc_name: string;
  section_name: string;
  period_name: string;
  good_name: string;
  warehouse_name: string;
};

export async function updateStockMovement(StockMovement: StockMovement) {
  const data = StockMovement;
  try {
    await pool.query(`
    UPDATE stock_movements
    SET
      record_date = ${data.record_date},
      record_text = ${data.record_text},
      record_in_out = ${data.record_in_out},
      quantity = ${data.quantity},
      amount = ${data.amount},
      good_id = ${data.good_id},
      warehouse_id = ${data.warehouse_id},
      movement_status = ${data.movement_status}
    WHERE id = ${data.id}
  `);

    // revalidatePath(`/ledger/stock`);
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to update stock movement:" + String(err));
  }
}

export async function fetchStockMovement(id: string, current_sections: string) {
  try {
    const result = await pool.query<StockMovementForm>(
      `
      WITH your_stock_movements AS ( SELECT * FROM stock_movements WHERE section_id = ANY ($1::uuid[]))
      
      SELECT
      stm.id, stm.doc_id, stm.doc_type, stm.timestamptz, stm.section_id, stm.tenant_id, stm.user_id,
      stm.period_id, stm.record_date, stm.record_text, stm.record_in_out, stm.quantity, stm.amount,
      stm.good_id, stm.warehouse_id, stm.editing_by_user_id, stm.editing_since, stm.movement_status
      FROM your_stock_movements stm 
      LEFTJOIN sections s ON stm.section_id = s.id
      WHERE stm.id = $2
    `,
      [current_sections, id],
    );

    return result.rows[0];
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch stock movement by id:" + String(err));
  }
}

export async function createStockMovement(
  StockMovement: StockMovement,
): Promise<string> {
  const data = StockMovement;
  try {
    // SAFE: Parameterized query with placeholders
    const result = await pool.query(
      `INSERT INTO stock_movements (
    doc_id, doc_type, section_id, tenant_id, user_id,
    period_id, record_date, record_text, record_in_out, quantity, amount,
    good_id, warehouse_id, editing_by_user_id, editing_since, movement_status
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
  ) RETURNING id`,
      [
        data.doc_id, // UUID string → auto-quoted by driver
        data.doc_type, // String
        // new Date().toISOString(), // ⚠️ MUST be provided (see note below)
        data.section_id, // UUID
        data.tenant_id, // UUID
        data.user_id, // UUID
        data.period_id, // UUID
        data.record_date, // ISO string (e.g., "2026-01-31T12:34:56.789Z")
        data.record_text, // Cyrillic text → safely handled
        data.record_in_out, // "in"/"out"
        data.quantity, // Number
        data.amount, // Number
        data.good_id, // UUID
        data.warehouse_id, // UUID
        data.editing_by_user_id, // null → becomes SQL NULL
        data.editing_since, // null → becomes SQL NULL
        data.movement_status, // "draft"
      ],
    );
    // const result = await pool.query(`
    //     INSERT INTO sections (name, tenant_id)
    //     VALUES ($1, $2)
    //     RETURNING id
    //   `, [newSection.name, newSection.tenant_id]);
    const newStockMovementId = result.rows[0].id;
    return newStockMovementId;
  } catch (error) {
    console.error("Failed to create StockMovement:", error);
    throw new Error("Failed to create StockMovement: " + String(error));
  }
  // revalidatePath("/ledger/stock");}
}
export async function deleteStockMovement(id: string) {
  try {
    await pool.query(
      `
      DELETE FROM stock_movements 
      WHERE id = $1
    `,
      [id],
    );
  } catch (error) {
    console.error("Database Error, Failed to Delete StockMovement:", error);
    throw new Error(
      "Database Error: Failed to Delete StockMovement:" + String(error),
    );
  }
  // revalidatePath("/ledger/stock");
}

export async function getStockBalances(current_sections: string) {
  console.log("getStockBalances current_sections", current_sections);
  try {
    const result = await pool.query<StockBalanceForm>(
      `
  WITH 
    your_stock_movements AS (
      SELECT * 
      FROM stock_movements 
      WHERE section_id = ANY($1::uuid[])
        AND movement_status = 'active'
    ),
    period_movements AS (
      SELECT
        sm.warehouse_id,
        sm.good_id,
        sm.period_id,
        p.date_end,
        SUM(
          CASE sm.record_in_out
            WHEN 'in'  THEN sm.quantity
            WHEN 'out' THEN -sm.quantity
            ELSE 0
          END
        ) AS period_quantity,
        SUM(
          CASE sm.record_in_out
            WHEN 'in'  THEN sm.amount
            WHEN 'out' THEN -sm.amount
            ELSE 0
          END
        ) AS period_amount
      FROM your_stock_movements sm
      JOIN periods p ON p.id = sm.period_id
      GROUP BY sm.warehouse_id, sm.good_id, sm.period_id, p.date_end
    ),
    cumulative_balances AS (
      SELECT
        warehouse_id,
        good_id,
        period_id,
        date_end,
        SUM(period_quantity) OVER (
          PARTITION BY warehouse_id, good_id
          ORDER BY date_end, period_id
          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS balance_quantity,
        SUM(period_amount) OVER (
          PARTITION BY warehouse_id, good_id
          ORDER BY date_end, period_id
          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS balance_amount
      FROM period_movements
    )
  SELECT
    cb.warehouse_id,
    cb.good_id,
    cb.period_id,
    cb.date_end AS period_end_date,
    cb.balance_quantity,
    cb.balance_amount,
    COALESCE(p.name, '') AS period_name,
    COALESCE(g.name, '') AS good_name,
    COALESCE(g.product_code, '') AS good_product_code,
    COALESCE(w.name, '') AS warehouse_name
  FROM cumulative_balances cb
  LEFT JOIN periods p ON cb.period_id = p.id
  LEFT JOIN goods g ON cb.good_id = g.id
  LEFT JOIN warehouses w ON cb.warehouse_id = w.id
  ORDER BY cb.warehouse_id, cb.date_end DESC, cb.good_id
  `,
      [current_sections],
    );
    return result.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch stock balances:" + String(error));
  }
}

export async function getFullStockBalances(current_sections: string) {
  // console.log("getStockBalances current_sections", current_sections);
  const date_end_of_report = new Date();
  try {
    const result = await pool.query<StockBalanceForm>(
      `
WITH 
  your_stock_movements AS (
    SELECT * 
    FROM stock_movements 
    WHERE section_id = ANY($1::uuid[])
      AND movement_status = 'active'
  ),
  period_movements AS (
    SELECT
      sm.warehouse_id,
      sm.good_id,
      sm.period_id,
      p.date_end,
      SUM(
        CASE sm.record_in_out
          WHEN 'in'  THEN sm.quantity
          WHEN 'out' THEN -sm.quantity
          ELSE 0
        END
      ) AS period_quantity,
      SUM(
        CASE sm.record_in_out
          WHEN 'in'  THEN sm.amount
          WHEN 'out' THEN -sm.amount
          ELSE 0
        END
      ) AS period_amount
    FROM your_stock_movements sm
    JOIN periods p ON p.id = sm.period_id
    WHERE p.date_start <= $2::timestamp  -- ← Верхняя граница анализа
    GROUP BY sm.warehouse_id, sm.good_id, sm.period_id, p.date_end
  ),
  -- ТОЧНО определяем первый период для каждой комбинации (только среди периодов до $2)
  first_period AS (
    SELECT DISTINCT ON (warehouse_id, good_id)
      warehouse_id,
      good_id,
      period_id AS first_period_id,
      date_end AS first_date_end
    FROM period_movements
    ORDER BY warehouse_id, good_id, date_end, period_id
  ),
  -- Генерируем последовательность периодов: от первого движения до верхней границы $2
  period_grid AS (
    SELECT 
      fp.warehouse_id,
      fp.good_id,
      p.id AS period_id,
      p.date_end,
      p.name AS period_name
    FROM first_period fp
    JOIN periods p 
      ON (p.date_end > fp.first_date_end 
          OR (p.date_end = fp.first_date_end AND p.id >= fp.first_period_id))
      AND p.date_start <= $2::timestamp  -- ← Верхняя граница для матрицы периодов
  ),
  -- Заполняем движения (нули для периодов без движений)
  movements_filled AS (
    SELECT
      pg.warehouse_id,
      pg.good_id,
      pg.period_id,
      pg.date_end,
      pg.period_name,
      COALESCE(pm.period_quantity, 0) AS period_quantity,
      COALESCE(pm.period_amount, 0) AS period_amount
    FROM period_grid pg
    LEFT JOIN period_movements pm 
      ON pm.warehouse_id = pg.warehouse_id
      AND pm.good_id = pg.good_id
      AND pm.period_id = pg.period_id
  ),
  cumulative_balances AS (
    SELECT
      warehouse_id,
      good_id,
      period_id,
      date_end,
      period_name,
      SUM(period_quantity) OVER (
        PARTITION BY warehouse_id, good_id
        ORDER BY date_end, period_id
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
      ) AS balance_quantity,
      SUM(period_amount) OVER (
        PARTITION BY warehouse_id, good_id
        ORDER BY date_end, period_id
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
      ) AS balance_amount
    FROM movements_filled
  )
SELECT
  cb.warehouse_id,
  cb.good_id,
  cb.period_id,
  cb.date_end AS period_end_date,
  cb.balance_quantity,
  cb.balance_amount,
  COALESCE(cb.period_name, '') AS period_name,
  COALESCE(g.name, '') AS good_name,
  COALESCE(g.product_code, '') AS good_product_code,
  COALESCE(w.name, '') AS warehouse_name
FROM cumulative_balances cb
LEFT JOIN goods g ON cb.good_id = g.id
LEFT JOIN warehouses w ON cb.warehouse_id = w.id
ORDER BY cb.warehouse_id, cb.date_end DESC, cb.good_id;
  `,
      [current_sections, date_end_of_report],
    );
    return result.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch stock balances:" + String(error));
  }
}

export async function getPeriodByDate(date: Date) {
  try {
    const result = await pool.query<Period>(
      `
      SELECT id, name, date_start, date_end
      FROM periods
      WHERE date_end >= $1 AND date_start <= $1
    `,
      [date],
    );
    if (result.rows.length === 1) {
      return result.rows[0];
    }
    console.error("getPeriodByDate Database Error: result.rows.length <> 1");
    return null;
  } catch (error) {
    console.error("getPeriodByDate Database Error:", error);
    throw new Error("Failed to fetch period by date:" + String(error));
  }
}

export async function fetchPeriods() {
  try {
    const result = await pool.query<Period>(
      `
      SELECT id, name, date_start, date_end
      FROM periods
    `,
    );
    if (result.rows.length === 0) {
      console.error("getPeriodByDate : result.rows.length === 0");
      return [];
    }

    return result.rows;
  } catch (error) {
    console.error("getPeriodByDate Database Error:", error);
    throw new Error("Failed to fetch period by date:" + String(error));
  }
}

export async function createStockMovements(
  ledgerRecord: LedgerRecord,
  stockMovements: StockMovement[],
) {
  if (stockMovements.length === 0) {
    return {
      success: false,
      ledgerId: String(""),
      movementsCount: 0,
    };
  }
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Вставка в ledger_records
    const ledgerResult = await client.query(
      `INSERT INTO public.ledger_records (
        record_date, doc_type, doc_id, record_text, section_id, tenant_id
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id`,
      [
        ledgerRecord.record_date,
        ledgerRecord.doc_type,
        ledgerRecord.doc_id,
        ledgerRecord.record_text,
        ledgerRecord.section_id,
        ledgerRecord.tenant_id,
        // ledgerRecord.timestamptz || new Date().toISOString(),
      ],
    );

    const ledgerId = ledgerResult.rows[0].id;

    // Пакетная вставка в stock_movements
    if (stockMovements.length > 0) {
      const placeholders = stockMovements
        .map((_, idx) => {
          const offset = idx * 17 + 1;
          return `(${Array.from({ length: 17 }, (_, i) => `$${offset + i}`).join(", ")})`;
        })
        .join(", ");

      const queryValues = stockMovements.flatMap((m) => [
        m.doc_id,
        m.doc_type,
        m.section_id,
        m.tenant_id,
        m.user_id,
        m.period_id,
        m.record_text,
        m.record_in_out,
        m.quantity,
        m.amount,
        m.good_id,
        m.warehouse_id,
        m.editing_by_user_id,
        m.editing_since,
        m.movement_status,
        m.record_date,
        ledgerId,
      ]);

      await client.query(
        `
        INSERT INTO public.stock_movements (
          doc_id,
          doc_type,
          section_id,
          tenant_id,
          user_id,
          period_id,
          record_text,
          record_in_out,
          quantity,
          amount,
          good_id,
          warehouse_id,
          editing_by_user_id,
          editing_since,
          movement_status,
          record_date,
          ledger_record_id
        ) VALUES ${placeholders}
        `,
        queryValues,
      );
    }

    await client.query(
      `
      UPDATE public.vat_invoices
	      SET ledger_record_id=$2
	      WHERE id=$1
    `,
      [ledgerRecord.doc_id, ledgerId],
    );

    await client.query("COMMIT");
    revalidatePath("/ledger/stock");

    return {
      success: true,
      ledgerId: String(ledgerId),
      movementsCount: stockMovements.length,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Ошибка:", error);
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteLedgerRecordWithMovements(ledgerRecordId: string, vat_invoice_doc_id?: string) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Проверка существования записи
    const checkResult = await client.query(
      "SELECT id FROM public.ledger_records WHERE id = $1",
      [ledgerRecordId],
    );

    if (checkResult.rows.length === 0) {
      await client.query("ROLLBACK");
      client.release();

      return {
        success: false,
        notFound: true,
        deletedMovementsCount: 0,
        message: "Запись не найдена",
      };
    }

    // 2. Подсчёт связанных движений
    const countResult = await client.query(
      "SELECT COUNT(*) as movement_count FROM public.stock_movements WHERE ledger_record_id = $1",
      [ledgerRecordId],
    );

    const movementCount = parseInt(countResult.rows[0].movement_count);

    // 3. Удаление движений склада
    if (movementCount > 0) {
      await client.query(
        "DELETE FROM public.stock_movements WHERE ledger_record_id = $1",
        [ledgerRecordId],
      );
    }

    // 4. Удаление записи учёта
    await client.query("DELETE FROM public.ledger_records WHERE id = $1", [
      ledgerRecordId,
    ]);

    // 5. Удаление ссылки из документа
    if (vat_invoice_doc_id) {
      await client.query(
        `
        UPDATE public.vat_invoices
        SET ledger_record_id=$2
        WHERE id=$1
      `,
        [vat_invoice_doc_id, '00000000-0000-0000-0000-000000000000'],
      );
    }

    await client.query("COMMIT");
    client.release();

    // revalidatePath('/stock');
    revalidatePath("/ledger/stock");

    return {
      success: true,
      notFound: false,
      deletedMovementsCount: movementCount,
      message: `Удалена запись учёта и ${movementCount} связанных движений stock_movements`,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    client.release();

    console.error("Ошибка при удалении записи учёта:", error);

    return {
      success: false,
      notFound: false,
      deletedMovementsCount: 0,
      message: error instanceof Error ? error.message : "Неизвестная ошибка",
    };
  }
}
