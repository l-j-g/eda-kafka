export interface OrderItem {
  name:  string;
  qty:   number;
  price: number;
}

export interface KafkaEvent {
  eventType: string;
  timestamp: string;
  payload:   OrderCreatedPayload
           | InventoryReservedPayload
           | PaymentProcessedPayload
           | ShipmentCreatedPayload
           | Record<string, unknown>;
}

export interface OrderCreatedPayload {
  orderId:      string;
  event:        'order.created';
  customerName: string;
  items:        OrderItem[];
  createdAt:    string;
}

export interface InventoryReservedPayload {
  orderId:    string;
  event:      'inventory.reserved';
  items:      OrderItem[];
  reservedAt: string;
}

export interface PaymentProcessedPayload {
  orderId:     string;
  event:       'payment.processed';
  amount:      number;
  processedAt: string;
}

export interface ShipmentCreatedPayload {
  orderId:      string;
  event:        'shipment.created';
  trackingId:   string;
  dispatchedAt: string;
}

export interface OrderJourney {
  orderId:     string;
  events:      KafkaEvent[];
  latestStage: 'order.created'
             | 'inventory.reserved'
             | 'payment.processed'
             | 'shipment.created';
}
