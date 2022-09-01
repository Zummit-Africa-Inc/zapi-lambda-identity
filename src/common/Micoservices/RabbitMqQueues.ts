import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { configConstant } from '../constants/config.constant';

/**
 * It creates a factory function that returns a RabbitMQ client proxy
 * @param {string} providerName - The name of the provider.
 * @param {string} queueName - The name of the queue you want to connect to.
 * @returns A provider object.
 */
export const queue = (providerName: string, queueName: string) => {
  return {
    provide: providerName,
    useFactory: (configService: ConfigService) => {
      return ClientProxyFactory.create({
        transport: Transport.RMQ,
        options: {
          urls: [configService.get(configConstant.amq.url)],
          queue: queueName,
          queueOptions: {
            durable: true,
          },
        },
      });
    },
    inject: [ConfigService],
  };
};
