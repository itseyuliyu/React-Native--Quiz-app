

import React, { useState } from "react";
import { ScrollView, Text, RefreshControl } from "react-native";

export default function App() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);

    // simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["blue"]}
          tintColor="blue"
        />
      }
    >
      <Text>Pull down to refresh ⬇️</Text>
    </ScrollView>
  );
}