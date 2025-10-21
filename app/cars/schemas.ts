import { z } from "zod";
import { CAR_STATUSES, type CarStatus } from "./constants";

export const statusSchema = z.object({
  carId: z
    .string()
    .uuid({ message: "carId ต้องเป็น UUID" }),
  status: z.enum(CAR_STATUSES),
});

const currentYear = new Date().getFullYear();

export const createCarSchema = z.object({
  category_id: z
    .string({ required_error: "กรุณาเลือกหมวดหมู่รถ" })
    .uuid({ message: "category_id ต้องเป็น UUID" }),
  branch_id: z
    .string()
    .uuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  registration_no: z
    .string({ required_error: "กรุณากรอกทะเบียนรถ" })
    .min(3, "ทะเบียนรถต้องมีอย่างน้อย 3 ตัวอักษร"),
  vin: z
    .string()
    .min(10, "หมายเลขตัวถังต้องมีอย่างน้อย 10 ตัวอักษร")
    .max(20)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  make: z
    .string({ required_error: "กรุณากรอกยี่ห้อรถ" })
    .min(2),
  model: z
    .string({ required_error: "กรุณากรอกรุ่นรถ" })
    .min(1),
  year: z.coerce
    .number({ invalid_type_error: "ปีรถต้องเป็นตัวเลข" })
    .int()
    .min(1990, "ระบบรองรับรถตั้งแต่ปี 1990 ขึ้นไป")
    .max(currentYear + 1, `ปีรถต้องไม่เกิน ${currentYear + 1}`),
  color: z.string().optional().or(z.literal("").transform(() => undefined)),
  mileage: z.coerce
    .number({ invalid_type_error: "เลขไมล์ต้องเป็นตัวเลข" })
    .int()
    .min(0, "เลขไมล์ต้องไม่ติดลบ"),
  status: z.enum(CAR_STATUSES).default("available" as CarStatus),
});

export type CreateCarState = {
  success: boolean;
  message: string;
};

export const initialCreateCarState: CreateCarState = {
  success: false,
  message: "",
};
