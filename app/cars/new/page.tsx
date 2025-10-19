import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { AddCarForm } from "../add-car-form";

export default async function CarCreatePage() {
  const supabase = await createClient();

  const [{ data: branches, error: branchError }, { data: categories, error: categoryError }] =
    await Promise.all([
      supabase
        .from("branches")
        .select("id, name")
        .order("name", { ascending: true }) as Promise<{
        data: Database["public"]["Tables"]["branches"]["Row"][] | null;
        error: { message: string } | null;
      }>,
      supabase
        .from("vehicle_categories")
        .select("id, name, daily_rate")
        .order("name", { ascending: true }) as Promise<{
        data: Database["public"]["Tables"]["vehicle_categories"]["Row"][] | null;
        error: { message: string } | null;
      }>,
    ]);

  if (branchError || categoryError) {
    throw new Error(
      branchError?.message ?? categoryError?.message ?? "ไม่สามารถดึงข้อมูลรถได้",
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          จัดการรถ
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">เพิ่มรถใหม่</h2>
        <p className="text-sm text-slate-600">
          บันทึกข้อมูลรถใหม่เข้าสู่ระบบ พร้อมระบุหมวดหมู่ สาขา และสถานะเริ่มต้น
        </p>
      </header>

      <AddCarForm
        branches={branches ?? []}
        categories={categories ?? []}
      />
    </section>
  );
}
