import { z } from "zod";

export const paymentMethods = [
  "cash",
  "credit_card",
  "debit_card",
  "bank_transfer",
  "e_wallet",
] as const;

const datetimeSchema = z
  .string({ required_error: "กรุณากำหนดวันและเวลา" })
  .min(1, "ต้องระบุวันและเวลา")
  .transform((value) => new Date(value))
  .refine((value) => !Number.isNaN(value.getTime()), "รูปแบบวันเวลาไม่ถูกต้อง");

export const createRentalSchema = z
  .object({
    contract_no: z.string().min(3, "เลขสัญญาต้องมีอย่างน้อย 3 ตัวอักษร").optional(),
    customer_id: z
      .string({ required_error: "กรุณาเลือกลูกค้า" })
      .uuid({ message: "รูปแบบรหัสลูกค้าไม่ถูกต้อง" }),
    car_id: z
      .string({ required_error: "กรุณาเลือกรถ" })
      .uuid({ message: "รูปแบบรหัสรถไม่ถูกต้อง" }),
    pickup_datetime: datetimeSchema,
    return_datetime: datetimeSchema,
    daily_rate: z.coerce
      .number({ invalid_type_error: "กรุณากรอกราคาต่อวันเป็นตัวเลข" })
      .positive("ราคาต่อวันต้องมากกว่า 0"),
    discount: z.coerce
      .number({ invalid_type_error: "กรุณากรอกส่วนลดเป็นตัวเลข" })
      .min(0, "ส่วนลดต้องไม่ติดลบ")
      .default(0)
      .optional(),
    notes: z
      .string()
      .max(1000, "บันทึกต้องมีความยาวไม่เกิน 1000 ตัวอักษร")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    deposit_amount: z
      .union([
        z.literal("").transform(() => undefined),
        z.coerce
          .number({ invalid_type_error: "จำนวนเงินต้องเป็นตัวเลข" })
          .min(0, "จำนวนเงินต้องไม่ติดลบ"),
      ])
      .optional(),
    payment_method: z
      .union([z.literal(""), z.enum(paymentMethods)])
      .optional()
      .transform((value) => (value ? value : undefined)),
  })
  .refine(
    (data) => data.return_datetime.getTime() > data.pickup_datetime.getTime(),
    {
      message: "วันคืนรถต้องหลังวันรับรถ",
      path: ["return_datetime"],
    },
  )
  .refine(
    (data) => !(data.deposit_amount && !data.payment_method),
    {
      message: "กรุณาเลือกช่องทางการชำระเงินสำหรับมัดจำ",
      path: ["payment_method"],
    },
  );

export type CreateRentalInput = z.infer<typeof createRentalSchema>;

export type CreateRentalState = {
  success: boolean;
  message: string;
};

export const initialCreateRentalState: CreateRentalState = {
  success: false,
  message: "",
};
*** End of File
