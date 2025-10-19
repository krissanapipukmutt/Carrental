"use client";

import { useMemo, useState } from "react";
import type { Database } from "@/lib/supabase/types";

type MaintenanceRow = Database["car_rental"]["Views"]["mv_maintenance_history"]["Row"];
type MaintenanceWithCar = MaintenanceRow & {
  cars: {
    registration_no: string | null;
    make: string | null;
    model: string | null;
    status: string | null;
  } | null;
};

type ColumnKey =
  | "vehicle"
  | "registration_no"
  | "total_jobs"
  | "total_cost"
  | "last_service_date"
  | "status";

type SortState = {
  key: ColumnKey;
  direction: "asc" | "desc";
};

type ColumnDefinition = {
  key: ColumnKey;
  label: string;
  align?: "left" | "right";
  isNumeric?: boolean;
  getDisplay: (row: MaintenanceWithCar) => string;
  getSortValue: (row: MaintenanceWithCar) => number | string | null;
};

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
});

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
});

const normalize = (value: string) =>
  value.normalize("NFKC").toLowerCase();

const classNames = (
  ...classes: Array<string | false | null | undefined>
) => classes.filter(Boolean).join(" ");

const columns: ColumnDefinition[] = [
  {
    key: "vehicle",
    label: "รถ",
    getDisplay: (row) => {
      const car = row.cars;
      if (!car) {
        return row.car_id ?? "ไม่ระบุ";
      }
      const name = `${car.make ?? ""} ${car.model ?? ""}`.trim();
      return name || row.car_id ?? "ไม่ระบุ";
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
    key: "registration_no",
    label: "ทะเบียน",
    getDisplay: (row) => row.cars?.registration_no ?? "-",
    getSortValue: (row) => row.cars?.registration_no?.toLowerCase() ?? "",
  },
  {
    key: "total_jobs",
    label: "จำนวนงาน",
    align: "right",
    isNumeric: true,
    getDisplay: (row) => `${row.total_jobs ?? 0}`,
    getSortValue: (row) => row.total_jobs ?? 0,
  },
  {
    key: "total_cost",
    label: "ต้นทุนรวม",
    align: "right",
    isNumeric: true,
    getDisplay: (row) => currencyFormatter.format(row.total_cost ?? 0),
    getSortValue: (row) => row.total_cost ?? 0,
  },
  {
    key: "last_service_date",
    label: "ล่าสุด",
    getDisplay: (row) =>
      row.last_service_date
        ? dateFormatter.format(new Date(row.last_service_date))
        : "-",
    getSortValue: (row) =>
      row.last_service_date
        ? new Date(row.last_service_date).getTime()
        : Number.NEGATIVE_INFINITY,
  },
  {
    key: "status",
    label: "สถานะรถ",
    getDisplay: (row) => row.cars?.status ?? "-",
    getSortValue: (row) => row.cars?.status?.toLowerCase() ?? "",
  },
];

export function MaintenanceTable({ rows }: { rows: MaintenanceWithCar[] }) {
  const [sortState, setSortState] = useState<SortState>({
    key: "last_service_date",
    direction: "desc",
  });
  const [filters, setFilters] = useState<Record<ColumnKey, string>>({
    vehicle: "",
    registration_no: "",
    total_jobs: "",
    total_cost: "",
    last_service_date: "",
    status: "",
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

      const targetColumn = columns.find((column) => column.key === key);

      return {
        key,
        direction: targetColumn?.isNumeric ? "desc" : "asc",
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
              ยังไม่มีประวัติการซ่อมบำรุง
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
                    column.key === "total_cost"
                      ? "font-semibold text-slate-900"
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
