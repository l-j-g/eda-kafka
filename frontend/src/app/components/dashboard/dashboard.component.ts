import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule }                  from '@angular/common';
import { Subject }                       from 'rxjs';
import { takeUntil }                     from 'rxjs/operators';

import { SocketService }            from '../../services/socket.service';
import { OrderJourney, KafkaEvent } from '../../models/order.model';
import { OrderFormComponent }       from '../order-form/order-form.component';
import { EventTimelineComponent }   from '../event-timeline/event-timeline.component';

@Component({
  selector:    'app-dashboard',
  standalone:  true,
  imports:     [CommonModule, OrderFormComponent, EventTimelineComponent],
  templateUrl: './dashboard.component.html',
  styleUrl:    './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  journeys     = new Map<string, OrderJourney>();
  recentEvents: KafkaEvent[] = [];

  private destroy$ = new Subject<void>();

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    this.socketService.events$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => this.handleEvent(event));
  }

  private handleEvent(event: KafkaEvent): void {
    const payload  = event.payload as { orderId?: string };
    const orderId  = payload.orderId;
    if (!orderId) return;

    const existing = this.journeys.get(orderId) ?? {
      orderId,
      events:      [] as KafkaEvent[],
      latestStage: 'order.created' as const,
    };

    existing.events      = [...existing.events, event];
    existing.latestStage = event.eventType as OrderJourney['latestStage'];

    this.journeys     = new Map(this.journeys.set(orderId, existing));
    this.recentEvents = [event, ...this.recentEvents].slice(0, 50);
  }

  onOrderPlaced(orderId: string): void {
    console.log('Order placed:', orderId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
