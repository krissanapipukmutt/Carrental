import { CarStatusSummaryCard } from "@/components/reports/car-status-summary";

export default function VehicleStatusReportPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-slate-900">
          รายงานสถานะรถปัจจุบัน
        </h2>
        <p className="text-sm text-slate-600">
          สรุปจำนวนรถในระบบแยกตามสถานะ (ว่าง, จองแล้ว, กำลังเช่า, ซ่อมบำรุง,
          ปลดระวาง) พร้อมจำนวนรวมทั้งหมด
        </p>
      </header>

      <CarStatusSummaryCard />

      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          วิธีต่อยอดรายงานนี้
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>เพิ่มตัวกรองตามสาขา เพื่อดูสถานะรถของแต่ละสาขา</li>
          <li>
            เชื่อมกับ materialized view
            เพื่อวิเคราะห์แนวโน้มการใช้งานรถในช่วงเวลาต่างๆ
          </li>
          <li>
            ส่งออกข้อมูลสถานะรถเป็น CSV/PDF เพื่อใช้ประกอบการประชุมหรือรายงานผู้บริหาร
          </li>
        </ul>
      </div>
    </section>
  );
}
