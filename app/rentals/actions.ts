"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { createRentalSchema, type CreateRentalState, initialCreateRentalState } from "./schemas";

const msPerDay = 1000 * 60 * 60 * 24;

const paymentTypeSchema = z.enum(["deposit", "rental_fee", "late_fee", "refund"], {
  required_error: "ประเภทการชำระเงินไม่ถูกต้อง",
});

const paymentMethodSchema = z.enum([
  "cash",
  "credit_card",
  "debit_card",
  "bank_transfer",
  "e_wallet",
]);

const generateContractNo = (currentCount: number) => {
  const year = new Date().getFullYear();
  return `CR-${year}-${String(currentCount + 1).padStart(4, "0")}`;
};

const getSupabaseForAction = async () => {
  try {
    return getAdminClient();
  } catch {
    return await createClient();
  }
};

export async function createRental(
  _prevState: CreateRentalState = initialCreateRentalState,
  formData: FormData,
): Promise<CreateRentalState> {
  void _prevState;
  try {
    const parsed = createRentalSchema.safeParse({
      contract_no: formData.get("contract_no") ?? undefined,
      customer_id: formData.get("customer_id"),
      car_id: formData.get("car_id"),
      pickup_datetime: formData.get("pickup_datetime"),
      return_datetime: formData.get("return_datetime"),
      daily_rate: formData.get("daily_rate"),
      discount: formData.get("discount") ?? undefined,
      notes: formData.get("notes") ?? undefined,
      deposit_amount: formData.get("deposit_amount") ?? undefined,
      payment_method: formData.get("payment_method") ?? undefined,
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

    const data = parsed.data;
    const supabase = await getSupabaseForAction();

    const dayDiff = Math.max(
      1,
      Math.ceil(
        (data.return_datetime.getTime() - data.pickup_datetime.getTime()) /
          msPerDay,
      ),
    );

    const totalAmount = Math.max(
      0,
      data.daily_rate * dayDiff - (data.discount ?? 0),
    );

    let contractNo = data.contract_no;
    if (!contractNo) {
      const { count } = await supabase
        .schema("car_rental")
        .from("rental_contracts")
        .select("id", { count: "exact", head: true });
      contractNo = generateContractNo(count ?? 0);
    }

    const { data: rentalInsert, error: rentalError } = await supabase
      .schema("car_rental")
      .from("rental_contracts")
      .insert({
        contract_no: contractNo,
        customer_id: data.customer_id,
        car_id: data.car_id,
        pickup_datetime: data.pickup_datetime.toISOString(),
        return_datetime: data.return_datetime.toISOString(),
        rental_status: "pending",
        daily_rate: data.daily_rate,
        discount: data.discount ?? 0,
        notes: data.notes,
        late_fee: 0,
      })
      .select("id")
      .single();

    if (rentalError || !rentalInsert) {
      console.error("createRental insert error", rentalError?.message);
      return {
        success: false,
        message: rentalError?.message ?? "ไม่สามารถบันทึกสัญญาเช่าได้",
      };
    }

    const { error: carUpdateError } = await supabase
      .schema("car_rental")
      .from("cars")
      .update({ status: "reserved" })
      .eq("id", data.car_id)
      .in("status", ["available", "reserved"]);

    if (carUpdateError) {
      console.error("createRental update car error", carUpdateError.message);
    }

    if (data.deposit_amount && data.deposit_amount > 0 && data.payment_method) {
      const paymentMethod = paymentMethodSchema.parse(data.payment_method);
      const { error: paymentError } = await supabase
        .schema("car_rental")
        .from("payments")
        .insert({
          rental_id: rentalInsert.id,
          amount: data.deposit_amount,
          payment_type: paymentTypeSchema.parse("deposit"),
          payment_method: paymentMethod,
          notes: "บันทึกจากฟอร์มสร้างสัญญา",
        });

      if (paymentError) {
        console.error("createRental payment error", paymentError.message);
      }
    }

    revalidatePath("/rentals");
    revalidatePath("/cars");

    return {
      success: true,
      message: `สร้างสัญญาเช่า ${contractNo} เรียบร้อยแล้ว (ยอดประมาณ ${totalAmount.toLocaleString("th-TH", {
        style: "currency",
        currency: "THB",
      })})`,
    };
  } catch (error) {
    console.error("createRental unexpected error", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดระหว่างบันทึกสัญญา",
    };
  }
}
