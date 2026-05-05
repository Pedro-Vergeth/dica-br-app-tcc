import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import ProfileScreen from "../src/screens/profile/ProfileScreen";
import { loadProfileSummary } from "../src/services/profileStorage";

export default function ProfileRoute() {
  const router = useRouter();
  const [resolved, setResolved] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const resolveProfileRoute = async () => {
      const storedProfile = await loadProfileSummary();

      if (!isMounted) {
        return;
      }

      if (storedProfile) {
        router.replace("/profile-home");
        return;
      }

      setResolved(true);
    };

    void resolveProfileRoute();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (resolved) {
    return <ProfileScreen />;
  }

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" }}>
      <ExpoStatusBar style="dark" translucent />
      <ActivityIndicator color="#145FA0" />
      <Text style={{ color: "#145FA0", fontSize: 14, fontWeight: "600", marginTop: 10 }}>Carregando perfil...</Text>
    </View>
  );
}
