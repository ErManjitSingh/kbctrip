import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { confirmBooking, formatPrice, getBooking, type BookingView } from '../lib/booking-api';
import { Button, Field, Loading, Screen, Subtitle, Title } from '../components/ui';
import { colors, spacing } from '../lib/theme';

export default function PayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    slug: string;
    bookingId: string;
    reference?: string;
    totalMinor?: string;
    holdExpiresAt?: string;
  }>();
  const [booking, setBooking] = useState<BookingView | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [card, setCard] = useState('4111 1111 1111 1111');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');

  useEffect(() => {
    void (async () => {
      const data = await getBooking(params.slug, params.bookingId);
      setBooking(data);
      setLoading(false);
    })();
  }, [params.slug, params.bookingId]);

  const pay = async () => {
    setBusy(true);
    try {
      // Mock capture — same as web pay page
      await confirmBooking(params.slug, params.bookingId);
      router.replace({
        pathname: '/confirmation',
        params: { slug: params.slug, bookingId: params.bookingId },
      });
    } catch (err) {
      Alert.alert('Payment failed', err instanceof Error ? err.message : 'Try again');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loading label="Loading folio…" />;

  return (
    <Screen scroll>
      <Title>Payment</Title>
      <Subtitle>
        {booking?.reference ?? params.reference} · hold expires{' '}
        {params.holdExpiresAt ? new Date(params.holdExpiresAt).toLocaleTimeString('en-IN') : 'soon'}
      </Subtitle>
      <Text style={styles.price}>
        {formatPrice(booking?.totalMinor ?? (params.totalMinor ? Number(params.totalMinor) : null))}
      </Text>

      <View style={styles.mock}>
        <Text style={styles.mockLabel}>Mock card · no live charge</Text>
        <Field label="Card number" value={card} onChangeText={setCard} keyboardType="number-pad" />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Expiry" value={expiry} onChangeText={setExpiry} />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Field label="CVV" value={cvv} onChangeText={setCvv} keyboardType="number-pad" secureTextEntry />
          </View>
        </View>
      </View>

      <Button label={busy ? 'Confirming…' : 'Pay & confirm'} onPress={() => void pay()} disabled={busy} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  price: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    color: colors.ink,
    fontSize: 28,
    fontWeight: '800',
  },
  mock: {
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    marginBottom: spacing.lg,
  },
  mockLabel: {
    marginBottom: 12,
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  row: { flexDirection: 'row' },
});
