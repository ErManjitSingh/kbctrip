import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  cancelGuestBooking,
  formatPrice,
  getBooking,
  getGuestBooking,
  type BookingView,
} from '../lib/booking-api';
import { useGuestAuth } from '../components/GuestAuthProvider';
import { Button, Empty, Loading, Screen, Subtitle, Title } from '../components/ui';
import { colors, spacing } from '../lib/theme';

export default function ConfirmationScreen() {
  const router = useRouter();
  const { token } = useGuestAuth();
  const params = useLocalSearchParams<{ slug: string; bookingId: string }>();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingView | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const guestView = token ? await getGuestBooking(token, params.bookingId) : null;
    const publicView = await getBooking(params.slug, params.bookingId);
    setBooking(guestView ?? publicView);
    setLoading(false);
  }, [params.slug, params.bookingId, token]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <Loading label="Loading ticket…" />;
  if (!booking) return <Empty title="Booking not found" />;

  const cancel = () => {
    if (!token) {
      Alert.alert('Sign in required', 'Sign in to cancel from your account.');
      return;
    }
    Alert.alert('Cancel this trip?', booking.reference, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await cancelGuestBooking(token, booking.id);
              await load();
            } catch (err) {
              Alert.alert('Cancel failed', err instanceof Error ? err.message : 'Try again');
            }
          })();
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      <Text style={styles.badge}>{booking.status}</Text>
      <Title>You&apos;re booked</Title>
      <Subtitle>{booking.reference}</Subtitle>

      <View style={styles.panel}>
        <Text style={styles.label}>Stay</Text>
        <Text style={styles.value}>{booking.property?.name ?? 'Stay'}</Text>
        <Text style={styles.meta}>{booking.roomType}</Text>
      </View>
      <View style={styles.panel}>
        <Text style={styles.label}>Dates</Text>
        <Text style={styles.value}>
          {booking.checkIn} → {booking.checkOut}
        </Text>
        <Text style={styles.meta}>{booking.guestName}</Text>
      </View>
      <View style={styles.panel}>
        <Text style={styles.label}>Total</Text>
        <Text style={styles.value}>
          {formatPrice(booking.totalMinor, booking.property?.currency)}
        </Text>
      </View>

      <Button label="Browse more stays" onPress={() => router.replace('/(tabs)/hotels')} />
      <View style={{ height: 10 }} />
      <Button label="My trips" variant="secondary" onPress={() => router.replace('/(tabs)/trips')} />
      {booking.cancellable ? (
        <>
          <View style={{ height: 10 }} />
          <Button label="Cancel booking" variant="danger" onPress={cancel} />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#ecfdf3',
    color: colors.ok,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  panel: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    gap: 4,
  },
  label: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  value: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  meta: { color: colors.muted, fontSize: 12 },
});
