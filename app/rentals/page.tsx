import Link from "next/link";
import { executeWithAdminFallback } from "@/lib/supabase/query-helpers";
import type { RentalWithRelations } from "./types";
import { RentalsTable } from "./rentals-table";

async function fetchRecentRentals(): Promise<{
  rentals: RentalWithRelations[];
  error: string | null;
}> {
  try {
    const { data, error } = await executeWithAdminFallback((client) =>
      client
        .schema("car_rental")
        .from("rental_contracts")
        .select(
          `
          id,
          contract_no,
          pickup_datetime,
          return_datetime,
          rental_status,
          total_amount,
          customers (
            first_name,
            last_name
          ),
          cars (
            registration_no,
            make,
            model
          )
        `
        )
        .order("pickup_datetime", { ascending: false })
        .limit(10),
    );

    if (error) {
      throw error;
    }

    return {
      rentals: (data ?? []) as RentalWithRelations[],
      error: null,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "ไม่สามารถเชื่อมต่อ Supabase ได้";

    return {
      rentals: [],
      error: message,
    };
  }
}

export default async function RentalsPage() {
  const { rentals, error } = await fetchRecentRentals();

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">สัญญาเช่า</h2>
          <p className="text-sm text-slate-600">
            จัดการการจอง การรับรถ/คืนรถ และชำระเงิน
          </p>
        </div>
        <Link
          href="/rentals/new"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700"
        >
          + สร้างสัญญาใหม่
        </Link>
      </header>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          เกิดข้อผิดพลาดในการดึงข้อมูล: {error}
          <div className="mt-2 text-xs text-rose-600">
            ตรวจสอบค่าตัวแปร .env และสิทธิ์ของ Supabase RLS
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          แสดงตัวอย่างสัญญาเช่า 10 รายการล่าสุดจาก Supabase
        </div>
      )}

      <RentalsTable rentals={rentals} />
    </section>
  );
}
