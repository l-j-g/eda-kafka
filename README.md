# EDA Kafka Demo — Order Processing Pipeline

An event-driven architecture demo using **Confluent Cloud Kafka**, **Node.js/Express**, **Socket.IO**, and **Angular 17**.

## Architecture

```
Angular UI
   │
   │  POST /api/orders
   ▼
Express API ──► Kafka topic: orders
                     │
                     ▼
            inventory.consumer ──► Kafka topic: inventory
                                        │
                                        ▼
                               payment.consumer ──► Kafka topic: payments
                                                        │
                                                        ▼
                                              shipping.consumer ──► Kafka topic: shipments

All consumers ──► Socket.IO broadcast ──► Angular real-time timeline
```

Each Kafka consumer simulates a separate microservice:

| Consumer  | Listens on | Publishes to | Delay  |
|-----------|-----------|--------------|--------|
| Inventory | `orders`  | `inventory`  | none   |
| Payment   | `inventory` | `payments` | 800 ms |
| Shipping  | `payments` | `shipments` | 600 ms |

## Prerequisites

- Node.js 18+
- Angular CLI 17+ (`npm install -g @angular/cli`)
- A **Confluent Cloud** account with:
  - A cluster created (Basic or Standard tier)
  - An API key/secret pair (**Data access** scope)
  - Four topics created: `orders`, `inventory`, `payments`, `shipments`

## Confluent Cloud Setup

1. Log in to [confluent.cloud](https://confluent.cloud)
2. Create a cluster → note the **Bootstrap server** (e.g. `pkc-xxxxx.us-east-1.aws.confluent.cloud:9092`)
3. Go to **API Keys** → Create a new key with *Global access* (or Data access scoped to the four topics)
4. Create four topics with 1 partition each: `orders`, `inventory`, `payments`, `shipments`

## Running Locally

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — fill in KAFKA_BROKERS, KAFKA_API_KEY, KAFKA_API_SECRET
npm install
npm run dev
```

The server starts on `http://localhost:3000` and all three Kafka consumers connect before accepting requests.

### 2. Frontend

```bash
cd frontend
npm install
ng serve
```

Open `http://localhost:4200`.

## Using the Demo

1. Enter a customer name in the **Place New Order** form and click **Place Order**
2. Watch the **Order Journeys** panel — each stage lights up as its Kafka consumer fires:
   - 📦 Order Created (immediate)
   - 🏭 Inventory Reserved (immediate)
   - 💳 Payment Processed (~800 ms later)
   - 🚚 Shipment Created (~1.4 s later)
3. The **Raw Kafka Events** panel shows every event as it arrives via Socket.IO

## Project Structure

```
eda-kafka/
├── backend/
│   ├── src/
│   │   ├── index.ts                         # Express + Socket.IO entry point
│   │   ├── kafka/
│   │   │   ├── client.ts                    # Confluent Cloud KafkaJS client
│   │   │   ├── producer.ts                  # Singleton producer wrapper
│   │   │   ├── topics.ts                    # Topic name constants
│   │   │   └── consumers/
│   │   │       ├── inventory.consumer.ts
│   │   │       ├── payment.consumer.ts
│   │   │       └── shipping.consumer.ts
│   │   ├── routes/orders.route.ts           # POST /api/orders
│   │   └── socket/gateway.ts               # Socket.IO broadcast bridge
│   ├── .env.example
│   └── package.json
└── frontend/
    └── src/app/
        ├── components/
        │   ├── dashboard/                   # App shell, owns event state
        │   ├── order-form/                  # Order submission form
        │   └── event-timeline/              # Per-order stage tracker
        └── services/
            ├── socket.service.ts            # Socket.IO → RxJS Observable
            └── order.service.ts             # HTTP order creation
```

## Environment Variables

| Variable               | Description                                             |
|------------------------|---------------------------------------------------------|
| `PORT`                 | Backend HTTP port (default `3000`)                      |
| `KAFKA_BROKERS`        | Confluent Cloud bootstrap server(s), comma-separated    |
| `KAFKA_API_KEY`        | Confluent Cloud API key                                 |
| `KAFKA_API_SECRET`     | Confluent Cloud API secret                              |
| `KAFKA_GROUP_ID_PREFIX`| Consumer group prefix (default `eda-demo`)              |

## Key Technical Points

- **SASL_SSL/PLAIN**: Confluent Cloud requires `ssl: true` + `sasl.mechanism: 'plain'` in KafkaJS — not SCRAM or GSSAPI.
- **fromBeginning: false**: Consumers skip old messages on restart so the UI isn't flooded with historical events.
- **Startup guard**: All three consumers must connect before `httpServer.listen()` — `Promise.all([...consumers])` enforces this.
- **Map replacement**: The dashboard replaces its `journeys` Map reference on every event so Angular's change detection picks up the mutation.
