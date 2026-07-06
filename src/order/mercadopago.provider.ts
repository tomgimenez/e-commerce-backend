import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import MercadoPagoConfig from 'mercadopago';

export const MercadoPagoProvider: Provider = {
  provide: 'MERCADOPAGO_CLIENT',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new MercadoPagoConfig({
      accessToken: configService.get<string>('MERCADOPAGO_ACCESS_TOKEN'),
    });
  },
};