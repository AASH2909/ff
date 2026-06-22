import type { Shift, ShiftStatus } from "@/domain";
import type { CorrelatedInputDto, MoneyDto } from "@/application/dtos/common-dtos";
import { toMoneyDto } from "@/application/dtos/common-dtos";

export type ShiftDto = {
  id: string;
  cashierId: string;
  status: ShiftStatus;
  openingCash: MoneyDto;
  expectedCash: MoneyDto;
  openedAt: string;
  closedAt: string | null;
  closingCash: MoneyDto | null;
};

export type OpenShiftInputDto = CorrelatedInputDto & {
  tenantId: string;
  cashierId: string;
  openingCash: MoneyDto;
};

export type OpenShiftOutputDto = {
  shift: ShiftDto;
};

export type CloseShiftInputDto = CorrelatedInputDto & {
  tenantId: string;
  shiftId: string;
  closingCash: MoneyDto;
};

export type CloseShiftOutputDto = {
  shift: ShiftDto;
};

export function toShiftDto(shift: Shift): ShiftDto {
  const snapshot = shift.toSnapshot();

  return {
    id: snapshot.id,
    cashierId: snapshot.cashierId,
    status: snapshot.status,
    openingCash: toMoneyDto(snapshot.openingCash),
    expectedCash: toMoneyDto(snapshot.openingCash),
    openedAt: snapshot.openedAt.toISOString(),
    closedAt: snapshot.closedAt?.toISOString() ?? null,
    closingCash: snapshot.closingCash ? toMoneyDto(snapshot.closingCash) : null
  };
}
