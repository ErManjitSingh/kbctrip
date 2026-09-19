import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Screen, Subtitle, Title } from '../../components/ui';
import { colors, spacing } from '../../lib/theme';

const copy: Record<string, { title: string; body: string }> = {
  flights: { title: 'Flights', body: 'Air inventory is next on the stack. Stays are live today.' },
  trains: { title: 'Trains', body: 'Rail search is coming. Hotels are ready to book now.' },
  buses: { title: 'Buses', body: 'Coach tickets land soon. Browse stays in the meantime.' },
  cabs: { title: 'Cabs', body: 'Airport and city cabs are on the roadmap.' },
  packages: { title: 'Packages', body: 'Bundled itineraries are next after hotels harden.' },
};

export default function ComingSoonScreen() {
  const router = useRouter();
  const { product } = useLocalSearchParams<{ product: string }>();
  const item = copy[product ?? ''] ?? {
    title: product ?? 'Coming soon',
    body: 'This vertical is not live yet on KBC Trip.',
  };

  return (
    <Screen>
      <Text style={styles.kicker}>Coming soon</Text>
      <Title>{item.title}</Title>
      <Subtitle>{item.body}</Subtitle>
      <View style={{ height: spacing.xl }} />
      <Button label="Browse stays" onPress={() => router.replace('/(tabs)/hotels')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    marginBottom: 8,
    color: colors.orange,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
