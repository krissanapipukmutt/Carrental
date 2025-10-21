"use client";

import { useMemo, useState } from "react";
import type { Database } from "@/lib/supabase/types";

type TopCustomerRow = Database["car_rental"]["Views"]["mv_top_customers"]["Row"];
type CustomerRecord = Database["car_rental"]["Tables"]["customers"]["Row"];

type TopCustomerWithProfile = TopCustomerRow & {
  customer: CustomerRecord | null;
};

type ColumnKey =
  | "customer"
  | "contact"
  | "rental_count"
  | "total_spent"
  | "first_rental"
  | "last_rental";

type SortState = {
  key: ColumnKey;
  direction: "asc" | "desc";
};

type ColumnDefinition = {
  key: ColumnKey;
  label: string;
  align?: "left" | "right";
  isNumeric?: boolean;
  getDisplay: (row: TopCustomerWithProfile) => string;
  getSortValue: (row: TopCustomerWithProfile) => number | string | null;
};

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
});

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
});

const normalize = (value: string) => value.normalize("NFKC").toLowerCase();

const classNames = (
  ...classes: Array<string | false | null | undefined>
) => classes.filter(Boolean).join(" ");

const columns: ColumnDefinition[] = [
  {
    key: "customer",
    label: "ลูกค้า",
    getDisplay: (row) => {
      if (!row.customer) {
        return row.customer_id ?? "ไม่ระบุ";
      }
      return `${row.customer.first_name ?? ""} ${row.customer.last_name ?? ""}`.trim() ||
        row.customer_id ?? "ไม่ระบุ";
    },
    getSortValue: (row) => {
      if (!row.customer) {
        return row.customer_id ?? "";
      }
      return `${row.customer.first_name ?? ""} ${row.customer.last_name ?? ""}`
        .trim()
        .toLowerCase();
    },
  },
  {
    key: "contact",
    label: "ข้อมูลติดต่อ",
    getDisplay: (row) => {
      if (!row.customer) {
        return "-";
      }
      const email = row.customer.email ?? "-";
      const phone = row.customer.phone ?? "-";
      return `${email} | ${phone}`;
    },
    getSortValue: (row) => row.customer?.email?.toLowerCase() ?? "",
  },
  {
    key: "rental_count",
    label: "จำนวนครั้งที่เช่า",
    align: "right",
    isNumeric: true,
    getDisplay: (row) => `${row.rental_count ?? 0}`,
    getSortValue: (row) => row.rental_count ?? 0,
  },
  {
    key: "total_spent",
    label: "ยอดใช้จ่ายรวม",
    align: "right",
    isNumeric: true,
    getDisplay: (row) => currencyFormatter.format(row.total_spent ?? 0),
    getSortValue: (row) => row.total_spent ?? 0,
  },
  {
    key: "first_rental",
    label: "เช่าครั้งแรก",
    getDisplay: (row) =>
      row.first_rental
        ? dateFormatter.format(new Date(row.first_rental))
        : "-",
    getSortValue: (row) =>
      row.first_rental ? new Date(row.first_rental).getTime() : Number.NEGATIVE_INFINITY,
  },
  {
    key: "last_rental",
    label: "เช่าล่าสุด",
    getDisplay: (row) =>
      row.last_rental ? dateFormatter.format(new Date(row.last_rental)) : "-",
    getSortValue: (row) =>
      row.last_rental ? new Date(row.last_rental).getTime() : Number.NEGATIVE_INFINITY,
  },
];

export function TopCustomersTable({ rows }: { rows: TopCustomerWithProfile[] }) {
  const [sortState, setSortState] = useState<SortState>({
    key: "rental_count",
    direction: "desc",
  });
  const [filters, setFilters] = useState<Record<ColumnKey, string>>({
    customer: "",
    contact: "",
    rental_count: "",
    total_spent: "",
    first_rental: "",
    last_rental: "",
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
    <table className="min-w-full table-fixed border-collapse text-sm">
      <thead className="bg-slate-100 text-slate-600">
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
                  className="inline-flex items-center gap-1 text-slate-700 hover:text-emerald-600"
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
        <tr className="bg-slate-50">
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
                  "w-full rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-200",
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
              ยังไม่มีประวัติการเช่าในระบบ
            </td>
          </tr>
        ) : (
          sortedRows.map((row, index) => (
            <tr key={row.customer_id ?? index} className="border-t border-slate-200">
              {columns.map((column) => (
                <td
                  key={`${column.key}-${index}`}
                  className={classNames(
                    "px-4 py-3",
                    column.align === "right" ? "text-right" : "text-left",
                    column.key === "total_spent" || column.key === "rental_count"
                      ? "font-semibold text-slate-900"
                      : "text-slate-700",
                    column.key === "first_rental" || column.key === "last_rental"
                      ? "whitespace-nowrap"
                      : undefined,
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
