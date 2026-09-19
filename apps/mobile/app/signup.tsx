import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { guestRegister } from '../lib/booking-api';
import { useGuestAuth } from '../components/GuestAuthProvider';
import { Button, Field, Screen, Subtitle, Title } from '../components/ui';
import { colors, spacing } from '../lib/theme';

export default function SignupScreen() {
  const router = useRouter();
  const { signIn } = useGuestAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim() || !email.trim() || password.length < 6) {
      Alert.alert('Check details', 'Name, email, and a 6+ character password are required.');
      return;
    }
    setBusy(true);
    try {
      const data = await guestRegister({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      await signIn(data.accessToken, data.guest);
      router.replace('/(tabs)/account');
    } catch (err) {
      Alert.alert('Could not join', err instanceof Error ? err.message : 'Try again');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll>
      <Title>Join KBC Trip</Title>
      <Subtitle>One account for stays across India.</Subtitle>
      <View style={{ height: spacing.lg }} />
      <Field label="Name" value={name} onChangeText={setName} autoCapitalize="words" />
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button label={busy ? 'Creating…' : 'Create account'} onPress={() => void submit()} disabled={busy} />
      <Text style={styles.foot}>
        Already have an account? <Link href="/login" style={styles.link}>Sign in</Link>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  foot: { marginTop: spacing.lg, color: colors.muted, fontSize: 13, textAlign: 'center' },
  link: { color: colors.orange, fontWeight: '700' },
});
