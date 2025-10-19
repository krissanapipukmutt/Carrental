import Link from "next/link";
import { executeWithAdminFallback } from "@/lib/supabase/query-helpers";
import type { Database } from "@/lib/supabase/types";
import { updateCarStatus } from "./actions";
import { CAR_STATUSES, CAR_STATUS_LABELS } from "./constants";

type CarRow = Database["car_rental"]["Tables"]["cars"]["Row"];
type CategoryRow =
  Database["car_rental"]["Tables"]["vehicle_categories"]["Row"];
type BranchRow = Database["car_rental"]["Tables"]["branches"]["Row"];
type MaintenanceRow =
  Database["car_rental"]["Tables"]["maintenance_records"]["Row"];

type CarWithRelations = CarRow & {
  vehicle_categories: Pick<CategoryRow, "name" | "daily_rate"> | null;
  branches: Pick<BranchRow, "name"> | null;
  maintenance_records: Pick<
    MaintenanceRow,
    "id" | "maintenance_date" | "maintenance_type" | "cost" | "odometer"
  >[] | null;
};

const statusMap: Record<
  string,
  { label: string; badge: string; dot: string; description: string }
> = {
  available: {
    label: "ว่าง",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    description: "พร้อมให้เช่า",
  },
  reserved: {
    label: "จองแล้ว",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    description: "มีผู้จองในอนาคต",
  },
  rented: {
    label: "กำลังเช่า",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
    description: "อยู่ระหว่างสัญญาเช่า",
  },
  maintenance: {
    label: "ซ่อมบำรุง",
    badge: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
    description: "อยู่ในขั้นตอนซ่อมบำรุง",
  },
  retired: {
    label: "ปลดระวาง",
    badge: "bg-slate-200 text-slate-600",
    dot: "bg-slate-400",
    description: "ไม่ใช้งานแล้ว",
  },
};

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
});

