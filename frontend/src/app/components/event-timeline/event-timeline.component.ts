import { Component, Input } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { OrderJourney }     from '../../models/order.model';

const STAGE_META: Record<string, { label: string; icon: string; color: string }> = {
  'order.created':      { label: 'Order Created',      icon: '📦', color: '#a78bfa' },
  'inventory.reserved': { label: 'Inventory Reserved', icon: '🏭', color: '#34d399' },
  'payment.processed':  { label: 'Payment Processed',  icon: '💳', color: '#60a5fa' },
  'shipment.created':   { label: 'Shipment Created',   icon: '🚚', color: '#fb923c' },
};

const STAGE_ORDER = [
  'order.created',
  'inventory.reserved',
  'payment.processed',
  'shipment.created',
];

@Component({
  selector:    'app-event-timeline',
  standalone:  true,
  imports:     [CommonModule],
  templateUrl: './event-timeline.component.html',
  styleUrl:    './event-timeline.component.scss',
})
export class EventTimelineComponent {
  @Input() journeys: Map<string, OrderJourney> = new Map();

  get journeyList(): OrderJourney[] {
    return Array.from(this.journeys.values()).reverse();
  }

  stagesFor(journey: OrderJourney) {
    return STAGE_ORDER.map(stage => {
      const hit = journey.events.find(e => e.eventType === stage);
      return {
        stage,
        meta:      STAGE_META[stage],
        completed: !!hit,
        timestamp: hit?.timestamp ?? null,
      };
    });
  }

  shortId(id: string): string {
    return id.slice(0, 8).toUpperCase();
  }
}
