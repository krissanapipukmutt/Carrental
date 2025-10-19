import { executeWithAdminFallback } from "@/lib/supabase/query-helpers";

const statusLabels: Record<
  string,
  { label: string; dot: string; description: string }
> = {
  available: {
    label: "ว่าง",
    dot: "bg-emerald-500",
    description: "พร้อมให้เช่า",
  },
  reserved: {
    label: "จองแล้ว",
    dot: "bg-amber-500",
    description: "ถูกจองไว้ล่วงหน้า",
  },
  rented: {
    label: "กำลังเช่า",
    dot: "bg-blue-500",
    description: "อยู่ระหว่างสัญญาเช่า",
  },
  maintenance: {
    label: "ซ่อมบำรุง",
    dot: "bg-rose-500",
    description: "กำลังดูแล/ซ่อม",
  },
  retired: {
    label: "ปลดระวาง",
    dot: "bg-slate-400",
    description: "หยุดให้บริการ",
  },
};

type CarStatusSummary = {
  total: number;
  statusCounts: Record<string, number>;
  error: string | null;
};

async function fetchCarStatusSummary(): Promise<CarStatusSummary> {
  try {
    const { data, error } = await executeWithAdminFallback((client) =>
      client.schema("car_rental").from("cars").select("status"),
    );

    if (error) {
      throw error;
    }

    const statusCounts = (data ?? []).reduce<Record<string, number>>(
      (acc, row) => {
        const key = row.status ?? "unknown";
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {}
    );

    return {
      total: data?.length ?? 0,
      statusCounts,
      error: null,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "ไม่สามารถดึงข้อมูลสถานะรถได้";

    return {
      total: 0,
      statusCounts: {},
      error: message,
    };
  }
}

type CarStatusSummaryCardProps = {
  title?: string;
  description?: string;
  className?: string;
};

export async function CarStatusSummaryCard({
  title = "สรุปสถานะรถปัจจุบัน",
  description = "ดึงข้อมูลสถานะจากตาราง cars",
  className,
}: CarStatusSummaryCardProps) {
  const summary = await fetchCarStatusSummary();

  if (summary.error) {
    return (
      <div
        className={`rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 ${className ?? ""}`}
      >
        ไม่สามารถโหลดข้อมูลสถานะรถ: {summary.error}
        <div className="mt-2 text-xs text-rose-600">
          ตรวจสอบการตั้งค่า .env และนโยบาย RLS ของตาราง cars
        </div>
      </div>
    );
  }

  if (summary.total === 0) {
    return (
      <div
        className={`rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 ${className ?? ""}`}
      >
        ยังไม่มีข้อมูลรถในระบบ
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className ?? ""}`}
    >
      <div className="space-y-1">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600">
          {description} • จำนวนรถทั้งหมด{" "}
          {summary.total.toLocaleString("th-TH")} คัน
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(summary.statusCounts).map(([status, count]) => {
          const meta =
            statusLabels[status] ??
            ({
              label: status,
              dot: "bg-slate-400",
              description: "ไม่ทราบสถานะ",
            } as const);

          return (
            <div
              key={status}
              className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${meta.dot}`}
                    aria-hidden
                  />
                  {meta.label}
                </div>
                <span className="text-base font-semibold text-slate-900">
                  {count.toLocaleString("th-TH")} คัน
                </span>
              </div>
              <p className="text-xs text-slate-500">{meta.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
