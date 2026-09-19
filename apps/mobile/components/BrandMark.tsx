import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors } from '../lib/theme';

export function BrandMark({ size = 28, wordmark = true }: { size?: number; wordmark?: boolean }) {
  return (
    <View style={styles.row}>
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Rect width="32" height="32" rx="8" fill={colors.orange} />
        <Path
          fill="#fff"
          d="M9 6.8h3.7v6.85L19.7 6.8H24l-7.45 8L24.15 24.2H19.85l-7.15-8.25V24.2H9V6.8Z"
        />
        <Path d="M9 26.35h14" stroke="rgba(255,255,255,.55)" strokeWidth="1.7" strokeLinecap="round" />
      </Svg>
      {wordmark ? (
        <Text style={styles.word}>
          KBC<Text style={styles.trip}> Trip</Text>
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  word: { color: colors.ink, fontSize: 18, fontWeight: '800', letterSpacing: -0.6 },
  trip: { color: colors.orange, fontWeight: '600' },
});
