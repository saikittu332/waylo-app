import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PrimaryButton from "../components/PrimaryButton";
import { colors, radii, screen, shadows, spacing, typography } from "../constants/theme";
import { setMockPremium } from "../services/subscriptionService";

export default function PaywallScreen({ navigation }) {
  const [upgraded, setUpgraded] = useState(false);

  function upgrade() {
    setMockPremium(true);
    setUpgraded(true);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
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
        <PrimaryButton title="Back to Waylo" variant="secondary" onPress={() => navigation.goBack()} />
      </ScrollView>
    </SafeAreaView>
  );
}

function PlanCard({ title, price, items, featured }) {
  return (
    <View style={[styles.card, featured && styles.featured]}>
      <Text style={[styles.planTitle, featured && styles.featuredText]}>{title}</Text>
      <Text style={[styles.price, featured && styles.featuredText]}>{price}</Text>
      {items.map((item) => (
        <View key={item} style={styles.itemRow}>
          <Ionicons color={featured ? colors.surface : colors.green} name="checkmark-circle" size={17} />
          <Text style={[styles.item, featured && styles.featuredItem]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.appBackground,
    flex: 1
  },
  container: {
    alignSelf: "center",
    gap: spacing.lg,
    maxWidth: screen.maxWidth,
    minHeight: "100%",
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
    width: "100%"
  },
  heading: typography.heading,
  planRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    flexBasis: 150,
    flexGrow: 1,
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
    flex: 1,
    fontSize: 14,
    lineHeight: 20
  },
  itemRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  featuredItem: {
    color: "#D9E6F8"
  }
});
