'use client';

import { useMemo, useState } from "react";
import { CarCard } from "./car-card";
import {
  CAR_STATUSES,
  CAR_STATUS_META,
  getStatusConfig,
} from "./constants";
import type { CarWithRelations } from "./types";

type FilterState = {
  status: string;
  make: string;
  model: string;
  branch: string;
  category: string;
  registration: string;
};

type CarsBrowserProps = {
  cars: CarWithRelations[];
};

const emptyFilters: FilterState = {
  status: "",
  make: "",
  model: "",
  branch: "",
  category: "",
  registration: "",
};

const normalize = (value: string) => value.trim().toLowerCase();

export function CarsBrowser({ cars }: CarsBrowserProps) {
  const [filters, setFilters] = useState<FilterState>(emptyFilters);

  const uniqueMakes = useMemo(
    () =>
      Array.from(
        new Set(
          cars
            .map((car) => car.make)
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort((a, b) => a.localeCompare(b, "th")),
    [cars],
  );

  const uniqueModels = useMemo(
    () =>
      Array.from(
        new Set(
          cars
            .map((car) => car.model)
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort((a, b) => a.localeCompare(b, "th")),
    [cars],
  );

  const uniqueBranches = useMemo(
    () =>
      Array.from(
        new Set(
          cars
            .map((car) => car.branches?.name ?? "")
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort((a, b) => a.localeCompare(b, "th")),
    [cars],
  );

  const uniqueCategories = useMemo(
    () =>
      Array.from(
        new Set(
          cars
            .map((car) => car.vehicle_categories?.name ?? "")
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort((a, b) => a.localeCompare(b, "th")),
    [cars],
  );

  const uniqueRegistrations = useMemo(
    () =>
      Array.from(
        new Set(
          cars
            .map((car) => car.registration_no ?? "")
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort((a, b) => a.localeCompare(b, "th")),
    [cars],
  );

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((value) => value.trim() !== ""),
    [filters],
  );

  const filteredCars = useMemo(() => {
    const statusFilter = normalize(filters.status);
    const makeFilter = normalize(filters.make);
    const modelFilter = normalize(filters.model);
    const branchFilter = normalize(filters.branch);
    const categoryFilter = normalize(filters.category);
    const registrationFilter = normalize(filters.registration);

    if (
      !statusFilter &&
      !makeFilter &&
      !modelFilter &&
      !branchFilter &&
      !categoryFilter &&
      !registrationFilter
    ) {
      return cars;
    }

    return cars.filter((car) => {
      if (statusFilter) {
        const statusLabel = getStatusConfig(car.status).label.toLowerCase();
        const statusValue = String(car.status ?? "").toLowerCase();
        if (
          !statusLabel.includes(statusFilter) &&
          !statusValue.includes(statusFilter)
        ) {
          return false;
        }
      }

      if (makeFilter) {
        const makeValue = String(car.make ?? "").toLowerCase();
        if (!makeValue.includes(makeFilter)) {
          return false;
        }
      }

      if (modelFilter) {
        const modelValue = String(car.model ?? "").toLowerCase();
        if (!modelValue.includes(modelFilter)) {
          return false;
        }
      }

      if (branchFilter) {
        const branchValue = String(car.branches?.name ?? "").toLowerCase();
        if (!branchValue.includes(branchFilter)) {
          return false;
        }
      }

      if (categoryFilter) {
        const categoryValue = String(
          car.vehicle_categories?.name ?? "",
        ).toLowerCase();
        if (!categoryValue.includes(categoryFilter)) {
          return false;
        }
      }

      if (registrationFilter) {
        const registrationValue = String(
          car.registration_no ?? "",
        ).toLowerCase();
        if (!registrationValue.includes(registrationFilter)) {
          return false;
        }
      }

      return true;
    });
  }, [cars, filters]);

  const handleFilterChange = (key: keyof FilterState) => (value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <header className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              ตัวกรอง
            </h3>
            <p className="text-xs text-slate-500">
              เลือกได้มากกว่า 1 ช่อง ระบบจะแสดงรถที่มีข้อมูลตรงกับทุกเงื่อนไข
            </p>
          </div>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              ล้างตัวกรอง
            </button>
          ) : null}
        </header>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <FilterInput
            id="status-filter"
            label="สถานะ"
            placeholder="พิมพ์เพื่อค้นหา เช่น ว่าง"
            value={filters.status}
            onChange={handleFilterChange("status")}
            options={CAR_STATUSES.map((status) => ({
              value: CAR_STATUS_META[status].label,
            }))}
          />
          <FilterInput
            id="make-filter"
            label="ยี่ห้อ"
            placeholder="เช่น Toyota"
            value={filters.make}
            onChange={handleFilterChange("make")}
            options={uniqueMakes.map((value) => ({ value }))}
          />
          <FilterInput
            id="model-filter"
            label="รุ่น"
            placeholder="เช่น Civic"
            value={filters.model}
            onChange={handleFilterChange("model")}
            options={uniqueModels.map((value) => ({ value }))}
          />
          <FilterInput
            id="branch-filter"
            label="สาขา"
            placeholder="เช่น สาขาหัวหมาก"
            value={filters.branch}
            onChange={handleFilterChange("branch")}
            options={uniqueBranches.map((value) => ({ value }))}
          />
          <FilterInput
            id="category-filter"
            label="หมวดหมู่"
            placeholder="เช่น SUV"
            value={filters.category}
            onChange={handleFilterChange("category")}
            options={uniqueCategories.map((value) => ({ value }))}
          />
          <FilterInput
            id="registration-filter"
            label="ทะเบียน"
            placeholder="พิมพ์เลขหรืออักษรบางส่วน"
            value={filters.registration}
            onChange={handleFilterChange("registration")}
            options={uniqueRegistrations.map((value) => ({ value }))}
          />
        </div>
      </section>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          แสดง {filteredCars.length} จาก {cars.length} คัน
        </span>
        {hasActiveFilters ? (
          <span>มีการใช้ตัวกรอง {Object.values(filters).filter(Boolean).length} ช่อง</span>
        ) : (
          <span>ยังไม่ได้ใช้ตัวกรอง</span>
        )}
      </div>

      {filteredCars.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          ไม่พบรถที่ตรงกับเงื่อนไขที่เลือก
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}

type FilterInputProps = {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string }>;
};

function FilterInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  options,
}: FilterInputProps) {
  const datalistId = `${id}-options`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={id}
        list={datalistId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
      />
      <datalist id={datalistId}>
        {options.map((option) => (
          <option key={option.value} value={option.value} />
        ))}
      </datalist>
    </div>
  );
}
