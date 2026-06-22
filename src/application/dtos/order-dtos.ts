import type { CurrencyCode, Order, OrderStatus, PaymentMethod, PaymentStatus } from "@/domain";

export type MoneyDto = {
  amount: number;
  currency: CurrencyCode;
};

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

export type CreateOrderInputDto = {
  tenantId: string;
  currency?: CurrencyCode;
};

export type CreateOrderOutputDto = {
  order: OrderDto;
};

export type AddOrderItemInputDto = {
  tenantId: string;
  orderId: string;
  productId: string;
  quantity?: number;
};

export type AddOrderItemOutputDto = {
  order: OrderDto;
};

export type RemoveOrderItemInputDto = {
  tenantId: string;
  orderId: string;
  productId: string;
  quantity?: number;
};

export type RemoveOrderItemOutputDto = {
  order: OrderDto;
};

export type CancelOrderInputDto = {
  tenantId: string;
  orderId: string;
};

export type CancelOrderOutputDto = {
  order: OrderDto;
};

export type PayOrderInputDto = {
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
      unitPrice: {
        amount: item.unitPrice.amount,
        currency: item.unitPrice.currency
      },
      quantity: item.quantity,
      lineTotal: {
        amount: item.lineTotal.amount,
        currency: item.lineTotal.currency
      }
    })),
    total: {
      amount: snapshot.total.amount,
      currency: snapshot.total.currency
    },
    payment: snapshot.payment
      ? {
          id: snapshot.payment.id,
          orderId: snapshot.payment.orderId,
          amount: {
            amount: snapshot.payment.amount.amount,
            currency: snapshot.payment.amount.currency
          },
          method: snapshot.payment.method,
          status: snapshot.payment.status
        }
      : null
  };
}
