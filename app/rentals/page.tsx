import Link from "next/link";
import { executeWithAdminFallback } from "@/lib/supabase/query-helpers";
import type { Database } from "@/lib/supabase/types";

type RentalRow =
  Database["car_rental"]["Tables"]["rental_contracts"]["Row"];
type CustomerRow = Database["car_rental"]["Tables"]["customers"]["Row"];
type CarRow = Database["car_rental"]["Tables"]["cars"]["Row"];

type RentalWithRelations = RentalRow & {
  customers: Pick<CustomerRow, "first_name" | "last_name"> | null;
  cars: Pick<CarRow, "registration_no" | "make" | "model"> | null;
};

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
});

const statusConfig: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  pending: {
    label: "รอดำเนินการ",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  active: {
    label: "กำลังเช่า",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  completed: {
    label: "เสร็จสิ้น",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "ยกเลิก",
    badge: "bg-slate-200 text-slate-600",
    dot: "bg-slate-400",
  },
  overdue: {
    label: "เกินกำหนด",
    badge: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
  },
};

const tableHeaders = [
  "เลขที่สัญญา",
  "ลูกค้า",
  "รถ",
  "วันที่รับ",
  "วันที่คืน",
  "สถานะ",
];

async function fetchRecentRentals(): Promise<{
  rentals: RentalWithRelations[];
  error: string | null;
}> {
  try {
    const { data, error } = await executeWithAdminFallback((client) =>
      client
        .schema("car_rental")
        .from("rental_contracts")
        .select(
          `
          id,
          contract_no,
          pickup_datetime,
          return_datetime,
          rental_status,
          total_amount,
          customers (
            first_name,
            last_name
          ),
          cars (
            registration_no,
            make,
            model
          )
        `
        )
        .order("pickup_datetime", { ascending: false })
        .limit(10),
    );

    if (error) {
      throw error;
    }

    return {
      rentals: (data ?? []) as RentalWithRelations[],
      error: null,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "ไม่สามารถเชื่อมต่อ Supabase ได้";

    return {
      rentals: [],
      error: message,
    };
  }
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

function formatAmount(value: string | number | null) {
  if (value === null || value === undefined) {
    return "-";
  }

  const numeric =
    typeof value === "string" ? Number.parseFloat(value) : value;

  if (Number.isNaN(numeric)) {
    return "-";
  }

  return currencyFormatter.format(numeric);
}

function getStatusBadge(status: RentalRow["rental_status"]) {
  const config =
    statusConfig[status] ??
    ({
      label: status ?? "ไม่ทราบสถานะ",
      badge: "bg-slate-200 text-slate-600",
      dot: "bg-slate-400",
    } as const);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${config.badge}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dot}`} aria-hidden />
      {config.label}
    </span>
  );
}

function getCustomerName(rental: RentalWithRelations) {
  const customer = rental.customers;
  if (!customer) {
    return <span className="text-slate-400">ไม่ระบุ</span>;
  }

  return `${customer.first_name} ${customer.last_name}`.trim();
}

function getCarLabel(rental: RentalWithRelations) {
  const car = rental.cars;
  if (!car) {
    return <span className="text-slate-400">ไม่ระบุ</span>;
  }

  return `${car.make} ${car.model} (${car.registration_no})`;
}

export default async function RentalsPage() {
  const { rentals, error } = await fetchRecentRentals();

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">สัญญาเช่า</h2>
          <p className="text-sm text-slate-600">
            จัดการการจอง การรับรถ/คืนรถ และชำระเงิน
          </p>
        </div>
        <Link
          href="/rentals/new"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700"
        >
          + สร้างสัญญาใหม่
        </Link>
      </header>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          เกิดข้อผิดพลาดในการดึงข้อมูล: {error}
          <div className="mt-2 text-xs text-rose-600">
            ตรวจสอบค่าตัวแปร .env และสิทธิ์ของ Supabase RLS
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          แสดงตัวอย่างสัญญาเช่า 10 รายการล่าสุดจาก Supabase
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] table-fixed border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              {tableHeaders.map((header) => (
                <th key={header} className="px-4 py-3 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rentals.length === 0 ? (
              <tr className="border-t border-slate-200">
                <td
                  colSpan={tableHeaders.length}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  ยังไม่มีข้อมูลสัญญาเช่าในระบบ
                </td>
              </tr>
            ) : (
              rentals.map((rental) => (
                <tr
                  key={rental.id}
                  className="border-t border-slate-200 transition hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <Link
                      href={`/rentals/${rental.id}`}
                      className="hover:underline"
                    >
                      {rental.contract_no}
                    </Link>
                    <div className="text-xs text-slate-500">
                      {formatAmount(rental.total_amount)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {getCustomerName(rental)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {getCarLabel(rental)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatDate(rental.pickup_datetime)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatDate(rental.return_datetime)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {getStatusBadge(rental.rental_status)}
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
