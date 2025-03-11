import { sql } from "@vercel/postgres";
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
  Tenant,
  Section,
  SectionForm,
  UserForm,
  LegalEntity,
} from "./definitions";
import { formatCurrency } from "./utils";
import { User } from "./definitions";


//#region Dashboard
export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    // console.log('Fetching revenue data...');
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue>`SELECT * FROM revenue`;

    // console.log('Data fetch completed after 3 seconds.');

    return data.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await sql<LatestInvoiceRaw>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0].rows[0].count ?? "0");
    const numberOfCustomers = Number(data[1].rows[0].count ?? "0");
    const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? "0");
    const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? "0");

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchCustomers() {
  try {
    const data = await sql<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    const customers = data.rows;
    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
  }
}

//#endregion

//#region Admin

export async function fetchUsers() {
  try {
    // t.name as tenant_id - в данном запросе нужно только имя тенанта.
    // разместить его вместо id позволяет воспользоваться тем же типом User
    const data = await sql<User>`
      SELECT
        u.id as id,
        u.name as name,
        u.email as email,
        u.password as password,
        u.is_admin as is_admin,
        t.name as tenant_id
      FROM users u JOIN tenants t ON u.tenant_id = t.id
      ORDER BY tenant_id ASC
    `;
    // select u.name, t.name from users u join tenants t on u.tenant_id = t.id
    const users = data.rows;
    return users;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all users.");
  }
}

export async function fetchUserById(id: string) {
  try {
    const data = await sql<UserForm>`
      SELECT
        u.id as id,
        u.name as name,
        u.email as email,
        u.password as password,
        u.is_admin as is_admin,
        u.tenant_id as tenant_id,
        t.name as tenant_name
      FROM users u JOIN tenants t ON u.tenant_id = t.id
      WHERE u.id = ${id}
    `;

    const section = data.rows[0];
    return section;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch user by id.");
  }
}

export async function fetchTenants() {
  try {
    const data = await sql<Tenant>`
      SELECT
        id,
        name,
        active,
        description
      FROM tenants
      ORDER BY name ASC
    `;
    // WHERE active

    const tenants = data.rows;
    return tenants;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all tenants.");
  }
}

export async function fetchTenantById(id: string) {
  try {
    const data = await sql<Tenant>`
      SELECT
        id,
        name,
        active,
        description
      FROM tenants
      WHERE id = ${id}
    `;

    const tenant = data.rows[0];
    return tenant;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch tenant by id.");
  }
}

export async function fetchSections() {
  try {
    // t.name as tenant_id - в данном запросе нужно только имя тенанта.
    // разместить его вместо id позволяет воспользоваться тем же типом Section
    const data = await sql<Section>`
            SELECT
        s.id as id,
        s.name as name,
        t.name as tenant_id
      FROM sections s JOIN tenants t ON s.tenant_id = t.id
      ORDER BY tenant_id ASC
    `;

    const sections = data.rows;
    return sections;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all sections.");
  }
}

export async function fetchSectionById(id: string) {
  try {
    const data = await sql<SectionForm>`
      SELECT
        s.id as id,
        s.name as name,
        s.tenant_id as tenant_id,
        t.name as tenant_name
      FROM sections s JOIN tenants t ON s.tenant_id = t.id
      WHERE s.id = ${id}
    `;

    const section = data.rows[0];
    return section;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch section by id.");
  }
}

//#endregion

//#region LegalEntity

export async function fetchLegalEntity(id: string) {
  try {
    const data = await sql<LegalEntity>`
      SELECT
        id,
        name,
        fullname,
        inn,
        address_legal,
        phone,
        email,
        contact,
        is_customer,
        is_supplier,
        kpp
      FROM legal_entities
      WHERE id = ${id}
    `;

    const legalEntity = data.rows[0];
    return legalEntity;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch legalEntity by id.");
  }
}

export async function fetchLegalEntities() {
  try {
    const data = await sql<LegalEntity>`
      SELECT
        id,
        name,
        fullname,
        inn,
        address_legal,
        phone,
        email,
        contact,
        is_customer,
        is_supplier,
        kpp
      FROM legal_entities
      ORDER BY name ASC
    `;

    const legalEntities = data.rows;
    return legalEntities;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all legal_entities.");
  }
}

export async function fetchFilteredLegalEntities(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const legal_entities = await sql<LegalEntity>`
      SELECT
        id,
        name,
        fullname,
        inn,
        address_legal,
        phone,
        email,
        contact,
        is_customer,
        is_supplier,
        kpp
      FROM legal_entities
      WHERE
        legal_entities.name ILIKE ${`%${query}%`} OR
        legal_entities.email ILIKE ${`%${query}%`} OR
        legal_entities.fullname ILIKE ${`%${query}%`} OR
        legal_entities.address_legal ILIKE ${`%${query}%`} OR
        legal_entities.phone ILIKE ${`%${query}%`} OR
        legal_entities.inn ILIKE ${`%${query}%`} OR
        legal_entities.contact ILIKE ${`%${query}%`}
      ORDER BY name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return legal_entities.rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch Legal Entities.");
  }
}

export async function fetchLegalEntitiesPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM legal_entities
    WHERE
        legal_entities.name ILIKE ${`%${query}%`} OR
        legal_entities.email ILIKE ${`%${query}%`} OR
        legal_entities.fullname ILIKE ${`%${query}%`} OR
        legal_entities.address_legal ILIKE ${`%${query}%`} OR
        legal_entities.phone ILIKE ${`%${query}%`} OR
        legal_entities.inn ILIKE ${`%${query}%`} OR
        legal_entities.contact ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of legal_entities.");
  }
}

//#endregion