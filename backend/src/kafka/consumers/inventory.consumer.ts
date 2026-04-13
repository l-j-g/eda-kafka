import { kafka } from '../client';
import { publishEvent } from '../producer';
import { Topics } from '../topics';
import { broadcast } from '../../socket/gateway';

const GROUP_ID = `${process.env.KAFKA_GROUP_ID_PREFIX ?? 'eda-demo'}-inventory`;

interface OrderCreatedPayload {
  orderId: string;
  items: Array<{ name: string; qty: number; price: number }>;
}

export async function startInventoryConsumer(): Promise<void> {
  const consumer = kafka.consumer({ groupId: GROUP_ID });
  await consumer.connect();
  await consumer.subscribe({ topic: Topics.ORDERS, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const order = JSON.parse(message.value!.toString()) as OrderCreatedPayload;
      console.log(`[Inventory] received order ${order.orderId}`);

      const event = {
        orderId:    order.orderId,
        event:      'inventory.reserved',
        items:      order.items,
        reservedAt: new Date().toISOString(),
      };

      await publishEvent(Topics.INVENTORY, order.orderId, event);
      broadcast('inventory.reserved', event);
    },
  });

  console.log('[Inventory] consumer running');
}
