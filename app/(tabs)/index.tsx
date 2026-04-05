import React from "react";
import { View, Text, StatusBar } from "react-native";

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: "#2196F3" }}>
      <StatusBar
        backgroundColor="#1976D2"
        barStyle="light-content"
        translucent={false}
        hidden={false}
      />

      <Text style={{ color: "white", marginTop: 50 }}>
        Hello StatusBar 👋
      </Text>
    </View>
  );
}