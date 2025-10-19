import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
});

const monthFormatter = new Intl.DateTimeFormat("th-TH", {
  year: "numeric",
  month: "short",
});

type RevenueRow = Database["public"]["Views"]["mv_revenue_by_period"]["Row"];

const getSupabase = async () => {
  try {
    return getAdminClient();
  } catch {
    return await createClient();
  }
};

async function fetchRevenue(): Promise<RevenueRow[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("mv_revenue_by_period")
    .select("*")
    .order("period", { ascending: false })
    .limit(12);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export default async function RevenueReportPage() {
  const rows = await fetchRevenue();

  const totals = rows.reduce(
    (acc, row) => {
      acc.rental += row.rental_income ?? 0;
      acc.late += row.late_fee_income ?? 0;
      acc.deposit += row.deposits ?? 0;
      acc.refund += row.refunds ?? 0;
      acc.total += row.total_income ?? 0;
      return acc;
    },
    { rental: 0, late: 0, deposit: 0, refund: 0, total: 0 },
  );

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-slate-900">รายงานรายได้</h2>
        <p className="text-sm text-slate-600">
          ข้อมูลจาก view <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">mv_revenue_by_period</code>
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">รายได้ค่าเช่า</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {currencyFormatter.format(totals.rental)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">ค่าปรับล่าช้า</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {currencyFormatter.format(totals.late)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">มัดจำที่รับ</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {currencyFormatter.format(totals.deposit)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">คืนเงินลูกค้า</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {currencyFormatter.format(totals.refund)}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs uppercase text-emerald-600">รายรับรวม</p>
          <p className="mt-2 text-xl font-semibold text-emerald-700">
            {currencyFormatter.format(totals.total)}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full table-fixed border-collapse text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">ช่วงเวลา</th>
              <th className="px-4 py-3 text-right font-medium">ค่าเช่า</th>
              <th className="px-4 py-3 text-right font-medium">ค่าปรับ</th>
              <th className="px-4 py-3 text-right font-medium">มัดจำ</th>
              <th className="px-4 py-3 text-right font-medium">คืนเงิน</th>
              <th className="px-4 py-3 text-right font-medium">รวม</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  ยังไม่มีข้อมูลการชำระเงินในระบบ
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const periodLabel = row.period
                  ? monthFormatter.format(new Date(row.period))
                  : "ไม่ระบุ";
                return (
                  <tr key={row.period ?? index} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-800">{periodLabel}</td>
                    <td className="px-4 py-3 text-right">{currencyFormatter.format(row.rental_income ?? 0)}</td>
                    <td className="px-4 py-3 text-right">{currencyFormatter.format(row.late_fee_income ?? 0)}</td>
                    <td className="px-4 py-3 text-right">{currencyFormatter.format(row.deposits ?? 0)}</td>
                    <td className="px-4 py-3 text-right">{currencyFormatter.format(row.refunds ?? 0)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {currencyFormatter.format(row.total_income ?? 0)}
                    </td>
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
