import { executeWithAdminFallback } from "@/lib/supabase/query-helpers";
import type { Database } from "@/lib/supabase/types";
import { TopCustomersTable } from "./top-customers-table";

type TopCustomerRow = Database["car_rental"]["Views"]["mv_top_customers"]["Row"];
type CustomerRecord = Database["car_rental"]["Tables"]["customers"]["Row"];

type TopCustomerWithProfile = TopCustomerRow & {
  customer: CustomerRecord | null;
};

async function fetchTopCustomers(): Promise<TopCustomerWithProfile[]> {
  const { data, error } = await executeWithAdminFallback((client) =>
    client
      .schema("car_rental")
      .from("mv_top_customers")
      .select("*")
      .order("rental_count", { ascending: false })
      .limit(50),
  );

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const ids = rows
    .map((row) => row.customer_id)
    .filter((id): id is string => Boolean(id));

  if (ids.length === 0) {
    return rows.map((row) => ({ ...row, customer: null }));
  }

  const { data: customers } = await executeWithAdminFallback((client) =>
    client
      .schema("car_rental")
      .from("customers")
      .select("id, first_name, last_name, email, phone")
      .in("id", ids),
  );

  const customerMap = new Map(
    (customers ?? []).map((record) => [record.id, record]),
  );

  return rows.map((row) => ({
    ...row,
    customer: row.customer_id ? customerMap.get(row.customer_id) ?? null : null,
  }));
}

export default async function TopCustomersReportPage() {
  const rows = await fetchTopCustomers();

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-slate-900">
          ลูกค้าที่เช่าบ่อยที่สุด
        </h2>
        <p className="text-sm text-slate-600">
          ข้อมูลจาก view{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
            mv_top_customers
          </code>
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <TopCustomersTable rows={rows} />
      </div>
    </section>
  );
}
