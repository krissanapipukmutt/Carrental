'use server';

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { statusSchema, createCarSchema } from "./schemas";
import type { CreateCarState } from "./schemas";

export async function updateCarStatus(formData: FormData) {
  const parsed = statusSchema.safeParse({
    carId: formData.get("carId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    console.error("updateCarStatus validation error", parsed.error.flatten());
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .schema("car_rental")
    .from("cars")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.carId);

  if (error) {
    console.error("updateCarStatus supabase error", error.message);
    return;
  }

  revalidatePath("/cars");
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

  const supabase = await createClient();
  const { error } = await supabase
    .schema("car_rental")
    .from("cars")
    .insert({
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
    });

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
