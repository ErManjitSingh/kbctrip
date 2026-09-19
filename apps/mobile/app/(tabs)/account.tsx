import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { updateGuestMe } from '../../lib/booking-api';
import { useGuestAuth } from '../../components/GuestAuthProvider';
import { BrandMark } from '../../components/BrandMark';
import { Button, Field, Loading, Screen, Subtitle, Title } from '../../components/ui';
import { colors, spacing } from '../../lib/theme';

export default function AccountScreen() {
  const router = useRouter();
  const { ready, guest, token, signOut } = useGuestAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (guest) {
      setName(guest.name);
      setPhone(guest.phone ?? '');
    }
  }, [guest]);

  if (!ready) return <Loading />;

  if (!token || !guest) {
    return (
      <Screen>
        <BrandMark />
        <View style={{ height: spacing.lg }} />
        <Title>Your trip account</Title>
        <Subtitle>One login for holds, tickets, and cancellations.</Subtitle>
        <View style={{ height: 20 }} />
        <Button label="Sign in" onPress={() => router.push('/login')} />
        <View style={{ height: 10 }} />
        <Button label="Create account" variant="secondary" onPress={() => router.push('/signup')} />
      </Screen>
    );
  }

  const save = async () => {
    setBusy(true);
    try {
      await updateGuestMe(token, { name: name.trim(), phone: phone.trim() || undefined });
      Alert.alert('Saved', 'Profile updated.');
    } catch (err) {
      Alert.alert('Could not save', err instanceof Error ? err.message : 'Try again');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll>
      <BrandMark />
      <View style={{ height: spacing.lg }} />
      <Title>{guest.name}</Title>
      <Subtitle>{guest.email}</Subtitle>
      <View style={{ height: spacing.lg }} />
      <Field label="Name" value={name} onChangeText={setName} autoCapitalize="words" />
      <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Button label={busy ? 'Saving…' : 'Save profile'} onPress={() => void save()} disabled={busy} />
      <View style={{ height: 10 }} />
      <Button label="My trips" variant="secondary" onPress={() => router.push('/(tabs)/trips')} />
      <View style={{ height: 10 }} />
      <Button
        label="Sign out"
        variant="ghost"
        onPress={() => {
          void signOut();
        }}
      />
      <Text style={styles.hint}>Marketplace guest account · hotel ops stay in admin.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { marginTop: spacing.xl, color: colors.muted, fontSize: 12, textAlign: 'center' },
});
