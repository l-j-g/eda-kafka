import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule }                    from '@angular/common';
import { FormsModule }                     from '@angular/forms';
import { OrderService, CreateOrderDto }    from '../../services/order.service';
import { OrderItem }                       from '../../models/order.model';

@Component({
  selector:    'app-order-form',
  standalone:  true,
  imports:     [CommonModule, FormsModule],
  templateUrl: './order-form.component.html',
  styleUrl:    './order-form.component.scss',
})
export class OrderFormComponent {
  @Output() orderPlaced = new EventEmitter<string>();

  customerName = '';
  submitting   = false;
  error        = '';

  items: OrderItem[] = [
    { name: 'Wireless Keyboard', qty: 1, price: 79.99 },
    { name: 'USB-C Hub',         qty: 2, price: 34.99 },
  ];

  constructor(private orderService: OrderService) {}

  get total(): number {
    return this.items.reduce((s, i) => s + i.price * i.qty, 0);
  }

  submit(): void {
    if (!this.customerName.trim()) {
      this.error = 'Please enter a customer name.';
      return;
    }
    this.error      = '';
    this.submitting = true;

    const dto: CreateOrderDto = {
      customerName: this.customerName.trim(),
      items:        this.items,
    };

    this.orderService.createOrder(dto).subscribe({
      next: res => {
        this.submitting   = false;
        this.customerName = '';
        this.orderPlaced.emit(res.orderId);
      },
      error: err => {
        this.submitting = false;
        this.error      = (err as Error).message ?? 'Failed to place order.';
      },
    });
  }
}
