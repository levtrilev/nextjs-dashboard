import { DocUserPermissions, Revenue } from "./definitions";

export const checkReadonly = (
  userPermissions: DocUserPermissions,
  document: { author_id?: string },
  pageUserId?: string,
): boolean => {
  return userPermissions.full_access
    ? false
    : userPermissions.editor
      ? false
      : userPermissions.author && document.author_id === pageUserId
        ? false
        : userPermissions.reader
          ? true
          : true;
};

export const formatCurrencyUSD = (amount: number) => {
  return (amount / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

export const formatDateToLocal = (
  dateStr: string,
  locale: string = "en-US",
) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export const generateYAxis = (revenue: Revenue[]) => {
  // Calculate what labels we need to display on the y-axis
  // based on highest record and in 1000s
  const yAxisLabels = [];
  const highestRecord = Math.max(...revenue.map((month) => month.revenue));
  const topLabel = Math.ceil(highestRecord / 1000) * 1000;

  for (let i = topLabel; i >= 0; i -= 1000) {
    yAxisLabels.push(`$${i / 1000}K`);
  }

  return { yAxisLabels, topLabel };
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};
export const formatDateForInput = (date: Date | string | undefined) => {
  if (!date) return ""; // Если дата пустая, возвращаем пустую строку
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Месяцы начинаются с 0
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const utcISOToLocalDateTimeInput = (
  isoString: string | null | undefined,
): string => {
  if (!isoString) return "";
  const date = new Date(isoString); // корректно парсит UTC
  // Форматируем как местное время, но в виде YYYY-MM-DDTHH:mm
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

// export function formatNumber(value: number): string {
//   return new Intl.NumberFormat('ru-RU', {
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 3
//   }).format(value)
// }
export const formatNumber = (value: string | number): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toLocaleString("ru-RU", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
};

export const formatCurrencyRUB = (value: string | number): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: "currency",
    currency: "RUB",
  });
};

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// export const formatDate = (date: Date | string): string => {
//   try {
//     const d = typeof date === "string" ? new Date(date) : date;
//     return format(d, "dd.MM.yyyy", { locale: ru });
//   } catch {
//     return String(date);
//   }
// };