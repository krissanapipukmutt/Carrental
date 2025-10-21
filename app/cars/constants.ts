export const CAR_STATUSES = [
  "available",
  "reserved",
  "rented",
  "maintenance",
  "retired",
] as const;

export type CarStatus = (typeof CAR_STATUSES)[number];

export const CAR_STATUS_LABELS: Record<CarStatus, string> = {
  available: "ว่าง",
  reserved: "จองแล้ว",
  rented: "กำลังเช่า",
  maintenance: "ซ่อมบำรุง",
  retired: "ปลดระวาง",
};
