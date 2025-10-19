"use client";

import { useMemo, useState } from "react";
import type { Database } from "@/lib/supabase/types";

type UtilizationRow = Database["car_rental"]["Views"]["mv_car_utilization"]["Row"];

type ColumnKey = keyof Pick<
  UtilizationRow,
  "make" | "model" | "registration_no" | "rented_days" | "period_days" | "utilization_percent"
>;

type SortState = {
  key: ColumnKey;
  direction: "asc" | "desc";
};

const columns: { key: ColumnKey; label: string; align?: "left" | "right" }[] = [
  { key: "make", label: "ยี่ห้อ", align: "left" },
  { key: "model", label: "รุ่น", align: "left" },
  { key: "registration_no", label: "ทะเบียน", align: "left" },
  { key: "rented_days", label: "จำนวนวันที่ถูกเช่า", align: "right" },
  { key: "period_days", label: "จำนวนวันทั้งหมด", align: "right" },
  { key: "utilization_percent", label: "เปอร์เซ็นต์การใช้งาน", align: "right" },
];

const percentFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 2,
});

const classNames = (
  ...classes: Array<string | false | null | undefined>
) => classes.filter(Boolean).join(" ");

const isNumericColumn = (key: ColumnKey) =>
  key === "rented_days" ||
  key === "period_days" ||
  key === "utilization_percent";

const formatCellValue = (row: UtilizationRow, key: ColumnKey) => {
  const value = row[key];
  if (value === null || value === undefined) {
    return "-";
  }

  if (key === "utilization_percent") {
    return `${percentFormatter.format(Number(value))}%`;
  }

  if (typeof value === "number") {
    return `${value}`;
  }

  return value;
};

const normalizeForFilter = (display: string) =>
  display.normalize("NFKC").toLowerCase();

export function UtilizationTable({ rows }: { rows: UtilizationRow[] }) {
  const [sortState, setSortState] = useState<SortState>({
    key: "utilization_percent",
    direction: "desc",
  });
  const [filters, setFilters] = useState<Record<ColumnKey, string>>({
    make: "",
    model: "",
    registration_no: "",
    rented_days: "",
    period_days: "",
    utilization_percent: "",
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
      const valueA = a[key];
      const valueB = b[key];

      if (valueA === null || valueA === undefined) {
        return direction === "asc" ? 1 : -1;
      }
      if (valueB === null || valueB === undefined) {
        return direction === "asc" ? -1 : 1;
      }

      if (typeof valueA === "number" && typeof valueB === "number") {
        if (valueA < valueB) {
          return direction === "asc" ? -1 : 1;
        }
        if (valueA > valueB) {
          return direction === "asc" ? 1 : -1;
        }
        return 0;
      }

      const textA = valueA.toString().toLowerCase();
      const textB = valueB.toString().toLowerCase();
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

      return {
        key,
        direction: isNumericColumn(key) ? "desc" : "asc",
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
              ยังไม่มีข้อมูลการใช้งานรถในช่วง 90 วันที่ผ่านมา
            </td>
          </tr>
        ) : (
          sortedRows.map((row, index) => (
            <tr key={row.car_id ?? index} className="border-t border-slate-200">
              {columns.map((column) => (
                <td
                  key={`${column.key}-${index}`}
                  className={classNames(
                    "px-4 py-3 text-slate-700",
                    column.align === "right" ? "text-right" : "text-left",
                    column.key === "utilization_percent"
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
