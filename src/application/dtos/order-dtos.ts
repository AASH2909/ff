import type { CurrencyCode, Order, OrderStatus, PaymentMethod, PaymentStatus } from "@/domain";
import type { CorrelatedInputDto, MoneyDto } from "@/application/dtos/common-dtos";
import { toMoneyDto } from "@/application/dtos/common-dtos";

export type OrderItemDto = {
  id: string;
  productId: string;
  name: string;
  unitPrice: MoneyDto;
  quantity: number;
  lineTotal: MoneyDto;
};

export type PaymentDto = {
  id: string;
  orderId: string;
  amount: MoneyDto;
  method: PaymentMethod;
  status: PaymentStatus;
};

export type OrderDto = {
  id: string;
  status: OrderStatus;
  items: OrderItemDto[];
  total: MoneyDto;
  payment: PaymentDto | null;
};

export type CreateOrderInputDto = CorrelatedInputDto & {
  tenantId: string;
  currency?: CurrencyCode;
};

export type CreateOrderOutputDto = {
  order: OrderDto;
};

export type AddOrderItemInputDto = CorrelatedInputDto & {
  tenantId: string;
  orderId: string;
  productId: string;
  quantity?: number;
};

export type AddOrderItemOutputDto = {
  order: OrderDto;
};

export type RemoveOrderItemInputDto = CorrelatedInputDto & {
  tenantId: string;
  orderId: string;
  productId: string;
  quantity?: number;
};

export type RemoveOrderItemOutputDto = {
  order: OrderDto;
};

export type CancelOrderInputDto = CorrelatedInputDto & {
  tenantId: string;
  orderId: string;
  reason?: string;
};

export type CancelOrderOutputDto = {
  order: OrderDto;
};

export type PayOrderInputDto = CorrelatedInputDto & {
  tenantId: string;
  orderId: string;
  paymentMethod: PaymentMethod;
};

export type PayOrderOutputDto = {
  order: OrderDto;
};

export function toOrderDto(order: Order): OrderDto {
  const snapshot = order.toSnapshot();

  return {
    id: snapshot.id,
    status: snapshot.status,
    items: snapshot.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      unitPrice: toMoneyDto(item.unitPrice),
      quantity: item.quantity,
      lineTotal: toMoneyDto(item.lineTotal)
    })),
    total: toMoneyDto(snapshot.total),
    payment: snapshot.payment
      ? {
          id: snapshot.payment.id,
          orderId: snapshot.payment.orderId,
          amount: toMoneyDto(snapshot.payment.amount),
          method: snapshot.payment.method,
          status: snapshot.payment.status
        }
      : null
  };
}
