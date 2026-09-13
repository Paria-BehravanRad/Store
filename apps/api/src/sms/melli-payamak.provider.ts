import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsProvider } from './sms.provider';

@Injectable()
export class MelliPayamakSmsProvider implements SmsProvider {
  private readonly logger = new Logger(MelliPayamakSmsProvider.name);
  private readonly endpoint = 'https://rest.payamak-panel.com/api/SendSMS/SendOtp';

  constructor(private readonly config: ConfigService) {}

  async sendOtp(phone: string, code: string): Promise<void> {
    const username = this.config.get<string>('MELLI_PAYAMAK_USERNAME');
    const password = this.config.get<string>('MELLI_PAYAMAK_PASSWORD');
    const from = this.config.get<string>('MELLI_PAYAMAK_FROM');

    if (!username || !password || !from) {
      throw new ServiceUnavailableException('Melli Payamak credentials are not configured');
    }

    const body = new URLSearchParams({
      username,
      password,
      to: phone,
      from,
      code,
    });

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      this.logger.error(`Melli Payamak HTTP ${response.status}`);
      throw new ServiceUnavailableException('Failed to send OTP SMS');
    }

    const payload = (await response.json().catch(() => null)) as { Value?: string } | null;
    const value = payload?.Value ? Number(payload.Value) : NaN;
    if (!Number.isFinite(value) || value < 0) {
      this.logger.error(`Melli Payamak rejected send: ${JSON.stringify(payload)}`);
      throw new ServiceUnavailableException('Failed to send OTP SMS');
    }
  }
}
