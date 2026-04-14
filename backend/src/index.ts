import 'dotenv/config';
import fs from 'fs';
import http from 'http';
import path from 'path';
import express from 'express';
import cors from 'cors';
import { initSocketGateway } from './socket/gateway';
import { ordersRouter } from './routes/orders.route';
import { startInventoryConsumer } from './kafka/consumers/inventory.consumer';
import { startPaymentConsumer }   from './kafka/consumers/payment.consumer';
import { startShippingConsumer }  from './kafka/consumers/shipping.consumer';

const PORT = parseInt(process.env.PORT ?? '3000', 10);
const FRONTEND_DIST_PATH = path.resolve(__dirname, '../../frontend/dist/eda-kafka-frontend/browser');
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_ORIGIN,
  process.env.RENDER_EXTERNAL_URL,
  'http://localhost:4200',
].filter((origin): origin is string => Boolean(origin));

async function bootstrap() {
  const app = express();

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  }));
  app.use(express.json());
  app.get('/healthz', (_req, res) => res.status(200).json({ ok: true }));
  app.use('/api/orders', ordersRouter);

  if (fs.existsSync(FRONTEND_DIST_PATH)) {
    app.use(express.static(FRONTEND_DIST_PATH));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/') || req.path === '/socket.io') {
        next();
        return;
      }

      res.sendFile(path.join(FRONTEND_DIST_PATH, 'index.html'));
    });
  }

  const httpServer = http.createServer(app);
  initSocketGateway(httpServer, ALLOWED_ORIGINS);

  // Start all consumers concurrently; if one throws it rejects and crashes fast
  await Promise.all([
    startInventoryConsumer(),
    startPaymentConsumer(),
    startShippingConsumer(),
  ]);

  httpServer.listen(PORT, '0.0.0.0', () =>
    console.log(`[Server] listening on 0.0.0.0:${PORT}`)
  );
}

bootstrap().catch(err => {
  console.error('[Fatal]', err);
  process.exit(1);
});
