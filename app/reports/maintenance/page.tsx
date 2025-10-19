import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
});

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
});

type MaintenanceRow = Database["public"]["Views"]["mv_maintenance_history"]["Row"];

const getSupabase = async () => {
  try {
    return getAdminClient();
  } catch {
    return await createClient();
  }
};

async function fetchMaintenance(): Promise<MaintenanceRow[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("mv_maintenance_history")
    .select("*")
    .order("last_service_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export default async function MaintenanceReportPage() {
  const rows = await fetchMaintenance();

  const carIds = rows
    .map((row) => row.car_id)
    .filter((id): id is string => Boolean(id));

  const supabase = await getSupabase();
  const { data: cars } = await supabase
    .from("cars")
    .select("id, make, model, registration_no, status")
    .in("id", carIds);

  const carMap = new Map((cars ?? []).map((car) => [car.id, car]));

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-slate-900">ประวัติซ่อมบำรุง</h2>
        <p className="text-sm text-slate-600">
          ข้อมูลจาก view <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">mv_maintenance_history</code>
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full table-fixed border-collapse text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">รถ</th>
              <th className="px-4 py-3 text-left font-medium">ทะเบียน</th>
              <th className="px-4 py-3 text-right font-medium">จำนวนงาน</th>
              <th className="px-4 py-3 text-right font-medium">ต้นทุนรวม</th>
              <th className="px-4 py-3 text-left font-medium">ล่าสุด</th>
              <th className="px-4 py-3 text-left font-medium">สถานะรถ</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  ยังไม่มีประวัติการซ่อมบำรุง
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const car = row.car_id ? carMap.get(row.car_id) : null;
                return (
                  <tr key={row.car_id ?? index} className="border-t border-slate-200">
                    <td className="px-4 py-3 text-slate-800">
                      {car ? `${car.make} ${car.model}` : "ไม่ระบุ"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{car?.registration_no ?? "-"}</td>
                    <td className="px-4 py-3 text-right">{row.total_jobs ?? 0}</td>
                    <td className="px-4 py-3 text-right">
                      {currencyFormatter.format(row.total_cost ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.last_service_date
                        ? dateFormatter.format(new Date(row.last_service_date))
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{car?.status ?? "-"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
