import type { Database } from "@/lib/supabase/types";

export type RentalRow =
  Database["car_rental"]["Tables"]["rental_contracts"]["Row"];
export type CustomerRow = Database["car_rental"]["Tables"]["customers"]["Row"];
export type CarRow = Database["car_rental"]["Tables"]["cars"]["Row"];

export type RentalWithRelations = RentalRow & {
  customers: Pick<CustomerRow, "first_name" | "last_name"> | null;
  cars: Pick<CarRow, "registration_no" | "make" | "model"> | null;
};
