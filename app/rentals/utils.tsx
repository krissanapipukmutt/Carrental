import type { RentalRow, RentalWithRelations } from "./types";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const RENTAL_STATUS_META: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  pending: {
    label: "รอดำเนินการ",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  active: {
    label: "กำลังเช่า",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  completed: {
    label: "เสร็จสิ้น",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "ยกเลิก",
    badge: "bg-slate-200 text-slate-600",
    dot: "bg-slate-400",
  },
  overdue: {
    label: "เกินกำหนด",
    badge: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
  },
};

export function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

export function formatAmount(value: string | number | null) {
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

export function getStatusBadge(status: RentalRow["rental_status"]) {
  const config =
    RENTAL_STATUS_META[status] ??
    ({
      label: status ?? "ไม่ทราบสถานะ",
      badge: "bg-slate-200 text-slate-600",
      dot: "bg-slate-400",
    } as const);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${config.badge}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dot}`} aria-hidden />
      {config.label}
    </span>
  );
}

export function getCustomerName(rental: RentalWithRelations) {
  const customer = rental.customers;
  if (!customer) {
    return "ไม่ระบุ";
  }

  return `${customer.first_name} ${customer.last_name}`.trim();
}

export function getCarLabel(rental: RentalWithRelations) {
  const car = rental.cars;
  if (!car) {
    return "ไม่ระบุ";
  }

  return `${car.make} ${car.model} (${car.registration_no})`;
}
