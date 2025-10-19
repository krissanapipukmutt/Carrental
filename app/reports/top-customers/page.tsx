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

type TopCustomerRow = Database["public"]["Views"]["mv_top_customers"]["Row"];

const getSupabase = async () => {
  try {
    return getAdminClient();
  } catch {
    return await createClient();
  }
};

async function fetchTopCustomers(limit = 10) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("mv_top_customers")
    .select("*")
    .order("rental_count", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const ids = rows
    .map((row) => row.customer_id)
    .filter((id): id is string => Boolean(id));

  const { data: customers } = await supabase
    .from("customers")
    .select("id, first_name, last_name, email, phone")
    .in("id", ids);

  const customerMap = new Map(
    (customers ?? []).map((customer) => [customer.id, customer]),
  );

  return rows.map((row) => ({
    ...row,
    customer: row.customer_id ? customerMap.get(row.customer_id) ?? null : null,
  }));
}

export default async function TopCustomersReportPage() {
  const rows = await fetchTopCustomers(10);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-slate-900">
          ลูกค้าที่เช่าบ่อยที่สุด
        </h2>
        <p className="text-sm text-slate-600">
          ข้อมูลจาก view <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">mv_top_customers</code>
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full table-fixed border-collapse text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">ลูกค้า</th>
              <th className="px-4 py-3 text-left font-medium">ข้อมูลติดต่อ</th>
              <th className="px-4 py-3 text-right font-medium">จำนวนครั้งที่เช่า</th>
              <th className="px-4 py-3 text-right font-medium">ยอดใช้จ่ายรวม</th>
              <th className="px-4 py-3 text-left font-medium">เช่าครั้งแรก</th>
              <th className="px-4 py-3 text-left font-medium">เช่าล่าสุด</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  ยังไม่มีประวัติการเช่าในระบบ
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const customerLabel = row.customer
                  ? `${row.customer.first_name} ${row.customer.last_name}`.trim()
                  : "ไม่ระบุ";
                return (
                  <tr key={row.customer_id ?? index} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-900">{customerLabel}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{row.customer?.email ?? "-"}</div>
                      <div className="text-xs text-slate-500">
                        {row.customer?.phone ?? "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-800">
                      {row.rental_count ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-800">
                      {currencyFormatter.format(row.total_spent ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.first_rental
                        ? dateFormatter.format(new Date(row.first_rental))
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.last_rental
                        ? dateFormatter.format(new Date(row.last_rental))
                        : "-"}
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
