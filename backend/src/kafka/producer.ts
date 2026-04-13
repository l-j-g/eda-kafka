import { Producer, Message } from 'kafkajs';
import { kafka } from './client';

let producer: Producer | null = null;

export async function getProducer(): Promise<Producer> {
  if (!producer) {
    producer = kafka.producer();
    await producer.connect();
  }
  return producer;
}

export async function publishEvent(
  topic: string,
  key: string,
  value: object
): Promise<void> {
  const p = await getProducer();
  const message: Message = {
    key,
    value: JSON.stringify(value),
  };
  await p.send({ topic, messages: [message] });
  console.log(`[Producer] → ${topic}  key=${key}`);
}
