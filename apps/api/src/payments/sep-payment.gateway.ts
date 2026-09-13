import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PaymentGateway,
  PaymentTokenRequest,
  PaymentTokenResult,
  PaymentVerifyResult,
} from './payment.gateway';

@Injectable()
export class SepPaymentGateway implements PaymentGateway {
  private readonly logger = new Logger(SepPaymentGateway.name);
  private readonly tokenUrl = 'https://sep.shaparak.ir/onlinepg/onlinepg';
  private readonly verifyUrl =
    'https://sep.shaparak.ir/verifyTxnRandomSessionkey/ipg/VerifyTransaction';
  private readonly reverseUrl =
    'https://sep.shaparak.ir/verifyTxnRandomSessionkey/ipg/ReverseTransaction';
  private readonly redirectBase = 'https://sep.shaparak.ir/OnlinePG/OnlinePG';

  constructor(private readonly config: ConfigService) {}

  async requestToken(input: PaymentTokenRequest): Promise<PaymentTokenResult> {
    const terminalId = this.config.get<string>('SEP_TERMINAL_ID');
    if (!terminalId) {
      throw new ServiceUnavailableException('SEP terminal is not configured');
    }

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        action: 'token',
        TerminalNumber: terminalId,
        Amount: input.amountRials,
        ResNum: input.resNum,
        RedirectUrl: input.redirectUrl,
        CellNumber: input.cellNumber,
      }),
    });

    if (!response.ok) {
      this.logger.error(`SEP token HTTP ${response.status}`);
      throw new ServiceUnavailableException('SEP token request failed');
    }

    const payload = (await response.json()) as {
      status?: number;
      token?: string;
      errorDesc?: string;
    };

    if (payload.status !== 1 || !payload.token) {
      this.logger.error(`SEP token error: ${JSON.stringify(payload)}`);
      throw new ServiceUnavailableException(payload.errorDesc ?? 'SEP token rejected');
    }

    return {
      token: payload.token,
      redirectUrl: this.redirectBase,
      raw: payload,
    };
  }

  async verify(refNum: string): Promise<PaymentVerifyResult> {
    const terminalId = this.config.get<string>('SEP_TERMINAL_ID');
    if (!terminalId) {
      throw new ServiceUnavailableException('SEP terminal is not configured');
    }

    const response = await fetch(this.verifyUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        RefNum: refNum,
        TerminalNumber: terminalId,
      }),
    });

    if (!response.ok) {
      throw new ServiceUnavailableException('SEP verify failed');
    }

    const payload = (await response.json()) as {
      ResultCode?: number;
      TransactionDetail?: { Amount?: number; RefNum?: string };
    };

    const success = payload.ResultCode === 0;
    return {
      success,
      refNum: payload.TransactionDetail?.RefNum ?? refNum,
      amountRials: payload.TransactionDetail?.Amount,
      raw: payload,
    };
  }

  async reverse(refNum: string): Promise<void> {
    const terminalId = this.config.get<string>('SEP_TERMINAL_ID');
    if (!terminalId) {
      return;
    }
    await fetch(this.reverseUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        RefNum: refNum,
        TerminalNumber: terminalId,
      }),
    });
  }
}
