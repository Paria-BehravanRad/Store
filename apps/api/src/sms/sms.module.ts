import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SMS_PROVIDER } from './sms.provider';
import { MockSmsProvider } from './mock-sms.provider';
import { MelliPayamakSmsProvider } from './melli-payamak.provider';

@Module({
  providers: [
    MockSmsProvider,
    MelliPayamakSmsProvider,
    {
      provide: SMS_PROVIDER,
      inject: [ConfigService, MockSmsProvider, MelliPayamakSmsProvider],
      useFactory: (
        config: ConfigService,
        mock: MockSmsProvider,
        melli: MelliPayamakSmsProvider,
      ) => {
        const provider = config.get<string>('SMS_PROVIDER') ?? 'mock';
        return provider === 'melli' ? melli : mock;
      },
    },
  ],
  exports: [SMS_PROVIDER],
})
export class SmsModule {}
