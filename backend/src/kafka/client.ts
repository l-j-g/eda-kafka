import { Kafka, logLevel } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

const { KAFKA_BROKERS, KAFKA_API_KEY, KAFKA_API_SECRET } = process.env;

if (!KAFKA_BROKERS || !KAFKA_API_KEY || !KAFKA_API_SECRET) {
  throw new Error(
    'Missing Confluent Cloud env vars: KAFKA_BROKERS, KAFKA_API_KEY, KAFKA_API_SECRET'
  );
}

export const kafka = new Kafka({
  clientId: 'eda-demo',
  brokers: KAFKA_BROKERS.split(','),
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: KAFKA_API_KEY,
    password: KAFKA_API_SECRET,
  },
  logLevel: logLevel.WARN,
});
