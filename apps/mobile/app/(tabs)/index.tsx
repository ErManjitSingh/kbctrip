import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, Bus, Car, Plane, Package, Train } from 'lucide-react-native';
import { BrandMark } from '../../components/BrandMark';
import { Button, Screen, Subtitle, Title } from '../../components/ui';
import { colors, spacing } from '../../lib/theme';
import { defaultStay } from '../../lib/stay-search';
import { useState } from 'react';

const destinations = ['Goa', 'Manali', 'Kashmir', 'Dubai', 'Jaipur'] as const;
const services = [
  { label: 'Hotels', href: '/(tabs)/hotels', icon: Building2, live: true },
  { label: 'Flights', href: '/coming-soon/flights', icon: Plane, live: false },
  { label: 'Trains', href: '/coming-soon/trains', icon: Train, live: false },
  { label: 'Buses', href: '/coming-soon/buses', icon: Bus, live: false },
  { label: 'Cabs', href: '/coming-soon/cabs', icon: Car, live: false },
  { label: 'Packages', href: '/coming-soon/packages', icon: Package, live: false },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const stay = defaultStay();

  const searchHotels = (nextCity?: string) => {
    const q = new URLSearchParams({
      checkIn: stay.checkIn,
      checkOut: stay.checkOut,
      adults: String(stay.adults),
      children: String(stay.children),
    });
    const value = (nextCity ?? city).trim();
    if (value) q.set('city', value);
    router.push(`/(tabs)/hotels?${q.toString()}`);
  };

  return (
    <Screen scroll>
      <View style={styles.top}>
        <BrandMark />
        <Text style={styles.kicker}>India first · stays live</Text>
      </View>

      <Title>Book everything. Travel everywhere.</Title>
      <Subtitle>Private stays, considered itineraries, one account.</Subtitle>

      <View style={styles.search}>
        <Text style={styles.searchLabel}>Where are you going?</Text>
        <TextInput
          value={city}
          onChangeText={setCity}
          placeholder="City, hotel or area"
          placeholderTextColor="#9a94a0"
          style={styles.searchInput}
          returnKeyType="search"
          onSubmitEditing={() => searchHotels()}
        />
        <Button label="Search stays" onPress={() => searchHotels()} />
      </View>

      <Text style={styles.section}>Where to next</Text>
      <View style={styles.chips}>
        {destinations.map((place) => (
          <Pressable key={place} style={styles.chip} onPress={() => searchHotels(place)}>
            <Text style={styles.chipText}>{place}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.section}>The house, in full</Text>
      <View style={styles.services}>
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Pressable
              key={service.label}
              style={styles.service}
              onPress={() => router.push(service.href as never)}
            >
              <Icon color={colors.orange} size={18} />
              <Text style={styles.serviceText}>{service.label}</Text>
              {!service.live ? <Text style={styles.soon}>Soon</Text> : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.closing}>
        <Text style={styles.closingEye}>From a recent stay</Text>
        <Text style={styles.closingQuote}>
          Hotels, cabs and the itinerary sat in one place. We stopped juggling tabs and just went.
        </Text>
        <Text style={styles.closingAttrib}>Riya Sharma · Mumbai · Goa weekend</Text>
        <Button label="Browse stays" onPress={() => searchHotels()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { marginBottom: spacing.lg, gap: 8 },
  kicker: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  search: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    gap: 12,
  },
  searchLabel: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  searchInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
    fontSize: 15,
  },
  section: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.lg },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.ink,
  },
  chipText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  services: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.xl },
  service: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  serviceText: { color: colors.ink, fontSize: 13, fontWeight: '700', flex: 1 },
  soon: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  closing: {
    padding: spacing.lg,
    borderRadius: 18,
    backgroundColor: colors.ink,
    gap: 12,
  },
  closingEye: {
    color: 'rgba(255,255,255,.55)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  closingQuote: { color: colors.white, fontSize: 20, fontWeight: '700', lineHeight: 28, letterSpacing: -0.4 },
  closingAttrib: { color: 'rgba(255,255,255,.55)', fontSize: 12, marginBottom: 4 },
});
