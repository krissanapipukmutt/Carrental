"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import type { Database } from "@/lib/supabase/types";
import { CAR_STATUSES, CAR_STATUS_LABELS } from "./constants";
import { createCar } from "./actions";
import { initialCreateCarState, type CreateCarState } from "./schemas";

type Branch = Database["car_rental"]["Tables"]["branches"]["Row"];
type Category = Database["car_rental"]["Tables"]["vehicle_categories"]["Row"];

type Props = {
  branches: Branch[];
  categories: Category[];
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "กำลังบันทึก..." : "บันทึกข้อมูลรถ"}
    </button>
  );
}

export function AddCarForm({ branches, categories }: Props) {
  const router = useRouter();
  const [state, formAction] = useFormState<CreateCarState, FormData>(
    createCar,
    initialCreateCarState,
  );

  useEffect(() => {
    if (state.success) {
      router.push("/cars");
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            state.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="make" className="text-sm font-medium text-slate-700">
            ยี่ห้อรถ <span className="text-rose-500">*</span>
          </label>
          <input
            id="make"
            name="make"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="เช่น Toyota"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="model" className="text-sm font-medium text-slate-700">
            รุ่นรถ <span className="text-rose-500">*</span>
          </label>
          <input
            id="model"
            name="model"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="เช่น Yaris"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="year" className="text-sm font-medium text-slate-700">
            ปีรถ <span className="text-rose-500">*</span>
          </label>
          <input
            id="year"
            name="year"
            type="number"
            min="1990"
            max={new Date().getFullYear() + 1}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="color"
            className="text-sm font-medium text-slate-700"
          >
            สีรถ
          </label>
          <input
            id="color"
            name="color"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="เช่น สีแดง"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label
            htmlFor="registration_no"
            className="text-sm font-medium text-slate-700"
          >
            ทะเบียนรถ <span className="text-rose-500">*</span>
          </label>
          <input
            id="registration_no"
            name="registration_no"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="เช่น 8กข 1234"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="vin" className="text-sm font-medium text-slate-700">
            หมายเลขตัวถัง (VIN)
          </label>
          <input
            id="vin"
            name="vin"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="VN1ABC12345678901"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="category_id"
            className="text-sm font-medium text-slate-700"
          >
            หมวดหมู่รถ <span className="text-rose-500">*</span>
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            defaultValue=""
          >
            <option value="" disabled>
              -- เลือกหมวดหมู่ --
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.daily_rate?.toLocaleString("th-TH")}฿/วัน)
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="branch_id"
            className="text-sm font-medium text-slate-700"
          >
            ประจำสาขา
          </label>
          <select
            id="branch_id"
            name="branch_id"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            defaultValue=""
          >
            <option value="">-- ไม่ระบุสาขา --</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="mileage"
            className="text-sm font-medium text-slate-700"
          >
            เลขไมล์ปัจจุบัน (กม.) <span className="text-rose-500">*</span>
          </label>
          <input
            id="mileage"
            name="mileage"
            type="number"
            min="0"
            step="1"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="status"
            className="text-sm font-medium text-slate-700"
          >
            สถานะเริ่มต้น
          </label>
          <select
            id="status"
            name="status"
            defaultValue="available"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            {CAR_STATUSES.map((status) => (
              <option key={status} value={status}>
                {CAR_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          ช่องที่มีเครื่องหมาย * จำเป็นต้องกรอก
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            ยกเลิก
          </button>
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}
