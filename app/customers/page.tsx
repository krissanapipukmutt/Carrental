import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];
type CustomerQueryRow = CustomerRow & {
  rental_contracts: { id: string }[] | null;
};

type CustomerRecord = CustomerRow & {
  rental_count?: number;
};

async function fetchCustomers(): Promise<{
  customers: CustomerRecord[];
  error: string | null;
}> {
  try {
    let supabase;

    try {
      supabase = getAdminClient();
    } catch {
      supabase = await createClient();
    }

    const { data, error } = await supabase
      .from("customers")
      .select(
        `
        id,
        first_name,
        last_name,
        email,
        phone,
        driver_license_no,
        driver_license_expiry,
        created_at,
        rental_contracts ( id )
      `,
      )
      .order("first_name", { ascending: true });

    if (error) {
      throw error;
    }

    const customers = ((data ?? []) as CustomerQueryRow[]).map((item) => {
      const { rental_contracts, ...rest } = item;
      return {
        ...rest,
        rental_count: rental_contracts?.length ?? 0,
      } satisfies CustomerRecord;
    });

    return { customers, error: null };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "ไม่สามารถดึงข้อมูลลูกค้าได้";
    return { customers: [], error: message };
  }
}

function CustomerCard({ customer }: { customer: CustomerRecord }) {
  const fullName = `${customer.first_name} ${customer.last_name}`.trim();
  const licenseExpiry = customer.driver_license_expiry
    ? new Date(customer.driver_license_expiry).toLocaleDateString("th-TH")
    : "-";

  return (
    <li className="px-6 py-4 text-sm text-slate-600">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-base font-semibold text-slate-900">
          {fullName || "ไม่ระบุชื่อ"}
        </p>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {customer.rental_count ?? 0} ครั้งที่เช่า
        </span>
      </div>

      <p className="text-xs text-slate-500">
        สร้างเมื่อ {new Date(customer.created_at).toLocaleDateString("th-TH")}
      </p>

      <div className="mt-2 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
        <span>อีเมล: {customer.email || "-"}</span>
        <span>โทร: {customer.phone || "-"}</span>
        <span>ใบขับขี่: {customer.driver_license_no || "-"}</span>
        <span>หมดอายุใบขับขี่: {licenseExpiry}</span>
      </div>
    </li>
  );
}

export default async function CustomersPage() {
  const { customers, error } = await fetchCustomers();

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        เกิดข้อผิดพลาดในการโหลดลูกค้า: {error}
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <section className="space-y-6">
        <header className="space-y-1">
          <h2 className="text-2xl font-semibold text-slate-900">ลูกค้า</h2>
          <p className="text-sm text-slate-600">
            เก็บข้อมูลลูกหนี้ การตรวจสอบใบขับขี่ และประวัติการเช่า
          </p>
        </header>

        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          ยังไม่มีข้อมูลลูกค้าในระบบ
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-slate-900">ลูกค้า</h2>
        <p className="text-sm text-slate-600">
          เก็บข้อมูลลูกหนี้ การตรวจสอบใบขับขี่ และประวัติการเช่า
        </p>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <p className="text-sm font-medium text-slate-700">
            รายชื่อลูกค้าจากตาราง customers ({customers.length} ราย)
          </p>
          <button className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
            + เพิ่มลูกค้า
          </button>
        </div>
        <ul className="divide-y divide-slate-200">
          {customers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </ul>
      </div>
    </section>
  );
}
