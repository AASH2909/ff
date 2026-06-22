import type { CurrencyCode, ShiftStatus } from "@/domain";

export type MoneyDto = {
  amount: number;
  currency: CurrencyCode;
};

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

export type OpenShiftInputDto = {
  tenantId: string;
  cashierId: string;
  openingCash: MoneyDto;
};

export type OpenShiftOutputDto = {
  shift: ShiftDto;
};

export type CloseShiftInputDto = {
  tenantId: string;
  shiftId: string;
  closingCash: MoneyDto;
};

export type CloseShiftOutputDto = {
  shift: ShiftDto;
};

export function toShiftDto(shift: import("@/domain").Shift): ShiftDto {
  const snapshot = shift.toSnapshot();

  return {
    id: snapshot.id,
    cashierId: snapshot.cashierId,
    status: snapshot.status,
    openingCash: {
      amount: snapshot.openingCash.amount,
      currency: snapshot.openingCash.currency
    },
    expectedCash: {
      amount: snapshot.openingCash.amount,
      currency: snapshot.openingCash.currency
    },
    openedAt: snapshot.openedAt.toISOString(),
    closedAt: snapshot.closedAt?.toISOString() ?? null,
    closingCash: snapshot.closingCash
      ? {
          amount: snapshot.closingCash.amount,
          currency: snapshot.closingCash.currency
        }
      : null
  };
}
