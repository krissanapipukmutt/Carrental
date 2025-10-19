import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { RentalForm } from "./rental-form";

const getSupabase = async () => {
  try {
    return getAdminClient();
  } catch {
    return await createClient();
  }
};

export default async function RentalCreatePage() {
  const supabase = await getSupabase();

  const [{ data: customers, error: customerError }, { data: cars, error: carError }] =
    await Promise.all([
      supabase
        .from("customers")
        .select("id, first_name, last_name, email")
        .order("first_name", { ascending: true }),
      supabase
        .from("cars")
        .select(
          `id, registration_no, make, model, status, vehicle_categories (daily_rate)`
        )
        .in("status", ["available", "reserved"])
        .order("make", { ascending: true }),
    ]);

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

  const availableCars = (cars ?? []).filter((car) => car.status === "available");

  if (!availableCars.length) {
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

  const carOptions = availableCars.map((car) => ({
    id: car.id,
    label: `${car.make} ${car.model} (${car.registration_no})`,
    defaultDailyRate: car.vehicle_categories?.daily_rate ?? null,
  }));

  const { count } = await supabase
    .from("rental_contracts")
    .select("id", { count: "exact", head: true });

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
