/** Dev / stub response until real WeChat prepay is wired. */
export interface OrderPaymentPrepareResult {
  channel: 'mock' | 'wechat_jsapi';
  orderId: string;
  /** For mock channel: call confirm with this token. */
  mockConfirmToken?: string;
}
