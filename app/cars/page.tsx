import Link from "next/link";
import { executeWithAdminFallback } from "@/lib/supabase/query-helpers";
import type { CarWithRelations } from "./types";
import { CAR_STATUSES, CAR_STATUS_META } from "./constants";
import { CarsBrowser } from "./cars-browser";

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
          const item = CAR_STATUS_META[status];
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
        <CarsBrowser cars={cars} />
      )}
    </section>
  );
}
