import React from "react";
import { Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function GameScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F7F8FA" }}>
      <StatusBar style="dark" translucent />
      <Text style={{ color: "#1C1C1C", fontSize: 20, fontWeight: "800" }}>Game em construção</Text>
    </View>
  );
}
