import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { PAYMENT_GATEWAY } from './payment.gateway';
import { MockPaymentGateway } from './mock-payment.gateway';
import { SepPaymentGateway } from './sep-payment.gateway';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [AuthModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    MockPaymentGateway,
    SepPaymentGateway,
    {
      provide: PAYMENT_GATEWAY,
      inject: [ConfigService, MockPaymentGateway, SepPaymentGateway],
      useFactory: (
        config: ConfigService,
        mock: MockPaymentGateway,
        sep: SepPaymentGateway,
      ) => ((config.get('PAYMENT_GATEWAY') ?? 'mock') === 'sep' ? sep : mock),
    },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
