import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { guestLogin } from '../lib/booking-api';
import { useGuestAuth } from '../components/GuestAuthProvider';
import { Button, Field, Screen, Subtitle, Title } from '../components/ui';
import { colors, spacing } from '../lib/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useGuestAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const data = await guestLogin({ email: email.trim(), password });
      await signIn(data.accessToken, data.guest);
      router.replace('/(tabs)/account');
    } catch (err) {
      Alert.alert('Sign in failed', err instanceof Error ? err.message : 'Try again');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll>
      <Title>Welcome back</Title>
      <Subtitle>Sign in to manage holds and trips.</Subtitle>
      <View style={{ height: spacing.lg }} />
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button label={busy ? 'Signing in…' : 'Sign in'} onPress={() => void submit()} disabled={busy} />
      <Text style={styles.foot}>
        New here? <Link href="/signup" style={styles.link}>Join KBC Trip</Link>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  foot: { marginTop: spacing.lg, color: colors.muted, fontSize: 13, textAlign: 'center' },
  link: { color: colors.orange, fontWeight: '700' },
});
