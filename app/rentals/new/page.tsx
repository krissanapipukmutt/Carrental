import { executeWithAdminFallback } from "@/lib/supabase/query-helpers";
import { RentalForm } from "./rental-form";

export default async function RentalCreatePage() {
  const [customerResult, carResult] = await Promise.all([
    executeWithAdminFallback((client) =>
      client
        .schema("car_rental")
        .from("customers")
        .select("id, first_name, last_name, email")
        .order("first_name", { ascending: true }),
    ),
    executeWithAdminFallback((client) =>
      client
        .schema("car_rental")
        .from("cars")
        .select(
          `id, registration_no, make, model, status, vehicle_categories (daily_rate)`
        )
        .eq("status", "available")
        .order("make", { ascending: true }),
    ),
  ]);
  const customers = customerResult.data;
  const customerError = customerResult.error;
  const cars = carResult.data;
  const carError = carResult.error;

  if (customerError || carError) {
    throw new Error(customerError?.message ?? carError?.message ?? "ไม่สามารถโหลดข้อมูลสำหรับฟอร์มได้");
  }

  if (!customers?.length) {
    return (
      <section className="space-y-4">
        <header className="space-y-1">
          <h2 className="text-2xl font-semibold text-slate-900">สร้างสัญญาเช่าใหม่</h2>
          <p className="text-sm text-slate-600">กรุณาเพิ่มลูกค้าก่อนทำสัญญาเช่า</p>
        </header>
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          ยังไม่มีข้อมูลลูกค้าในระบบ
        </div>
      </section>
    );
  }

  if (!cars?.length) {
    return (
      <section className="space-y-4">
        <header className="space-y-1">
          <h2 className="text-2xl font-semibold text-slate-900">สร้างสัญญาเช่าใหม่</h2>
        </header>
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          ยังไม่มีรถที่พร้อมให้เช่า กรุณาตรวจสอบสถานะรถในหน้าจัดการรถ
        </div>
      </section>
    );
  }

  const carOptions = cars.map((car) => ({
    id: car.id,
    label: `${car.make} ${car.model} (${car.registration_no})`,
    defaultDailyRate: car.vehicle_categories?.daily_rate ?? null,
  }));

  const { count } = await executeWithAdminFallback((client) =>
    client
      .schema("car_rental")
      .from("rental_contracts")
      .select("id", { count: "exact", head: true }),
  );

  const year = new Date().getFullYear();
  const suggestedContractNo = `CR-${year}-${String((count ?? 0) + 1).padStart(4, "0")}`;

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-slate-900">สร้างสัญญาเช่าใหม่</h2>
        <p className="text-sm text-slate-600">
          เลือกลูกค้าและรถที่ต้องการ พร้อมกำหนดช่วงเวลาและรายละเอียดการเช่า
        </p>
      </header>

      <RentalForm
        customers={customers ?? []}
        cars={carOptions}
        suggestedContractNo={suggestedContractNo}
      />
    </section>
  );
}
