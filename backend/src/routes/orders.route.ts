import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { publishEvent } from '../kafka/producer';
import { Topics } from '../kafka/topics';
import { broadcast } from '../socket/gateway';

export const ordersRouter = Router();

interface OrderItem {
  name:  string;
  qty:   number;
  price: number;
}

interface CreateOrderBody {
  customerName: string;
  items:        OrderItem[];
}

ordersRouter.post('/', async (req: Request, res: Response) => {
  const { customerName, items } = req.body as CreateOrderBody;

  if (!customerName || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'customerName and items[] are required' });
  }

  const orderId = uuidv4();
  const event = {
    orderId,
    event:        'order.created',
    customerName,
    items,
    createdAt:    new Date().toISOString(),
  };

  await publishEvent(Topics.ORDERS, orderId, event);
  broadcast('order.created', event);

  return res.status(201).json({ orderId, message: 'Order accepted' });
});
