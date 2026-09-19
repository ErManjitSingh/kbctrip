'use client';

import { Drawer } from './ui/Drawer';
import { Badge, statusTone } from './ui/Badge';
import { Button } from './ui/Button';
import { formatDate, formatDateTime, formatInr } from '@/lib/format';
import { tripWebUrl } from '@/lib/api';
import type { BookingRow } from '@/lib/types';

export function BookingDrawer({
  booking,
  onClose,
  onCancel,
  onConfirmHold,
}: {
  booking: BookingRow | null;
  onClose: () => void;
  onCancel: (id: string) => void;
  onConfirmHold: (id: string) => void;
}) {
  return (
    <Drawer
      open={Boolean(booking)}
      title={booking?.ref ?? 'Booking'}
      subtitle={booking ? `${booking.guest} · ${booking.hotel}` : undefined}
      onClose={onClose}
      wide
    >
      {booking ? (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            <Badge tone={statusTone(booking.status)}>{booking.status}</Badge>
            <Badge tone="orange">{booking.source}</Badge>
            <Badge tone="muted">{booking.payment}</Badge>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <span>Guest</span>
              <strong>{booking.guest}</strong>
              <div className="muted">{booking.email}</div>
              <div className="muted">{booking.phone}</div>
            </div>
            <div className="detail-item">
              <span>Stay</span>
              <strong>{booking.hotel}</strong>
              <div className="muted">{booking.city}</div>
            </div>
            <div className="detail-item">
              <span>Dates</span>
              <strong>
                {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
              </strong>
              <div className="muted">
                {booking.nights} night{booking.nights === 1 ? '' : 's'} · {booking.guests} guests · {booking.rooms} room
                {booking.rooms === 1 ? '' : 's'}
              </div>
            </div>
            <div className="detail-item">
              <span>Amount</span>
              <strong>{formatInr(booking.amount)}</strong>
              <div className="muted">Tax {formatInr(booking.tax)}</div>
            </div>
          </div>

          {booking.notes ? (
            <div className="detail-item" style={{ marginBottom: 18 }}>
              <span>Notes</span>
              <strong style={{ fontWeight: 550 }}>{booking.notes}</strong>
            </div>
          ) : null}

          <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 750 }}>Timeline</h3>
          <div className="timeline">
            {booking.timeline.map((event) => (
              <div className="timeline-item" key={`${event.at}-${event.label}`}>
                <strong>{event.label}</strong>
                <span>
                  {formatDateTime(event.at)}
                  {event.detail ? ` · ${event.detail}` : ''}
                </span>
              </div>
            ))}
          </div>

          <div className="page-actions" style={{ marginTop: 24 }}>
            <a className="btn btn-secondary" href={`${tripWebUrl()}/hotels/${booking.hotelSlug}`} target="_blank" rel="noreferrer">
              Open on Trip
            </a>
            {booking.status === 'held' ? (
              <Button variant="primary" onClick={() => onConfirmHold(booking.id)}>
                Mark confirmed
              </Button>
            ) : null}
            {booking.status === 'confirmed' || booking.status === 'held' ? (
              <Button variant="danger" onClick={() => onCancel(booking.id)}>
                Cancel booking
              </Button>
            ) : null}
          </div>
        </>
      ) : null}
    </Drawer>
  );
}
