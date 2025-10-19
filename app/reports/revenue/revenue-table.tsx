"use client";

import { useMemo, useState } from "react";
import type { Database } from "@/lib/supabase/types";

type RevenueRow = Database["car_rental"]["Views"]["mv_revenue_by_period"]["Row"];

type ColumnKey = keyof Pick<
  RevenueRow,
  "period" | "rental_income" | "late_fee_income" | "deposits" | "refunds" | "total_income"
>;

type SortState = {
  key: ColumnKey;
  direction: "asc" | "desc";
};

const columns: { key: ColumnKey; label: string; align?: "left" | "right" }[] = [
  { key: "period", label: "ช่วงเวลา", align: "left" },
  { key: "rental_income", label: "ค่าเช่า", align: "right" },
  { key: "late_fee_income", label: "ค่าปรับ", align: "right" },
  { key: "deposits", label: "มัดจำ", align: "right" },
  { key: "refunds", label: "คืนเงิน", align: "right" },
  { key: "total_income", label: "รวม", align: "right" },
];

const monthFormatter = new Intl.DateTimeFormat("th-TH", {
  year: "numeric",
  month: "short",
});

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
});

const isNumericColumn = (key: ColumnKey) =>
  key !== "period";

const formatCellValue = (row: RevenueRow, key: ColumnKey) => {
  const value = row[key];
  if (value === null || value === undefined) {
    return "-";
  }

  if (key === "period") {
    return monthFormatter.format(new Date(value as string));
  }

  return currencyFormatter.format(Number(value) ?? 0);
};

const getComparableValue = (row: RevenueRow, key: ColumnKey) => {
  const value = row[key];
  if (value === null || value === undefined) {
    return null;
  }

  if (key === "period") {
    return new Date(value as string).getTime();
  }

  return Number(value);
};

const normalizeForFilter = (display: string) =>
  display.normalize("NFKC").toLowerCase();

const classNames = (
  ...classes: Array<string | false | null | undefined>
) => classes.filter(Boolean).join(" ");

export function RevenueTable({ rows }: { rows: RevenueRow[] }) {
  const [sortState, setSortState] = useState<SortState>({
    key: "period",
    direction: "desc",
  });
  const [filters, setFilters] = useState<Record<ColumnKey, string>>({
    period: "",
    rental_income: "",
    late_fee_income: "",
    deposits: "",
    refunds: "",
    total_income: "",
  });

  const filteredRows = useMemo(() => {
    if (rows.length === 0) {
      return [];
    }

    return rows.filter((row) =>
      columns.every(({ key }) => {
        const filterValue = filters[key];
        if (!filterValue) {
          return true;
        }

        const display = formatCellValue(row, key);
        return normalizeForFilter(display).includes(
          normalizeForFilter(filterValue),
        );
      }),
    );
  }, [rows, filters]);

  const sortedRows = useMemo(() => {
    const slice = filteredRows.slice();
    const { key, direction } = sortState;

    slice.sort((a, b) => {
      const valueA = getComparableValue(a, key);
      const valueB = getComparableValue(b, key);

      if (valueA === null && valueB === null) {
        return 0;
      }
      if (valueA === null) {
        return direction === "asc" ? 1 : -1;
      }
      if (valueB === null) {
        return direction === "asc" ? -1 : 1;
      }

      if (valueA < valueB) {
        return direction === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
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

      return {
        key,
        direction: key === "period" ? "desc" : "asc",
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
      <thead className="bg-slate-100 text-slate-600">
        <tr>
          {columns.map((column) => {
            const isActive = sortState.key === column.key;
            return (
              <th
                key={column.key}
                className={classNames(
                  "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600",
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
                type={isNumericColumn(column.key) ? "number" : "text"}
                inputMode={isNumericColumn(column.key) ? "decimal" : "text"}
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
              ยังไม่มีข้อมูลการชำระเงินในระบบ
            </td>
          </tr>
        ) : (
          sortedRows.map((row, index) => (
            <tr key={`${row.period ?? index}`} className="border-t border-slate-200">
              {columns.map((column) => (
                <td
                  key={`${column.key}-${index}`}
                  className={classNames(
                    "px-4 py-3 text-slate-700",
                    column.align === "right" ? "text-right" : "text-left",
                    column.key === "total_income"
                      ? "font-semibold text-slate-900"
                      : undefined,
                  )}
                >
                  {formatCellValue(row, column.key)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