function formatCurrency(value: number | string | null | undefined) {
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

async function fetchCars(): Promise<{
  cars: CarWithRelations[];
  error: string | null;
}> {
  try {
    const { data, error } = await executeWithAdminFallback((client) =>
      client
        .schema("car_rental")
        .from("cars")
        .select(
          `
        id,
        registration_no,
        status,
        mileage,
        color,
        year,
        make,
        model,
        branch_id,
        category_id,
        vehicle_categories (
          name,
          daily_rate
        ),
        branches (
          name
        ),
        maintenance_records (
          id,
          maintenance_date,
          maintenance_type,
          cost,
          odometer
        )
      `
        )
        .order("make", { ascending: true })
        .order("model", { ascending: true }),
    );

    if (error) {
      throw error;
    }

    return {
      cars: (data ?? []) as CarWithRelations[],
      error: null,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "ไม่สามารถดึงข้อมูลรถจาก Supabase ได้";

    return {
      cars: [],
      error: message,
    };
  }
}

function getStatusBadge(status: string | null) {
  const config =
    status && statusMap[status]
      ? statusMap[status]
      : {
          label: status ?? "ไม่ทราบสถานะ",
          badge: "bg-slate-200 text-slate-600",
          dot: "bg-slate-400",
          description: "",
        };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${config.badge}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dot}`} aria-hidden />
      {config.label}
    </span>
  );
}

function getLastMaintenance(car: CarWithRelations) {
  if (!car.maintenance_records || car.maintenance_records.length === 0) {
    return null;
  }

  const [latest] = [...car.maintenance_records].sort((a, b) => {
    const dateA = new Date(a.maintenance_date ?? 0).getTime();
    const dateB = new Date(b.maintenance_date ?? 0).getTime();
    return dateB - dateA;
  });

  return latest;
}

export default async function CarsPage() {
  const { cars, error } = await fetchCars();

  return (
    <section className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">จัดการรถ</h2>
            <p className="text-sm text-slate-600">
              ข้อมูลจากตาราง cars พร้อมสาขา หมวดหมู่ และประวัติซ่อมบำรุงล่าสุด
            </p>
          </div>
          <Link
            href="/cars/new"
            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
          >
            + เพิ่มรถ
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        {CAR_STATUSES.map((status) => {
          const item = statusMap[status];
          return (
            <div key={status} className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${item.dot}`}
                aria-hidden
              />
              <span>{item.label}</span>
            </div>
          );
        })}
        {Object.entries(statusMap)
          .filter(
            ([status]) =>
              !CAR_STATUSES.includes(
                status as (typeof CAR_STATUSES)[number],
              ),
          )
          .map(([, item]) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${item.dot}`}
                aria-hidden
              />
              <span>{item.label}</span>
            </div>
          ))}
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          เกิดข้อผิดพลาดในการดึงข้อมูลรถ: {error}
          <div className="mt-2 text-xs text-rose-600">
            ตรวจสอบค่า .env และสิทธิ์ RLS ของตาราง cars
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          แสดงข้อมูลรถทั้งหมดในระบบ พร้อมหมวดหมู่และสถานะปัจจุบัน
        </div>
      )}

      {cars.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          ยังไม่มีข้อมูลรถในระบบ
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cars.map((car) => {
            const lastMaintenance = getLastMaintenance(car);
            const maintenanceDate =
              lastMaintenance?.maintenance_date != null
                ? new Date(lastMaintenance.maintenance_date)
                : null;
            const selectableStatuses = Array.from(
              new Set([
                ...CAR_STATUSES,
                ...(car.status &&
                !CAR_STATUSES.includes(
                  car.status as (typeof CAR_STATUSES)[number],
                )
                  ? [car.status]
                  : []),
              ]),
            );

            return (
              <article
                key={car.id}
                className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
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
                    {getStatusBadge(car.status)}
                  </div>

                  <form
                    action={updateCarStatus}
                    className="flex flex-wrap items-center gap-2 text-xs text-slate-600"
                  >
                    <input type="hidden" name="carId" value={car.id} />
                    <label htmlFor={`status-${car.id}`} className="font-medium text-slate-700">
                      เปลี่ยนสถานะ
                    </label>
                    <select
                      id={`status-${car.id}`}
                      name="status"
                      defaultValue={car.status ?? "available"}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    >
                      {selectableStatuses.map((status) => (
                        <option key={status} value={status}>
                          {statusMap[status]?.label ??
                            CAR_STATUS_LABELS[
                              status as (typeof CAR_STATUSES)[number]
                            ] ??
                            status}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-md bg-emerald-600 px-3 py-1 font-semibold text-white shadow hover:bg-emerald-700"
                    >
                      บันทึก
                    </button>
                  </form>

                  <dl className="grid grid-cols-1 gap-2 text-sm text-slate-600">
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-slate-700">ทะเบียน</dt>
                      <dd>{car.registration_no}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-slate-700">หมวดหมู่</dt>
                      <dd>
                        {car.vehicle_categories?.name ?? "ไม่ระบุ"}{" "}
                        {car.vehicle_categories?.daily_rate
                          ? `(${formatCurrency(
                              car.vehicle_categories.daily_rate
                            )}/วัน)`
                          : ""}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-slate-700">สาขา</dt>
                      <dd>{car.branches?.name ?? "ไม่ระบุ"}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-slate-700">เลขไมล์</dt>
                      <dd>{car.mileage.toLocaleString("th-TH")} กม.</dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  <p className="font-semibold text-slate-700">
                    ประวัติซ่อมล่าสุด
                  </p>
                  {lastMaintenance ? (
                    <ul className="mt-2 space-y-1">
                      <li className="flex justify-between gap-4">
                        <span>วันที่</span>
                        <span>
                          {maintenanceDate
                            ? dateFormatter.format(maintenanceDate)
                            : "ไม่ระบุ"}
                        </span>
                      </li>
                      <li className="flex justify-between gap-4">
                        <span>ประเภท</span>
                        <span>{lastMaintenance.maintenance_type}</span>
                      </li>
                      <li className="flex justify-between gap-4">
                        <span>ค่าใช้จ่าย</span>
                        <span>{formatCurrency(lastMaintenance.cost)}</span>
                      </li>
                      {lastMaintenance.odometer ? (
                        <li className="flex justify-between gap-4">
                          <span>เลขไมล์ตอนซ่อม</span>
                          <span>
                            {lastMaintenance.odometer.toLocaleString("th-TH")} กม.
                          </span>
                        </li>
                      ) : null}
                    </ul>
                  ) : (
                    <p className="mt-2 text-slate-500">
                      ยังไม่มีประวัติการซ่อมบำรุงบันทึกไว้
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
