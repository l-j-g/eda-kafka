import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { initSocketGateway } from './socket/gateway';
import { ordersRouter } from './routes/orders.route';
import { startInventoryConsumer } from './kafka/consumers/inventory.consumer';
import { startPaymentConsumer }   from './kafka/consumers/payment.consumer';
import { startShippingConsumer }  from './kafka/consumers/shipping.consumer';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

async function bootstrap() {
  const app = express();

  app.use(cors({ origin: 'http://localhost:4200' }));
  app.use(express.json());
  app.use('/api/orders', ordersRouter);

  const httpServer = http.createServer(app);
  initSocketGateway(httpServer);

  // Start all consumers concurrently; if one throws it rejects and crashes fast
  await Promise.all([
    startInventoryConsumer(),
    startPaymentConsumer(),
    startShippingConsumer(),
  ]);

  httpServer.listen(PORT, () =>
    console.log(`[Server] listening on http://localhost:${PORT}`)
  );
}

bootstrap().catch(err => {
  console.error('[Fatal]', err);
  process.exit(1);
});
