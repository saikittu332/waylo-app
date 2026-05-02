import React from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import AppNavigator from "./src/navigation/AppNavigator";
import { colors } from "./src/constants/theme";

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = [{ fontFamily: "Inter_400Regular" }, Text.defaultProps.style];
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.style = [{ fontFamily: "Inter_400Regular" }, TextInput.defaultProps.style];

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold
  });

  if (!fontsLoaded) {
    return (
      <View style={{ alignItems: "center", backgroundColor: colors.appBackground, flex: 1, justifyContent: "center" }}>
        <ActivityIndicator color={colors.blue} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <AppNavigator />
    </NavigationContainer>
  );
}
