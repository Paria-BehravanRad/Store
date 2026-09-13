export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export type PaymentTokenRequest = {
  amountRials: number;
  resNum: string;
  redirectUrl: string;
  cellNumber?: string;
};

export type PaymentTokenResult = {
  token: string;
  redirectUrl: string;
  raw?: unknown;
};

export type PaymentVerifyResult = {
  success: boolean;
  refNum: string;
  amountRials?: number;
  raw?: unknown;
};

export interface PaymentGateway {
  requestToken(input: PaymentTokenRequest): Promise<PaymentTokenResult>;
  verify(refNum: string): Promise<PaymentVerifyResult>;
  reverse?(refNum: string): Promise<void>;
}
