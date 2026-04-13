import { kafka } from '../client';
import { publishEvent } from '../producer';
import { Topics } from '../topics';
import { broadcast } from '../../socket/gateway';

const GROUP_ID = `${process.env.KAFKA_GROUP_ID_PREFIX ?? 'eda-demo'}-shipping`;

interface PaymentProcessedPayload {
  orderId: string;
}

export async function startShippingConsumer(): Promise<void> {
  const consumer = kafka.consumer({ groupId: GROUP_ID });
  await consumer.connect();
  await consumer.subscribe({ topic: Topics.PAYMENTS, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const payment = JSON.parse(message.value!.toString()) as PaymentProcessedPayload;
      console.log(`[Shipping] dispatching order ${payment.orderId}`);

      await new Promise(r => setTimeout(r, 600));

      const event = {
        orderId:      payment.orderId,
        event:        'shipment.created',
        trackingId:   `TRK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        dispatchedAt: new Date().toISOString(),
      };

      await publishEvent(Topics.SHIPMENTS, payment.orderId, event);
      broadcast('shipment.created', event);
    },
  });

  console.log('[Shipping] consumer running');
}
