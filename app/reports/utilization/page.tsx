import { executeWithAdminFallback } from "@/lib/supabase/query-helpers";
import type { Database } from "@/lib/supabase/types";
import { UtilizationTable } from "./utilization-table";

const percentFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 2,
});

type UtilizationRow = Database["car_rental"]["Views"]["mv_car_utilization"]["Row"];

async function fetchUtilization(): Promise<UtilizationRow[]> {
  const { data, error } = await executeWithAdminFallback((client) =>
    client
      .schema("car_rental")
      .from("mv_car_utilization")
      .select("*")
      .order("utilization_percent", { ascending: false }),
  );

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export default async function CarUtilizationReportPage() {
  const rows = await fetchUtilization();
  const highlightCards = rows.slice(0, 6);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-slate-900">
          อัตราการใช้งานรถ (90 วัน)
        </h2>
        <p className="text-sm text-slate-600">
          ข้อมูลจาก view{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
            mv_car_utilization
          </code>
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {highlightCards.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3 rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            ยังไม่มีข้อมูลการใช้งานรถในช่วง 90 วันที่ผ่านมา
          </div>
        ) : (
          highlightCards.map((row, index) => {
            const utilization = row.utilization_percent ?? 0;
            return (
              <div
                key={`${row.car_id ?? index}-summary`}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-sm font-medium text-slate-700">
                  {row.make} {row.model}
                </p>
                <p className="text-xs text-slate-500">
                  ทะเบียน {row.registration_no ?? "-"}
                </p>
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
          })
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <UtilizationTable rows={rows} />
      </div>
    </section>
  );
}
