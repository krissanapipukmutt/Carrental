'use client';

import {
  useMemo,
  useRef,
  useState,
  useTransition,
  useEffect,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { updateCarStatus } from "./actions";
import {
  CAR_STATUSES,
  getStatusConfig,
} from "./constants";
import { dateFormatter, formatCurrency } from "./utils";
import type { CarWithRelations } from "./types";

type CarCardProps = {
  car: CarWithRelations;
};

export function CarCard({ car }: CarCardProps) {
  const resolvedInitialStatus = car.status ?? "available";
  const [confirmedStatus, setConfirmedStatus] =
    useState<string>(resolvedInitialStatus);
  const [selectedStatus, setSelectedStatus] =
    useState<string>(resolvedInitialStatus);
  const confirmedStatusRef = useRef<string>(resolvedInitialStatus);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const nextStatus = car.status ?? "available";
    setConfirmedStatus(nextStatus);
    setSelectedStatus(nextStatus);
    confirmedStatusRef.current = nextStatus;
  }, [car.status]);

  const selectableStatuses = useMemo(() => {
    const statuses = new Set<string>(CAR_STATUSES);
    if (car.status && !statuses.has(car.status)) {
      statuses.add(car.status);
    }
    return Array.from(statuses);
  }, [car.status]);

  const lastMaintenance = useMemo(() => {
    if (!car.maintenance_records || car.maintenance_records.length === 0) {
      return null;
    }

    return [...car.maintenance_records].sort((a, b) => {
      const dateA = new Date(a.maintenance_date ?? 0).getTime();
      const dateB = new Date(b.maintenance_date ?? 0).getTime();
      return dateB - dateA;
    })[0];
  }, [car.maintenance_records]);

  const statusConfig = getStatusConfig(confirmedStatus);
  const maintenanceDateLabel =
    lastMaintenance?.maintenance_date != null
      ? dateFormatter.format(new Date(lastMaintenance.maintenance_date))
      : null;

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value);
    setErrorMessage(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const statusField = formData.get("status");
    const statusToUpdate =
      typeof statusField === "string"
        ? statusField
        : confirmedStatusRef.current;

    setErrorMessage(null);
    setSelectedStatus(statusToUpdate);
    formData.set("status", statusToUpdate);

    startTransition(() => {
      updateCarStatus(formData)
        .then((result) => {
          if (!result.success) {
            setSelectedStatus(confirmedStatusRef.current);
            setErrorMessage(result.error ?? "ไม่สามารถอัปเดตสถานะได้");
            return;
          }

          confirmedStatusRef.current = statusToUpdate;
          setConfirmedStatus(statusToUpdate);
          setSelectedStatus(statusToUpdate);
        })
        .catch(() => {
          setSelectedStatus(confirmedStatusRef.current);
          setErrorMessage("ไม่สามารถอัปเดตสถานะได้");
        });
    });
  };

  return (
    <article className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {car.make} {car.model}
            </h3>
            <p className="text-sm text-slate-500">
              ปี {car.year} • {car.color ?? "ไม่ระบุสี"}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.badge}`}
          >
            <span
              className={`h-2 w-2 rounded-full ${statusConfig.dot}`}
              aria-hidden
            />
            {statusConfig.label}
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap items-center gap-2 text-xs text-slate-600"
        >
          <input type="hidden" name="carId" value={car.id} />
          <label
            htmlFor={`status-${car.id}`}
            className="font-medium text-slate-700"
          >
            เปลี่ยนสถานะ
          </label>
          <select
            id={`status-${car.id}`}
            name="status"
            value={selectedStatus}
            onChange={handleSelectChange}
            disabled={isPending}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            {selectableStatuses.map((option) => (
              <option key={option} value={option}>
                {getStatusConfig(option).label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-emerald-600 px-3 py-1 font-semibold text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </form>
        {errorMessage ? (
          <p className="text-xs text-rose-600">{errorMessage}</p>
        ) : null}

        <dl className="grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div>
            <dt className="font-medium text-slate-700">ทะเบียน</dt>
            <dd>{car.registration_no ?? "ไม่ระบุ"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-700">หมวดหมู่</dt>
            <dd>
              {car.vehicle_categories
                ? `${car.vehicle_categories.name} (${formatCurrency(
                    car.vehicle_categories.daily_rate,
                  )}/วัน)`
                : "ไม่ระบุหมวดหมู่"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-700">สาขา</dt>
            <dd>{car.branches?.name ?? "ไม่ระบุสาขา"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-700">เลขไมล์</dt>
            <dd>
              {car.mileage != null
                ? `${car.mileage.toLocaleString("th-TH")} กม.`
                : "-"}
            </dd>
          </div>
        </dl>
      </div>

      <section className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <h4 className="mb-2 text-xs font-semibold text-slate-700">
          ประวัติซ่อมล่าสุด
        </h4>
        {lastMaintenance ? (
          <dl className="space-y-1">
            <div className="flex justify-between">
              <dt className="font-medium text-slate-700">วันที่</dt>
              <dd>{maintenanceDateLabel ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-slate-700">ประเภท</dt>
              <dd>{lastMaintenance.maintenance_type ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-slate-700">ค่าใช้จ่าย</dt>
              <dd>{formatCurrency(lastMaintenance.cost)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-slate-700">เลขไมล์ตอนซ่อม</dt>
              <dd>
                {lastMaintenance.odometer != null
                  ? `${lastMaintenance.odometer.toLocaleString("th-TH")} กม.`
                  : "-"}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-slate-500">ไม่มีประวัติซ่อมย้อนหลัง</p>
        )}
      </section>
    </article>
  );
}
