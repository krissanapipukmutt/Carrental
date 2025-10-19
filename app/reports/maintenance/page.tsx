import { executeWithAdminFallback } from "@/lib/supabase/query-helpers";
import type { Database } from "@/lib/supabase/types";
import { MaintenanceTable } from "./maintenance-table";

type MaintenanceRow = Database["car_rental"]["Views"]["mv_maintenance_history"]["Row"];

type MaintenanceWithCar = MaintenanceRow & {
  cars: {
    registration_no: string | null;
    make: string | null;
    model: string | null;
    status: string | null;
  } | null;
};

async function fetchMaintenance(): Promise<MaintenanceWithCar[]> {
  const { data, error } = await executeWithAdminFallback((client) =>
    client
      .schema("car_rental")
      .from("mv_maintenance_history")
      .select("*, cars (registration_no, make, model, status)")
      .order("last_service_date", { ascending: false }),
  );

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as MaintenanceWithCar[];
}

export default async function MaintenanceReportPage() {
  const rows = await fetchMaintenance();

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-slate-900">ประวัติซ่อมบำรุง</h2>
        <p className="text-sm text-slate-600">
          ข้อมูลจาก view{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
            mv_maintenance_history
          </code>
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <MaintenanceTable rows={rows} />
      </div>
    </section>
  );
}
