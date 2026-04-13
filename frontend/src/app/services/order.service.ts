import { Injectable }  from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';
import { OrderItem }   from '../models/order.model';
import { environment } from '../../environments/environment';

export interface CreateOrderDto {
  customerName: string;
  items:        OrderItem[];
}

export interface CreateOrderResponse {
  orderId: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly url = `${environment.apiBaseUrl}/api/orders`;

  constructor(private http: HttpClient) {}

  createOrder(dto: CreateOrderDto): Observable<CreateOrderResponse> {
    return this.http.post<CreateOrderResponse>(this.url, dto);
  }
}
