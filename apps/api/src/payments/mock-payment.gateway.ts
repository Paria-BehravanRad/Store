import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  PaymentGateway,
  PaymentTokenRequest,
  PaymentTokenResult,
  PaymentVerifyResult,
} from './payment.gateway';

@Injectable()
export class MockPaymentGateway implements PaymentGateway {
  async requestToken(input: PaymentTokenRequest): Promise<PaymentTokenResult> {
    const token = `mock-${randomUUID()}`;
    return {
      token,
      redirectUrl: `${input.redirectUrl}?Token=${encodeURIComponent(token)}&mock=1&ResNum=${encodeURIComponent(input.resNum)}`,
      raw: { mock: true },
    };
  }

  async verify(refNum: string): Promise<PaymentVerifyResult> {
    return {
      success: true,
      refNum,
      raw: { mock: true },
    };
  }

  async reverse(): Promise<void> {
    return;
  }
}
