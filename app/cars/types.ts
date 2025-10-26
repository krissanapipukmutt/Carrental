import type { Database } from "@/lib/supabase/types";

type CarRow = Database["car_rental"]["Tables"]["cars"]["Row"];
type CategoryRow =
  Database["car_rental"]["Tables"]["vehicle_categories"]["Row"];
type BranchRow = Database["car_rental"]["Tables"]["branches"]["Row"];
type MaintenanceRow =
  Database["car_rental"]["Tables"]["maintenance_records"]["Row"];

export type CarWithRelations = CarRow & {
  vehicle_categories: Pick<CategoryRow, "name" | "daily_rate"> | null;
  branches: Pick<BranchRow, "name"> | null;
  maintenance_records: Pick<
    MaintenanceRow,
    "id" | "maintenance_date" | "maintenance_type" | "cost" | "odometer"
  >[] | null;
};
