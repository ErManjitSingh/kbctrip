import { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { listProperties, formatPrice, type MarketplaceProperty } from '../../lib/booking-api';
import { parseStaySearch } from '../../lib/stay-search';
import { Card, Empty, Loading, Screen, Subtitle, Title } from '../../components/ui';
import { colors, spacing } from '../../lib/theme';

export default function HotelsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    city?: string;
    checkIn?: string;
    checkOut?: string;
    adults?: string;
    children?: string;
  }>();
  const stay = parseStaySearch(params);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<MarketplaceProperty[]>([]);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const catalog = await listProperties(stay.city, 1);
    setRows(catalog?.properties ?? []);
    setTotal(catalog?.total ?? 0);
    setLoading(false);
  }, [stay.city]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Screen style={{ paddingHorizontal: 0, flex: 1 }}>
      <View style={styles.head}>
        <Title>Stays</Title>
        <Subtitle>
          {stay.city ? `${stay.city} · ` : ''}
          {stay.checkIn} → {stay.checkOut} · {total} places
        </Subtitle>
      </View>

      {loading ? (
        <Loading label="Loading stays…" />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Empty title="No stays found" detail="Try another city." />}
          renderItem={({ item }) => {
            const photo = item.photos[0];
            return (
              <Card
                onPress={() =>
                  router.push({
                    pathname: '/hotels/[slug]',
                    params: {
                      slug: item.slug,
                      checkIn: stay.checkIn,
                      checkOut: stay.checkOut,
                      adults: String(stay.adults),
                      children: String(stay.children),
                    },
                  })
                }
              >
                {photo ? <Image source={{ uri: photo }} style={styles.photo} /> : <View style={styles.photo} />}
                <View style={styles.body}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>
                    {[item.city, item.state].filter(Boolean).join(' · ') || item.country}
                  </Text>
                  <Text style={styles.price}>{formatPrice(item.startingPriceMinor, item.currency)}</Text>
                </View>
              </Card>
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  photo: { width: '100%', height: 160, backgroundColor: colors.line },
  body: { padding: 14, gap: 4 },
  name: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  meta: { color: colors.muted, fontSize: 12 },
  price: { marginTop: 6, color: colors.ink, fontSize: 15, fontWeight: '800' },
});
