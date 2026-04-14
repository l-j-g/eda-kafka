import { Injectable, OnDestroy } from '@angular/core';
import { Observable }            from 'rxjs';
import { io, Socket }            from 'socket.io-client';
import { KafkaEvent }            from '../models/order.model';
import { environment }           from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket;

  readonly events$: Observable<KafkaEvent>;

  constructor() {
    this.socket = io(environment.socketUrl || undefined, { transports: ['websocket'] });

    this.events$ = new Observable<KafkaEvent>(observer => {
      this.socket.on('kafka-event', (event: KafkaEvent) => observer.next(event));
      this.socket.on('connect_error', (err: Error)    => observer.error(err));
      return () => this.socket.off('kafka-event');
    });
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
  }
}
