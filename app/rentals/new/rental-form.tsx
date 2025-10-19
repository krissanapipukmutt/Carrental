"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import type { Database } from "@/lib/supabase/types";
import { createRental } from "../actions";
import {
  initialCreateRentalState,
  type CreateRentalState,
  paymentMethods,
} from "../schemas";

const formatDateTimeLocal = (value: Date) => {
  const iso = value.toISOString();
  return iso.slice(0, 16);
};

type Customer = Pick<
  Database["car_rental"]["Tables"]["customers"]["Row"],
  "id" | "first_name" | "last_name" | "email"
>;

type CarOption = {
  id: string;
  label: string;
  defaultDailyRate: number | null;
};

type Props = {
  customers: Customer[];
  cars: CarOption[];
  suggestedContractNo: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "กำลังบันทึก..." : "สร้างสัญญาเช่า"}
    </button>
  );
}

export function RentalForm({ customers, cars, suggestedContractNo }: Props) {
  const router = useRouter();
  const [state, formAction] = useFormState<CreateRentalState, FormData>(
    createRental,
    initialCreateRentalState,
  );
  const [selectedCarId, setSelectedCarId] = useState<string>(cars[0]?.id ?? "");

  const selectedCar = useMemo(
    () => cars.find((car) => car.id === selectedCarId) ?? null,
    [cars, selectedCarId],
  );

  useEffect(() => {
    if (state.success) {
      router.push("/rentals");
    }
  }, [state.success, router]);

  const defaultPickup = formatDateTimeLocal(new Date());
  const defaultReturn = formatDateTimeLocal(
    new Date(Date.now() + 24 * 60 * 60 * 1000),
  );

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
          <label htmlFor="contract_no" className="text-sm font-medium text-slate-700">
            เลขที่สัญญาเช่า
          </label>
          <input
            id="contract_no"
            name="contract_no"
            defaultValue={suggestedContractNo}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="เช่น CR-2025-0003"
          />
          <p className="text-xs text-slate-500">
            หากเว้นว่าง ระบบจะสร้างเลขสัญญาให้อัตโนมัติ
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="customer_id" className="text-sm font-medium text-slate-700">
            ลูกค้า <span className="text-rose-500">*</span>
          </label>
          <select
            id="customer_id"
            name="customer_id"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            defaultValue={customers[0]?.id ?? ""}
          >
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.first_name} {customer.last_name} ({customer.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="car_id" className="text-sm font-medium text-slate-700">
            รถที่ต้องการเช่า <span className="text-rose-500">*</span>
          </label>
          <select
            id="car_id"
            name="car_id"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            value={selectedCarId}
            onChange={(event) => setSelectedCarId(event.target.value)}
          >
            {cars.map((car) => (
              <option key={car.id} value={car.id}>
                {car.label}
              </option>
            ))}
          </select>
          {selectedCar?.defaultDailyRate ? (
            <p className="text-xs text-slate-500">
              แนะนำราคา: {selectedCar.defaultDailyRate.toLocaleString("th-TH", {
                style: "currency",
                currency: "THB",
              })}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="daily_rate" className="text-sm font-medium text-slate-700">
            ราคาต่อวัน (บาท) <span className="text-rose-500">*</span>
          </label>
         <input
            key={`rate-${selectedCarId}`}
            id="daily_rate"
            name="daily_rate"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={selectedCar?.defaultDailyRate ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="pickup_datetime" className="text-sm font-medium text-slate-700">
            วันที่และเวลารับรถ <span className="text-rose-500">*</span>
          </label>
          <input
            id="pickup_datetime"
            name="pickup_datetime"
            type="datetime-local"
            defaultValue={defaultPickup}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="return_datetime" className="text-sm font-medium text-slate-700">
            วันที่และเวลาคืนรถ <span className="text-rose-500">*</span>
          </label>
          <input
            id="return_datetime"
            name="return_datetime"
            type="datetime-local"
            defaultValue={defaultReturn}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="discount" className="text-sm font-medium text-slate-700">
            ส่วนลด (บาท)
          </label>
          <input
            id="discount"
            name="discount"
            type="number"
            min="0"
            step="0.01"
            defaultValue="0"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="deposit_amount" className="text-sm font-medium text-slate-700">
            มัดจำ (บาท)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="deposit_amount"
              name="deposit_amount"
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <select
              name="payment_method"
              className="rounded-md border border-slate-300 px-2 py-2 text-xs shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              defaultValue=""
            >
              <option value="">วิธีชำระ</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-500">
            ระบุจำนวนเงินและเลือกวิธีชำระหากมีการมัดจำ
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium text-slate-700">
          บันทึกเพิ่มเติม
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="เช่น ลูกค้าต้องการคาร์ซีทเด็ก หรือรับรถที่สนามบิน"
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          ช่องที่มีเครื่องหมาย * จำเป็นต้องกรอก
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
