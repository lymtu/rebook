export const ORDER_STATUSES = [
  'pending_payment',
  'paid',
  'awaiting_handover',
  'completed',
  'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_CHANNELS = ['wechat_jsapi', 'mock', 'web_stub'] as const;
export type PaymentChannel = (typeof PAYMENT_CHANNELS)[number];
