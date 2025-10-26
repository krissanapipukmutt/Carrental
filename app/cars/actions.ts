'use server';

import { revalidatePath } from "next/cache";
import { executeWithAdminFallback } from "@/lib/supabase/query-helpers";
import type { Database } from "@/lib/supabase/types";
import { statusSchema, createCarSchema } from "./schemas";
import type { CreateCarState } from "./schemas";

export async function updateCarStatus(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const parsed = statusSchema.safeParse({
    carId: formData.get("carId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    console.error("updateCarStatus validation error", parsed.error.flatten());
    return {
      success: false,
      error: "ข้อมูลไม่ถูกต้อง",
    };
  }

  const { error } =
    await executeWithAdminFallback<
      Database["car_rental"]["Tables"]["cars"]["Row"]
    >((client) =>
      client
        .schema("car_rental")
        .from("cars")
        .update({ status: parsed.data.status })
        .eq("id", parsed.data.carId),
    );

  if (error) {
    console.error("updateCarStatus supabase error", error.message);
    return {
      success: false,
      error: error.message ?? "ไม่สามารถอัปเดตสถานะได้",
    };
  }

  return {
    success: true,
  };
}

export async function createCar(
  _prevState: CreateCarState,
  formData: FormData,
): Promise<CreateCarState> {
  const parsed = createCarSchema.safeParse({
    category_id: formData.get("category_id"),
    branch_id: formData.get("branch_id"),
    registration_no: formData.get("registration_no"),
    vin: formData.get("vin"),
    make: formData.get("make"),
    model: formData.get("model"),
    year: formData.get("year"),
    color: formData.get("color"),
    mileage: formData.get("mileage"),
    status: formData.get("status") ?? "available",
  });

  if (!parsed.success) {
    const firstError =
      Object.values(parsed.error.flatten().fieldErrors)
        .flat()
        .filter(Boolean)[0] ?? "ข้อมูลไม่ถูกต้อง";
    return {
      success: false,
      message: firstError,
    };
  }

  const payload: Database["car_rental"]["Tables"]["cars"]["Insert"] = {
    category_id: parsed.data.category_id,
    branch_id: parsed.data.branch_id,
    registration_no: parsed.data.registration_no,
    vin: parsed.data.vin,
    make: parsed.data.make,
    model: parsed.data.model,
    year: parsed.data.year,
    color: parsed.data.color,
    mileage: parsed.data.mileage,
    status: parsed.data.status,
  };

  const { error } =
    await executeWithAdminFallback<Database["car_rental"]["Tables"]["cars"]["Row"]>(
      (client) =>
        client.schema("car_rental").from("cars").insert(payload),
    );

  if (error) {
    console.error("createCar supabase error", error.message);
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/cars");
  return {
    success: true,
    message: "เพิ่มรถเรียบร้อยแล้ว",
  };
}
