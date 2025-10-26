'use client';

import { useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import type { RentalWithRelations } from "./types";
import {
  RENTAL_STATUS_META,
  formatAmount,
  formatDate,
  getCarLabel,
  getCustomerName,
  getStatusBadge,
} from "./utils";

type ColumnKey =
  | "contract"
  | "customer"
  | "car"
  | "pickup"
  | "return"
  | "status";

type SortState = {
  key: ColumnKey | null;
  direction: "asc" | "desc";
};

type FilterState = Record<ColumnKey, string>;

const columns: Array<{
  key: ColumnKey;
  label: string;
  placeholder: string;
}> = [
  {
    key: "contract",
    label: "เลขที่สัญญา",
    placeholder: "เช่น CR-2025-0001",
  },
  {
    key: "customer",
    label: "ลูกค้า",
    placeholder: "พิมพ์ชื่อลูกค้า",
  },
  {
    key: "car",
    label: "รถ",
    placeholder: "พิมพ์ชื่อรุ่นหรือทะเบียน",
  },
  {
    key: "pickup",
    label: "วันที่รับ",
    placeholder: "ค้นหาวันที่ เช่น 10 ต.ค.",
  },
  {
    key: "return",
    label: "วันที่คืน",
    placeholder: "ค้นหาวันที่ เช่น 14 ต.ค.",
  },
  {
    key: "status",
    label: "สถานะ",
    placeholder: "เช่น กำลังเช่า",
  },
];

const initialFilters: FilterState = {
  contract: "",
  customer: "",
  car: "",
  pickup: "",
  return: "",
  status: "",
};

const normalize = (value: string) => value.trim().toLowerCase();

export function RentalsTable({ rentals }: { rentals: RentalWithRelations[] }) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [sortState, setSortState] = useState<SortState>({
    key: null,
    direction: "asc",
  });

  const columnOptions = useMemo<Record<ColumnKey, string[]>>(() => {
    const contract = new Set<string>();
    const customer = new Set<string>();
    const car = new Set<string>();
    const pickup = new Set<string>();
    const returns = new Set<string>();
    const status = new Set<string>();

    rentals.forEach((rental) => {
      if (rental.contract_no) {
        contract.add(rental.contract_no);
      }

      const customerName = getCustomerName(rental);
      if (customerName && customerName !== "ไม่ระบุ") {
        customer.add(customerName);
      }

      const carLabel = getCarLabel(rental);
      if (carLabel && carLabel !== "ไม่ระบุ") {
        car.add(carLabel);
      }

      const pickupLabel = formatDate(rental.pickup_datetime);
      if (pickupLabel && pickupLabel !== "-") {
        pickup.add(pickupLabel);
      }

      const returnLabel = formatDate(rental.return_datetime);
      if (returnLabel && returnLabel !== "-") {
        returns.add(returnLabel);
      }

      const statusLabel =
        RENTAL_STATUS_META[rental.rental_status]?.label ??
        rental.rental_status ??
        "";
      if (statusLabel) {
        status.add(statusLabel);
      }
    });

    return {
      contract: Array.from(contract).sort((a, b) => a.localeCompare(b, "th")),
      customer: Array.from(customer).sort((a, b) => a.localeCompare(b, "th")),
      car: Array.from(car).sort((a, b) => a.localeCompare(b, "th")),
      pickup: Array.from(pickup).sort((a, b) => a.localeCompare(b, "th")),
      return: Array.from(returns).sort((a, b) => a.localeCompare(b, "th")),
      status: Array.from(status).sort((a, b) => a.localeCompare(b, "th")),
    };
  }, [rentals]);

  const filteredRentals = useMemo(() => {
    const normalizedFilters: Record<ColumnKey, string> = {
      contract: normalize(filters.contract),
      customer: normalize(filters.customer),
      car: normalize(filters.car),
      pickup: normalize(filters.pickup),
      return: normalize(filters.return),
      status: normalize(filters.status),
    };

    if (
      Object.values(normalizedFilters).every((value) => value.length === 0)
    ) {
      return rentals;
    }

    return rentals.filter((rental) => {
      const contractValue = normalize(rental.contract_no ?? "");

      if (
        normalizedFilters.contract &&
        !contractValue.includes(normalizedFilters.contract)
      ) {
        return false;
      }

      const customerValue = normalize(getCustomerName(rental));
      if (
        normalizedFilters.customer &&
        !customerValue.includes(normalizedFilters.customer)
      ) {
        return false;
      }

      const carValue = normalize(getCarLabel(rental));
      if (
        normalizedFilters.car &&
        !carValue.includes(normalizedFilters.car)
      ) {
        return false;
      }

      const pickupValue = normalize(formatDate(rental.pickup_datetime));
      if (
        normalizedFilters.pickup &&
        !pickupValue.includes(normalizedFilters.pickup)
      ) {
        return false;
      }

      const returnValue = normalize(formatDate(rental.return_datetime));
      if (
        normalizedFilters.return &&
        !returnValue.includes(normalizedFilters.return)
      ) {
        return false;
      }

      const statusLabel =
        RENTAL_STATUS_META[rental.rental_status]?.label ??
        rental.rental_status ??
        "";
      const statusValue = normalize(statusLabel);
      if (
        normalizedFilters.status &&
        !statusValue.includes(normalizedFilters.status)
      ) {
        return false;
      }

      return true;
    });
  }, [filters, rentals]);

  const sortedRentals = useMemo(() => {
    if (!sortState.key) {
      return filteredRentals;
    }

    const directionMultiplier = sortState.direction === "asc" ? 1 : -1;

    return [...filteredRentals].sort((a, b) => {
      const valueA = getSortValue(a, sortState.key);
      const valueB = getSortValue(b, sortState.key);

      if (typeof valueA === "number" && typeof valueB === "number") {
        return (valueA - valueB) * directionMultiplier;
      }

      const stringA = String(valueA);
      const stringB = String(valueB);
      return (
        stringA.localeCompare(stringB, "th", {
          sensitivity: "base",
          numeric: true,
        }) * directionMultiplier
      );
    });
  }, [filteredRentals, sortState]);

  const handleFilterChange =
    (key: ColumnKey) => (event: ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({
        ...prev,
        [key]: event.target.value,
      }));
    };

  const handleSort = (key: ColumnKey) => {
    setSortState((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key,
        direction: "asc",
      };
    });
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            กรองข้อมูลได้จากทุกคอลัมน์ ข้อมูลที่แสดงจะตรงกับทุกเงื่อนไข
          </span>
          <button
            type="button"
            onClick={clearFilters}
            className="font-semibold text-emerald-600 hover:text-emerald-700"
          >
            ล้างตัวกรอง
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {columns.map((column) => {
            const datalistId = `${column.key}-filter-options`;
            const options = columnOptions[column.key];
            return (
              <div key={column.key} className="flex flex-col gap-1">
                <label
                  htmlFor={`${column.key}-filter`}
                  className="text-xs font-semibold text-slate-700"
                >
                  {column.label}
                </label>
                <input
                  id={`${column.key}-filter`}
                  list={datalistId}
                  value={filters[column.key]}
                  onChange={handleFilterChange(column.key)}
                  placeholder={column.placeholder}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  type="search"
                />
                <datalist id={datalistId}>
                  {options.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] table-fixed border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-medium">
                  <button
                    type="button"
                    onClick={() => handleSort(column.key)}
                    className="flex items-center gap-1 font-medium text-slate-600 transition hover:text-slate-800"
                  >
                    {column.label}
                    <span className="text-xs text-slate-400">
                      {sortState.key === column.key
                        ? sortState.direction === "asc"
                          ? "▲"
                          : "▼"
                        : "⇅"}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRentals.length === 0 ? (
              <tr className="border-t border-slate-200">
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  ไม่พบข้อมูลที่ตรงกับเงื่อนไข
                </td>
              </tr>
            ) : (
              sortedRentals.map((rental) => {
                const customer = rental.customers;
                const car = rental.cars;

                return (
                  <tr
                    key={rental.id}
                    className="border-t border-slate-200 transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link
                        href={`/rentals/${rental.id}`}
                        className="hover:underline"
                      >
                        {rental.contract_no}
                      </Link>
                      <div className="text-xs text-slate-500">
                        {formatAmount(rental.total_amount)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {customer ? (
                        getCustomerName(rental)
                      ) : (
                        <span className="text-slate-400">
                          {getCustomerName(rental)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {car ? (
                        getCarLabel(rental)
                      ) : (
                        <span className="text-slate-400">
                          {getCarLabel(rental)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatDate(rental.pickup_datetime)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatDate(rental.return_datetime)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {getStatusBadge(rental.rental_status)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getSortValue(rental: RentalWithRelations, key: ColumnKey) {
  switch (key) {
    case "contract":
      return rental.contract_no ?? "";
    case "customer":
      return getCustomerName(rental);
    case "car":
      return getCarLabel(rental);
    case "pickup":
      return rental.pickup_datetime
        ? new Date(rental.pickup_datetime).getTime()
        : Number.NEGATIVE_INFINITY;
    case "return":
      return rental.return_datetime
        ? new Date(rental.return_datetime).getTime()
        : Number.NEGATIVE_INFINITY;
    case "status":
      return (
        RENTAL_STATUS_META[rental.rental_status]?.label ??
        rental.rental_status ??
        ""
      );
    default:
      return "";
  }
}
