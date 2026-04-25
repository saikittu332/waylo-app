import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import AssistantNameScreen from "../screens/AssistantNameScreen";
import VehicleSetupScreen from "../screens/VehicleSetupScreen";
import HomeScreen from "../screens/HomeScreen";
import TripResultsScreen from "../screens/TripResultsScreen";
import StopDetailsScreen from "../screens/StopDetailsScreen";
import NavigationScreen from "../screens/NavigationScreen";
import TripSummaryScreen from "../screens/TripSummaryScreen";
import PaywallScreen from "../screens/PaywallScreen";
import { colors } from "../constants/theme";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.appBackground },
        headerTintColor: colors.navy,
        headerTitleStyle: { fontWeight: "800" },
        contentStyle: { backgroundColor: colors.appBackground }
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Phone Login" }} />
      <Stack.Screen name="AssistantName" component={AssistantNameScreen} options={{ title: "Assistant" }} />
      <Stack.Screen name="VehicleSetup" component={VehicleSetupScreen} options={{ title: "Vehicle" }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Plan Trip" }} />
      <Stack.Screen name="TripResults" component={TripResultsScreen} options={{ title: "AI Trip Plan" }} />
      <Stack.Screen name="StopDetails" component={StopDetailsScreen} options={{ title: "Stop Details" }} />
      <Stack.Screen name="Navigation" component={NavigationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TripSummary" component={TripSummaryScreen} options={{ title: "Trip Summary" }} />
      <Stack.Screen name="Paywall" component={PaywallScreen} options={{ title: "Waylo Premium" }} />
    </Stack.Navigator>
  );
}
