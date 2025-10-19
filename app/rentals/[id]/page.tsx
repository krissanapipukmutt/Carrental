type RentalDetailPageProps = {
  params: {
    id: string;
  };
};

export default function RentalDetailPage({ params }: RentalDetailPageProps) {
  const { id } = params;

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <p className="text-xs uppercase text-slate-500 tracking-wide">
          รายละเอียดสัญญาเช่า
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">หมายเลข {id}</h2>
        <p className="text-sm text-slate-600">
          หน้านี้จะแสดงข้อมูลจากตาราง rental_contracts, customers, cars,
          payments และ inspections
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900">ข้อมูลสัญญา</h3>
          <p className="mt-2 text-sm text-slate-600">
            เพิ่มรายละเอียดจาก Supabase เช่น วันรับรถ วันคืนรถ ราคาค่าเช่า
            ส่วนลด ค่าปรับ ฯลฯ
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">การชำระเงิน</h3>
          <p className="mt-2 text-sm text-slate-600">
            สรุปรายการจ่ายล่าสุดและปุ่มเพิ่มการชำระเงิน
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
        TODO: ดึงข้อมูลจาก materialized view เพื่อแสดงสถานะการคืนรถและตรวจสภาพ
      </div>
    </section>
  );
}
