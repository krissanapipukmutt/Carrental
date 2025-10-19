import { CarStatusSummaryCard } from "@/components/reports/car-status-summary";

const summaryCards = [
  {
    label: "รายได้เดือนนี้",
    value: "฿0.00",
    description: "จะดึงจากรายงาน mv_revenue_by_period",
  },
  {
    label: "จำนวนรถที่ถูกเช่า",
    value: "0 / 0",
    description: "ข้อมูลจากสถานะรถในตาราง cars",
  },
  {
    label: "สัญญากำลังดำเนินการ",
    value: "0",
    description: "ข้อมูลจาก rental_contracts ที่สถานะ active",
  },
];

const upcomingTasks = [
  "เชื่อมต่อ Supabase และตั้งค่า RLS",
  "สร้างหน้าสร้างสัญญาเช่า (wizard)",
  "บันทึกการตรวจสภาพรถและการชำระเงิน",
  "สร้างแดชบอร์ดรายงาน 5 ประเภท",
];
export default async function DashboardPage() {
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">
          ภาพรวมการดำเนินงาน
        </h2>
        <p className="text-sm text-slate-600">
          เมื่อเชื่อมต่อฐานข้อมูลแล้ว การ์ดเหล่านี้จะแสดงข้อมูลสดจาก
          Supabase
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {card.value}
            </p>
            <p className="mt-3 text-xs text-slate-500">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            ขั้นตอนการเชื่อมต่อ Supabase
          </h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600">
            <li>สร้างโปรเจกต์ Supabase และรันสคริปต์ schema ใน docs</li>
            <li>คัดลอก URL และ keys มาใส่ในไฟล์ `.env.local`</li>
            <li>อัปเดต `lib/supabase/types.ts` ด้วยประเภทข้อมูลจริง</li>
            <li>เริ่มเขียน Server Actions หรือ Route Handlers</li>
          </ol>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            งานที่ต้องพัฒนา
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {upcomingTasks.map((task) => (
              <li key={task} className="flex gap-2">
                <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-500" />
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <CarStatusSummaryCard className="mt-6" description="ข้อมูลสดจากตาราง cars ใน Supabase" />
    </section>
  );
}
