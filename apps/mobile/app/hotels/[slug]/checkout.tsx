import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createHold, formatPrice } from '../../../lib/booking-api';
import { parseStaySearch, formatStayDay } from '../../../lib/stay-search';
import { useGuestAuth } from '../../../components/GuestAuthProvider';
import { Button, Field, Screen, Subtitle, Title } from '../../../components/ui';
import { colors, spacing } from '../../../lib/theme';

export default function CheckoutScreen() {
  const router = useRouter();
  const { token, guest } = useGuestAuth();
  const params = useLocalSearchParams<{
    slug: string;
    roomTypeId: string;
    ratePlanId: string;
    checkIn?: string;
    checkOut?: string;
    adults?: string;
    children?: string;
    totalMinor?: string;
    roomName?: string;
  }>();
  const stay = parseStaySearch(params);
  const [firstName, setFirstName] = useState(guest?.name?.split(' ')[0] ?? '');
  const [lastName, setLastName] = useState(guest?.name?.split(' ').slice(1).join(' ') ?? '');
  const [email, setEmail] = useState(guest?.email ?? '');
  const [phone, setPhone] = useState(guest?.phone ?? '');
  const [busy, setBusy] = useState(false);

  const hold = async () => {
    if (!firstName.trim() || !email.trim()) {
      Alert.alert('Missing details', 'First name and email are required.');
      return;
    }
    setBusy(true);
    try {
      const result = await createHold(
        params.slug,
        {
          roomTypeId: params.roomTypeId,
          ratePlanId: params.ratePlanId,
          checkIn: stay.checkIn,
          checkOut: stay.checkOut,
          adults: stay.adults,
          children: stay.children,
          firstName: firstName.trim(),
          lastName: lastName.trim() || undefined,
          email: email.trim(),
          phone: phone.trim() || undefined,
        },
        token,
      );
      router.replace({
        pathname: '/pay',
        params: {
          slug: params.slug,
          bookingId: result.bookingId,
          reference: result.reference,
          totalMinor: String(result.totalMinor),
          holdExpiresAt: result.holdExpiresAt,
        },
      });
    } catch (err) {
      Alert.alert('Hold failed', err instanceof Error ? err.message : 'Try again');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll>
      <Title>Guest details</Title>
      <Subtitle>
        {params.roomName ?? 'Room'} · {formatStayDay(stay.checkIn)} → {formatStayDay(stay.checkOut)}
      </Subtitle>
      <Text style={styles.price}>
        {formatPrice(params.totalMinor ? Number(params.totalMinor) : null)}
      </Text>

      <Field label="First name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
      <Field label="Last name" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      <Button label={busy ? 'Holding room…' : 'Hold room · continue to pay'} onPress={() => void hold()} disabled={busy} />
      <Text style={styles.hint}>Ten-minute hold · no charge until you confirm on the next screen.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  price: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
  },
  hint: { marginTop: spacing.md, color: colors.muted, fontSize: 12, lineHeight: 18 },
});
