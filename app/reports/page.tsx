import Link from "next/link";

const reports = [
  { href: "/reports/vehicle-status", label: "สถานะรถปัจจุบัน" },
  { href: "/reports/revenue", label: "รายงานรายได้" },
  { href: "/reports/utilization", label: "อัตราการใช้งานรถ" },
  { href: "/reports/top-customers", label: "ลูกค้าประจำ" },
  { href: "/reports/maintenance", label: "ประวัติซ่อมบำรุง" },
  { href: "/reports/overdue", label: "สัญญาค้างคืน" },
];

export default function ReportsHubPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-slate-900">
          แดชบอร์ดรายงาน
        </h2>
        <p className="text-sm text-slate-600">
          เลือกรายงานที่ต้องการดูรายละเอียดหรือส่งออกข้อมูล
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <Link
            key={report.href}
            href={report.href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-slate-900">
              {report.label}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              คลิกเพื่อดูแดชบอร์ดและตัวอย่างการเชื่อมต่อข้อมูล
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
