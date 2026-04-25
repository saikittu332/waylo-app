import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import { colors, radii, shadows, spacing, typography } from "../constants/theme";
import { setMockPremium } from "../services/subscriptionService";

export default function PaywallScreen({ navigation }) {
  const [upgraded, setUpgraded] = useState(false);

  function upgrade() {
    setMockPremium(true);
    setUpgraded(true);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.heading}>Upgrade to Waylo Premium</Text>
        <View style={styles.planRow}>
          <PlanCard title="Free" price="$0" items={["Basic route", "1 fuel suggestion"]} />
          <PlanCard
            title="Premium"
            price="$5.99/month"
            featured
            items={["Full AI fuel optimization", "Multiple smart stops", "Cost savings insights", "Scenic recommendations"]}
          />
        </View>
        <PrimaryButton title={upgraded ? "Premium Enabled" : "Upgrade to Premium"} onPress={upgrade} />
        <PrimaryButton title="Back to Trip" variant="secondary" onPress={() => navigation.goBack()} />
      </View>
    </SafeAreaView>
  );
}

function PlanCard({ title, price, items, featured }) {
  return (
    <View style={[styles.card, featured && styles.featured]}>
      <Text style={[styles.planTitle, featured && styles.featuredText]}>{title}</Text>
      <Text style={[styles.price, featured && styles.featuredText]}>{price}</Text>
      {items.map((item) => (
        <Text key={item} style={[styles.item, featured && styles.featuredItem]}>{item}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  container: {
    gap: spacing.lg,
    padding: spacing.lg
  },
  heading: typography.heading,
  planRow: {
    flexDirection: "row",
    gap: spacing.md
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    flex: 1,
    gap: spacing.sm,
    minHeight: 280,
    padding: spacing.md,
    ...shadows.card
  },
  featured: {
    backgroundColor: colors.navy
  },
  planTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  featuredText: {
    color: colors.surface
  },
  price: {
    color: colors.orange,
    fontSize: 20,
    fontWeight: "900"
  },
  item: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  featuredItem: {
    color: "#D9E6F8"
  }
});
