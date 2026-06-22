import type { Shift } from "@/domain";

export interface ShiftRepository {
  findOpenShift(tenantId: string, cashierId: string): Promise<Shift | null>;
  findById(tenantId: string, shiftId: string): Promise<Shift | null>;
  save(tenantId: string, shift: Shift): Promise<void>;
}
