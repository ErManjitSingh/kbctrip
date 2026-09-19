import { useCallback, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  formatPrice,
  getAvailability,
  getPropertyDetail,
  type AvailableRoom,
  type PropertyDetail,
} from '../../lib/booking-api';
import { parseStaySearch, stayNights, formatStayDay, guestLabel } from '../../lib/stay-search';
import { Button, Card, Empty, Loading, Screen, Subtitle, Title } from '../../components/ui';
import { colors, spacing } from '../../lib/theme';

export default function HotelDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    slug: string;
    checkIn?: string;
    checkOut?: string;
    adults?: string;
    children?: string;
  }>();
  const slug = params.slug;
  const stay = parseStaySearch(params);

  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [rooms, setRooms] = useState<AvailableRoom[]>([]);
  const [currency, setCurrency] = useState('INR');

  const load = useCallback(async () => {
    setLoading(true);
    const [detail, availability] = await Promise.all([
      getPropertyDetail(slug),
      getAvailability(slug, stay.checkIn, stay.checkOut, stay.adults, stay.children),
    ]);
    setProperty(detail);
    setRooms(availability?.rooms ?? []);
    setCurrency(availability?.property.currency ?? detail?.currency ?? 'INR');
    setLoading(false);
  }, [slug, stay.checkIn, stay.checkOut, stay.adults, stay.children]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <Loading label="Loading stay…" />;
  if (!property) return <Empty title="Stay not found" detail="This listing may be unavailable." />;

  const hero = property.photos[0];

  return (
    <Screen scroll>
      {hero ? <Image source={{ uri: hero }} style={styles.hero} /> : null}
      <Title>{property.name}</Title>
      <Subtitle>
        {[property.city, property.state, property.country].filter(Boolean).join(' · ')}
      </Subtitle>
      <Text style={styles.dates}>
        {formatStayDay(stay.checkIn)} → {formatStayDay(stay.checkOut)} · {stayNights(stay)} nights ·{' '}
        {guestLabel(stay)}
      </Text>
      {property.description ? <Text style={styles.body}>{property.description}</Text> : null}

      <Text style={styles.section}>Available rooms</Text>
      {rooms.length === 0 ? (
        <Empty title="No rooms for these dates" detail="Try different dates." />
      ) : (
        rooms.map((room) => {
          const plan = room.ratePlans[0];
          if (!plan) return null;
          return (
            <Card key={room.roomTypeId}>
              <View style={styles.room}>
                <Text style={styles.roomName}>{room.name}</Text>
                <Text style={styles.meta}>
                  Up to {room.maxOccupancy} · {plan.name}
                  {plan.refundable ? ' · Refundable' : ''}
                </Text>
                <Text style={styles.price}>{formatPrice(plan.totalMinor, currency)}</Text>
                <Button
                  label="Continue"
                  onPress={() =>
                    router.push({
                      pathname: '/hotels/[slug]/checkout',
                      params: {
                        slug,
                        roomTypeId: room.roomTypeId,
                        ratePlanId: plan.ratePlanId,
                        checkIn: stay.checkIn,
                        checkOut: stay.checkOut,
                        adults: String(stay.adults),
                        children: String(stay.children),
                        totalMinor: String(plan.totalMinor),
                        roomName: room.name,
                      },
                    })
                  }
                />
              </View>
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 220, borderRadius: 16, marginBottom: spacing.md, backgroundColor: colors.line },
  dates: { marginTop: 10, color: colors.muted, fontSize: 13, fontWeight: '600' },
  body: { marginTop: 14, color: colors.ink, fontSize: 14, lineHeight: 22 },
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  room: { padding: 14, gap: 8 },
  roomName: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  meta: { color: colors.muted, fontSize: 12 },
  price: { color: colors.ink, fontSize: 18, fontWeight: '800', marginVertical: 4 },
});
