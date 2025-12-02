// This file contains type definitions for your data.
// These types may be generated automatically if you're using an ORM such as Prisma.

import { DateTime } from "next-auth/providers/kakao";
export type Permission = {
  id: string;
  role_id: string;
  role_name: string;
  doctype: string;
  doctype_name: string;
  full_access: boolean;
  author: boolean;
  can_delete: boolean;
  can_recall: boolean;
  reader: boolean;
  access_by_tags: boolean;
  or_tags: string[];
  and_tags: string[];
  no_tags: string[];
  tenant_id: string;
  tenant_name: string;
}
export type MessageBox = {
  isMessageBoxOpen: boolean;
  messageBoxText: string;
  isShowMessageBoxCancel: boolean;
  isOKButtonPressed: boolean;
  isCancelButtonPressed: boolean;
}
export type Task ={
  id: string;
  name: string;
  date_start: Date | string;
  date_end: Date | string;
  task_schedule_id: string | null;
  is_periodic: boolean;
  period_days: number | null;
  username?: string;
  timestamptz?: string;
  date_created?: Date;
};
export type TaskForm ={
  id: string;
  name: string;
  date_start: Date | string;
  date_end: Date | string;
  task_schedule_id: string | null;
  is_periodic: boolean;
  period_days: number | null;
  username?: string;
  timestamptz?: string;
  date_created?: Date;
};

export type TaskSchedule = {
  id: string;
  name: string;
  description: string;
  premise_id: string;
  schedule_owner_id: string;
  date: Date;
  date_start: Date;
  date_end: Date;
  section_id: string;
  username?: string;
  timestamptz?: string;
  date_created?: Date;
};

export type TaskScheduleForm = {
  id: string;
  name: string;
  description: string;
  premise_id: string;
  schedule_owner_id: string;
  date: Date;
  date_start: Date;
  date_end: Date;
  section_id: string;
  username?: string;
  timestamptz?: string;
  date_created?: Date;
  schedule_owner_name: string;
  section_name: string;
  premise_name: string;
  // tasks: Task[];
};

export type Premise = {
  id: string;
  name: string;
  description: string;
  cadastral_number: string;
  square: number;
  address: string;
  address_alt?: string;
  type: string;
  status: string;
  status_until: Date;
  region_id: string;
  owner_id: string;
  operator_id: string;
  section_id: string;
  username?: string;
  timestamptz?: string;
  date_created?: Date;
};
export type PremiseForm = {
  id: string;
  name: string;
  description: string;
  cadastral_number: string;
  square: number;
  address: string;
  address_alt?: string;
  type: string;
  status: string;
  status_until: Date;
  region_id: string;
  owner_id: string;
  operator_id: string;
  section_id: string;
  username?: string;
  date_created?: Date;
  region_name: string;
  owner_name: string;
  operator_name: string;
  section_name: string;
};
export type Role = {
  id: string;
  name: string;
  description: string;
  tenant_id: string;
  section_ids: string;
  section_names: string;
};
export type RoleForm = {
  id: string;
  name: string;
  description: string;
  tenant_id: string;
  tenant_name: string;
  section_ids?: string;
  section_names?: string;
};
export type Region = {
  id: string;
  name: string;
  capital: string;
  area: string;
  code: string;
  section_id: string;
  username: string;
  timestamptz: string;
  date: DateTime;
};
export type RegionForm = {
  id: string;
  name: string;
  capital: string;
  area: string;
  code: string;
  section_id: string;
  username: string;
  timestamptz: string;
  date: DateTime;
  section_name: string;
};
export type LegalEntity = {
  id: string;
  name: string;
  fullname: string;
  inn: string;
  address_legal: string;
  phone: string;
  email: string;
  contact: string;
  is_customer: boolean;
  is_supplier: boolean;
  kpp: string;
  region_id: string;
  section_id: string;
};

export type LegalEntityForm = {
  id: string;
  name: string;
  fullname: string;
  inn: string;
  address_legal: string;
  phone: string;
  email: string;
  contact: string;
  is_customer: boolean;
  is_supplier: boolean;
  kpp: string;
  region_id: string;
  section_id: string;
  region_name: string;
  section_name: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  is_admin: boolean;
  is_superadmin: boolean;
  tenant_id: string;
  role_ids: string;
};

export type UserForm = {
  id: string;
  name: string;
  email: string;
  password?: string;
  is_admin: boolean;
  is_superadmin: boolean;
  tenant_id: string;
  tenant_name: string;
  role_ids: string;
};

export type Tenant = {
  id: string;
  name: string;
  active: boolean;
  description: string;
};

export type Section = {
  id: string;
  name: string;
  tenant_id: string;
};
export type SectionForm = {
  id: string;
  name: string;
  tenant_id: string;
  tenant_name: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

export type Invoice = {
  id: string;
  customer_id: string;
  amount: number;
  date: string;
  // In TypeScript, this is called a string union type.
  // It means that the "status" property can only be one of the two strings: 'pending' or 'paid'.
  status: "pending" | "paid";
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestInvoiceRaw = Omit<LatestInvoice, "amount"> & {
  amount: number;
};

export type InvoicesTable = {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  image_url: string;
  date: string;
  amount: number;
  status: "pending" | "paid";
};

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type CustomerField = {
  id: string;
  name: string;
};

export type InvoiceForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: "pending" | "paid";
};
