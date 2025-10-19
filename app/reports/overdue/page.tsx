import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
});

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
});

type OverdueRow = Database["public"]["Views"]["mv_overdue_rentals"]["Row"];

const getSupabase = async () => {
  try {
    return getAdminClient();
  } catch {
    return await createClient();
  }
};

async function fetchOverdue() {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("mv_overdue_rentals")
    .select("*")
    .order("overdue_days", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];

  const carIds = rows.map((row) => row.car_id).filter((id): id is string => Boolean(id));
  const customerIds = rows
    .map((row) => row.customer_id)
    .filter((id): id is string => Boolean(id));

  const [{ data: cars }, { data: customers }] = await Promise.all([
    supabase
      .from("cars")
      .select("id, registration_no, make, model")
      .in("id", carIds),
    supabase
      .from("customers")
      .select("id, first_name, last_name, phone")
      .in("id", customerIds),
  ]);

  const carMap = new Map((cars ?? []).map((car) => [car.id, car]));
  const customerMap = new Map((customers ?? []).map((customer) => [customer.id, customer]));

  return rows.map((row) => ({
    ...row,
    car: row.car_id ? carMap.get(row.car_id) ?? null : null,
    customer: row.customer_id ? customerMap.get(row.customer_id) ?? null : null,
  }));
}

export default async function OverdueReportPage() {
  const rows = await fetchOverdue();

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-slate-900">สัญญาที่ค้างคืน</h2>
        <p className="text-sm text-slate-600">
          ข้อมูลจาก view <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">mv_overdue_rentals</code>
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full table-fixed border-collapse text-sm">
          <thead className="bg-rose-100 text-rose-700">
            <tr>
              <th className="px-4 py-3 text-left font-medium">เลขสัญญา</th>
              <th className="px-4 py-3 text-left font-medium">ลูกค้า</th>
              <th className="px-4 py-3 text-left font-medium">รถ</th>
              <th className="px-4 py-3 text-left font-medium">กำหนดคืน</th>
              <th className="px-4 py-3 text-right font-medium">วันค้าง</th>
              <th className="px-4 py-3 text-right font-medium">ค่าปรับสะสม</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  ไม่มีสัญญาที่ค้างคืนในขณะนี้
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.rental_id ?? index} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {row.contract_no ?? "ไม่ระบุ"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {row.customer
                      ? `${row.customer.first_name} ${row.customer.last_name}`.trim()
                      : "ไม่ระบุ"}
                    <div className="text-xs text-slate-500">
                      {row.customer?.phone ?? "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {row.car
                      ? `${row.car.make} ${row.car.model} (${row.car.registration_no})`
                      : "ไม่ระบุ"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {row.return_datetime
                      ? dateFormatter.format(new Date(row.return_datetime))
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-rose-600">
                    {row.overdue_days ?? 0} วัน
                  </td>
                  <td className="px-4 py-3 text-right text-rose-600">
                    {currencyFormatter.format(row.late_fee ?? 0)}
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
