import { Money, type CurrencyCode } from "@/domain";

export type MoneyDto = {
  amount: number;
  currency: CurrencyCode;
};

export type CorrelatedInputDto = {
  correlationId?: string;
  causationId?: string;
};

export function toMoneyDto(money: Money): MoneyDto {
  return {
    amount: money.amount,
    currency: money.currency
  };
}

export function moneyFromDto(money: MoneyDto): Money {
  return Money.fromMinor(money.amount, money.currency);
}
