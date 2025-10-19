import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

const getSupabase = async () => {
  try {
    return getAdminClient();
  } catch {
    return await createClient();
  }
};

type UtilizationRow = Database["public"]["Views"]["mv_car_utilization"]["Row"];

const percentFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 2,
});

async function fetchUtilization(): Promise<UtilizationRow[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("mv_car_utilization")
    .select("*")
    .order("utilization_percent", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export default async function CarUtilizationReportPage() {
  const rows = await fetchUtilization();

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-slate-900">
          อัตราการใช้งานรถ (90 วัน)
        </h2>
        <p className="text-sm text-slate-600">
          ข้อมูลจาก view <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">mv_car_utilization</code>
        </p>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">ภาพรวมล่าสุด</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.slice(0, 6).map((row, index) => {
            const utilization = row.utilization_percent ?? 0;
            return (
              <div
                key={`${row.car_id ?? index}-summary`}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-sm font-medium text-slate-700">
                  {row.make} {row.model}
                </p>
                <p className="text-xs text-slate-500">ทะเบียน {row.registration_no}</p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{percentFormatter.format(utilization)}%</span>
                    <span>
                      {row.rented_days ?? 0} / {row.period_days ?? 90} วัน
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(100, utilization)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full table-auto border-collapse text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">รถ</th>
              <th className="px-4 py-3 text-left font-medium">ทะเบียน</th>
              <th className="px-4 py-3 text-right font-medium">จำนวนวันที่ถูกเช่า</th>
              <th className="px-4 py-3 text-right font-medium">เปอร์เซ็นต์การใช้งาน</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  ยังไม่มีข้อมูลการใช้งานรถในช่วง 90 วันที่ผ่านมา
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.car_id ?? index} className="border-t border-slate-200">
                  <td className="px-4 py-3 text-slate-800">
                    {row.make} {row.model}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.registration_no}</td>
                  <td className="px-4 py-3 text-right">
                    {row.rented_days ?? 0} / {row.period_days ?? 90}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    {percentFormatter.format(row.utilization_percent ?? 0)}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
