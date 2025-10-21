import { executeWithAdminFallback } from "@/lib/supabase/query-helpers";
import type { Database } from "@/lib/supabase/types";
import { OverdueTable } from "./overdue-table";

type OverdueRow = Database["car_rental"]["Views"]["mv_overdue_rentals"]["Row"];
type OverdueWithRelations = OverdueRow & {
  cars: {
    make: string | null;
    model: string | null;
    registration_no: string | null;
  } | null;
  customers: {
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  } | null;
};

async function fetchOverdue(): Promise<OverdueWithRelations[]> {
  const { data, error } = await executeWithAdminFallback((client) =>
    client
      .schema("car_rental")
      .from("mv_overdue_rentals")
      .select(
        "*, cars (make, model, registration_no), customers (first_name, last_name, phone)",
      )
      .order("overdue_days", { ascending: false }),
  );

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as OverdueWithRelations[];
}

export default async function OverdueReportPage() {
  const rows = await fetchOverdue();

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-slate-900">สัญญาที่ค้างคืน</h2>
        <p className="text-sm text-slate-600">
          ข้อมูลจาก view{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
            mv_overdue_rentals
          </code>
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <OverdueTable rows={rows} />
      </div>
    </section>
  );
}
