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

export type CarStatusMeta = {
  label: string;
  badge: string;
  dot: string;
  description: string;
};

export const CAR_STATUS_META: Record<CarStatus, CarStatusMeta> = {
  available: {
    label: CAR_STATUS_LABELS.available,
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    description: "พร้อมให้เช่า",
  },
  reserved: {
    label: CAR_STATUS_LABELS.reserved,
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    description: "มีผู้จองในอนาคต",
  },
  rented: {
    label: CAR_STATUS_LABELS.rented,
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
    description: "อยู่ระหว่างสัญญาเช่า",
  },
  maintenance: {
    label: CAR_STATUS_LABELS.maintenance,
    badge: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
    description: "อยู่ในขั้นตอนซ่อมบำรุง",
  },
  retired: {
    label: CAR_STATUS_LABELS.retired,
    badge: "bg-slate-200 text-slate-600",
    dot: "bg-slate-400",
    description: "ไม่ใช้งานแล้ว",
  },
};

const FALLBACK_STATUS_META: CarStatusMeta = {
  label: "ไม่ทราบสถานะ",
  badge: "bg-slate-200 text-slate-600",
  dot: "bg-slate-400",
  description: "",
};

export function getStatusConfig(status: string | null): CarStatusMeta {
  if (!status) {
    return FALLBACK_STATUS_META;
  }

  if ((CAR_STATUSES as readonly string[]).includes(status)) {
    return CAR_STATUS_META[status as CarStatus];
  }

  return {
    ...FALLBACK_STATUS_META,
    label:
      CAR_STATUS_LABELS[status as CarStatus] !== undefined
        ? CAR_STATUS_LABELS[status as CarStatus]
        : status,
  };
}
