export const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

export function formatCurrency(
  value: number | string | null | undefined,
): string {
  if (value === null || value === undefined) {
    return "-";
  }

  const numeric =
    typeof value === "string" ? Number.parseFloat(value) : value;

  if (Number.isNaN(numeric)) {
    return "-";
  }

  return currencyFormatter.format(numeric);
}

export const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
});
