"use client";

import { useMemo, useState } from "react";
import type { Database } from "@/lib/supabase/types";

type OverdueRow = Database["car_rental"]["Views"]["mv_overdue_rentals"]["Row"];
type OverdueWithRelations = OverdueRow & {
  cars: {
    make: string | null;
    model: string | null;
    registration_no: string | null;
  } | null;
  customers: {
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  } | null;
};

type ColumnKey =
  | "contract_no"
  | "customer"
  | "car"
  | "return_datetime"
  | "overdue_days"
  | "late_fee";

type SortState = {
  key: ColumnKey;
  direction: "asc" | "desc";
};

type ColumnDefinition = {
  key: ColumnKey;
  label: string;
  align?: "left" | "right";
  isNumeric?: boolean;
  getDisplay: (row: OverdueWithRelations) => string;
  getSortValue: (row: OverdueWithRelations) => number | string | null;
};

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
});

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
});

const normalize = (value: string) => value.normalize("NFKC").toLowerCase();

const classNames = (
  ...classes: Array<string | false | null | undefined>
) => classes.filter(Boolean).join(" ");

const columns: ColumnDefinition[] = [
  {
    key: "contract_no",
    label: "เลขสัญญา",
    getDisplay: (row) => row.contract_no ?? "ไม่ระบุ",
    getSortValue: (row) => row.contract_no?.toLowerCase() ?? "",
  },
  {
    key: "customer",
    label: "ลูกค้า",
    getDisplay: (row) => {
      const customer = row.customers;
      if (!customer) {
        return row.customer_id ?? "ไม่ระบุ";
      }
      const name = `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim();
      const phone = customer.phone ? ` (${customer.phone})` : "";
      return `${name || row.customer_id ?? "ไม่ระบุ"}${phone}`;
    },
    getSortValue: (row) => {
      const customer = row.customers;
      if (!customer) {
        return row.customer_id ?? "";
      }
      return `${customer.first_name ?? ""} ${customer.last_name ?? ""}`
        .trim()
        .toLowerCase();
    },
  },
  {
    key: "car",
    label: "รถ",
    getDisplay: (row) => {
      const car = row.cars;
      if (!car) {
        return row.car_id ?? "ไม่ระบุ";
      }
      const name = `${car.make ?? ""} ${car.model ?? ""}`.trim();
      const base = name || row.car_id ?? "ไม่ระบุ";
      return `${base}${car.registration_no ? ` (${car.registration_no})` : ""}`;
    },
    getSortValue: (row) => {
      const car = row.cars;
      if (!car) {
        return row.car_id ?? "";
      }
      return `${car.make ?? ""} ${car.model ?? ""}`.trim().toLowerCase();
    },
  },
  {
    key: "return_datetime",
    label: "กำหนดคืน",
    getDisplay: (row) =>
      row.return_datetime
        ? dateFormatter.format(new Date(row.return_datetime))
        : "-",
    getSortValue: (row) =>
      row.return_datetime
        ? new Date(row.return_datetime).getTime()
        : Number.NEGATIVE_INFINITY,
  },
  {
    key: "overdue_days",
    label: "วันค้าง",
    align: "right",
    isNumeric: true,
    getDisplay: (row) => `${row.overdue_days ?? 0} วัน`,
    getSortValue: (row) => row.overdue_days ?? 0,
  },
  {
    key: "late_fee",
    label: "ค่าปรับสะสม",
    align: "right",
    isNumeric: true,
    getDisplay: (row) => currencyFormatter.format(row.late_fee ?? 0),
    getSortValue: (row) => row.late_fee ?? 0,
  },
];

export function OverdueTable({ rows }: { rows: OverdueWithRelations[] }) {
  const [sortState, setSortState] = useState<SortState>({
    key: "overdue_days",
    direction: "desc",
  });
  const [filters, setFilters] = useState<Record<ColumnKey, string>>({
    contract_no: "",
    customer: "",
    car: "",
    return_datetime: "",
    overdue_days: "",
    late_fee: "",
  });

  const filteredRows = useMemo(() => {
    if (rows.length === 0) {
      return [];
    }

    return rows.filter((row) =>
      columns.every((column) => {
        const filter = filters[column.key];
        if (!filter) {
          return true;
        }

        return normalize(column.getDisplay(row)).includes(normalize(filter));
      }),
    );
  }, [rows, filters]);

  const sortedRows = useMemo(() => {
    const slice = filteredRows.slice();
    const { key, direction } = sortState;
    const column = columns.find((col) => col.key === key);

    if (!column) {
      return slice;
    }

    slice.sort((a, b) => {
      const valueA = column.getSortValue(a);
      const valueB = column.getSortValue(b);

      if (valueA === valueB) {
        return 0;
      }

      if (valueA === null || valueA === undefined) {
        return direction === "asc" ? 1 : -1;
      }
      if (valueB === null || valueB === undefined) {
        return direction === "asc" ? -1 : 1;
      }

      if (typeof valueA === "number" && typeof valueB === "number") {
        return direction === "asc" ? valueA - valueB : valueB - valueA;
      }

      const textA = valueA.toString();
      const textB = valueB.toString();
      if (textA < textB) {
        return direction === "asc" ? -1 : 1;
      }
      if (textA > textB) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return slice;
  }, [filteredRows, sortState]);

  const toggleSort = (key: ColumnKey) => {
    setSortState((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }

      const target = columns.find((column) => column.key === key);
      return {
        key,
        direction: target?.isNumeric ? "desc" : "asc",
      };
    });
  };

  const handleFilterChange = (key: ColumnKey, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <table className="min-w-full table-auto border-collapse text-sm">
      <thead className="bg-rose-100 text-rose-700">
        <tr>
          {columns.map((column) => {
            const isActive = sortState.key === column.key;
            return (
              <th
                key={column.key}
                className={classNames(
                  "px-4 py-3 text-xs font-semibold uppercase tracking-wide",
                  column.align === "right" ? "text-right" : "text-left",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleSort(column.key)}
                  className="inline-flex items-center gap-1 text-rose-700 hover:text-rose-900"
                >
                  <span>{column.label}</span>
                  <span
                    aria-hidden
                    className={classNames(
                      "text-[10px] transition-transform transform",
                      isActive ? "opacity-100" : "opacity-30",
                      isActive && sortState.direction === "desc"
                        ? "rotate-180"
                        : "",
                    )}
                  >
                    ▲
                  </span>
                </button>
              </th>
            );
          })}
        </tr>
        <tr className="bg-rose-50 text-rose-700">
          {columns.map((column) => (
            <td key={`${column.key}-filter`} className="px-4 py-2">
              <input
                type={column.isNumeric ? "number" : "text"}
                inputMode={column.isNumeric ? "decimal" : "text"}
                value={filters[column.key]}
                onChange={(event) =>
                  handleFilterChange(column.key, event.target.value)
                }
                placeholder="กรอง..."
                className={classNames(
                  "w-full rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-700 placeholder:text-rose-400 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-200",
                  column.align === "right" ? "text-right" : "text-left",
                )}
              />
            </td>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedRows.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="px-4 py-6 text-center text-sm text-slate-500"
            >
              ไม่มีสัญญาที่ค้างคืนในขณะนี้
            </td>
          </tr>
        ) : (
          sortedRows.map((row, index) => (
            <tr key={row.rental_id ?? index} className="border-t border-slate-200">
              {columns.map((column) => (
                <td
                  key={`${column.key}-${index}`}
                  className={classNames(
                    "px-4 py-3",
                    column.align === "right" ? "text-right" : "text-left",
                    column.key === "overdue_days" || column.key === "late_fee"
                      ? "font-semibold text-rose-700"
                      : "text-slate-700",
                  )}
                >
                  {column.getDisplay(row)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
