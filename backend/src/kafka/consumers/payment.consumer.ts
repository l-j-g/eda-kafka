import { kafka } from '../client';
import { publishEvent } from '../producer';
import { Topics } from '../topics';
import { broadcast } from '../../socket/gateway';

const GROUP_ID = `${process.env.KAFKA_GROUP_ID_PREFIX ?? 'eda-demo'}-payment`;

interface InventoryReservedPayload {
  orderId: string;
  items: Array<{ name: string; qty: number; price: number }>;
}

export async function startPaymentConsumer(): Promise<void> {
  const consumer = kafka.consumer({ groupId: GROUP_ID });
  await consumer.connect();
  await consumer.subscribe({ topic: Topics.INVENTORY, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const inv = JSON.parse(message.value!.toString()) as InventoryReservedPayload;
      console.log(`[Payment] processing order ${inv.orderId}`);

      await new Promise(r => setTimeout(r, 800));

      const event = {
        orderId:     inv.orderId,
        event:       'payment.processed',
        amount:      inv.items.reduce((s, i) => s + i.price * i.qty, 0),
        processedAt: new Date().toISOString(),
      };

      await publishEvent(Topics.PAYMENTS, inv.orderId, event);
      broadcast('payment.processed', event);
    },
  });

  console.log('[Payment] consumer running');
}
