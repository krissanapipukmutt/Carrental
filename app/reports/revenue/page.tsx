import { executeWithAdminFallback } from "@/lib/supabase/query-helpers";
import type { Database } from "@/lib/supabase/types";
import { RevenueTable } from "./revenue-table";

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
});

type RevenueRow = Database["car_rental"]["Views"]["mv_revenue_by_period"]["Row"];

async function fetchRevenue(): Promise<RevenueRow[]> {
  const { data, error } = await executeWithAdminFallback((client) =>
    client
      .schema("car_rental")
      .from("mv_revenue_by_period")
      .select("*")
      .order("period", { ascending: false }),
  );

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
          ข้อมูลจาก view{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
            mv_revenue_by_period
          </code>
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
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs uppercase text-emerald-600">รายรับรวม</p>
          <p className="mt-2 text-xl font-semibold text-emerald-700">
            {currencyFormatter.format(totals.total)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <RevenueTable rows={rows} />
      </div>
    </section>
  );
}
