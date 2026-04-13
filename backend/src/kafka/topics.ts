export const Topics = {
  ORDERS:    'orders',
  INVENTORY: 'inventory',
  PAYMENTS:  'payments',
  SHIPMENTS: 'shipments',
} as const;

export type TopicName = typeof Topics[keyof typeof Topics];
