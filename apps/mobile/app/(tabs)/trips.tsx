import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  cancelGuestBooking,
  formatPrice,
  getGuestBookings,
  type GuestBookingSummary,
} from '../../lib/booking-api';
import { useGuestAuth } from '../../components/GuestAuthProvider';
import { Button, Card, Empty, Loading, Screen, Subtitle, Title } from '../../components/ui';
import { colors, spacing } from '../../lib/theme';

export default function TripsScreen() {
  const router = useRouter();
  const { ready, token } = useGuestAuth();
  const [loading, setLoading] = useState(true);
  const [upcoming, setUpcoming] = useState<GuestBookingSummary[]>([]);
  const [past, setPast] = useState<GuestBookingSummary[]>([]);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await getGuestBookings(token);
    setUpcoming(data?.upcoming ?? []);
    setPast(data?.past ?? []);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (ready) void load();
  }, [ready, load]);

  if (!ready || loading) return <Loading label="Loading trips…" />;

  if (!token) {
    return (
      <Screen>
        <Title>My trips</Title>
        <Subtitle>Sign in to see holds and confirmed stays.</Subtitle>
        <View style={{ height: 16 }} />
        <Button label="Sign in" onPress={() => router.push('/login')} />
        <View style={{ height: 10 }} />
        <Button label="Join KBC Trip" variant="secondary" onPress={() => router.push('/signup')} />
      </Screen>
    );
  }

  const cancel = (row: GuestBookingSummary) => {
    Alert.alert('Cancel booking?', `${row.reference} · ${row.property.name}`, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel trip',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await cancelGuestBooking(token, row.id, 'Cancelled from mobile');
              await load();
            } catch (err) {
              Alert.alert('Could not cancel', err instanceof Error ? err.message : 'Try again');
            }
          })();
        },
      },
    ]);
  };

  const renderRow = (row: GuestBookingSummary) => (
    <Card
      key={row.id}
      onPress={() =>
        router.push({
          pathname: '/confirmation',
          params: { slug: row.property.slug, bookingId: row.id },
        })
      }
    >
      <View style={styles.row}>
        <Text style={styles.ref}>{row.reference}</Text>
        <Text style={styles.status}>{row.status}</Text>
      </View>
      <Text style={styles.name}>{row.property.name}</Text>
      <Text style={styles.meta}>
        {row.checkIn} → {row.checkOut} · {row.roomType}
      </Text>
      <Text style={styles.price}>{formatPrice(row.totalMinor, row.property.currency)}</Text>
      {row.cancellable ? (
        <View style={{ marginTop: 12 }}>
          <Button label="Cancel" variant="danger" onPress={() => cancel(row)} />
        </View>
      ) : null}
    </Card>
  );

  return (
    <Screen scroll>
      <Title>My trips</Title>
      <Subtitle>Upcoming and past marketplace stays.</Subtitle>

      <Text style={styles.section}>Upcoming</Text>
      {upcoming.length === 0 ? <Empty title="No upcoming trips" /> : upcoming.map(renderRow)}

      <Text style={styles.section}>Past</Text>
      {past.length === 0 ? <Empty title="No past trips" /> : past.map(renderRow)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  ref: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  status: { color: colors.orange, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  name: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  meta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  price: { marginTop: 8, color: colors.ink, fontSize: 15, fontWeight: '800' },
});
