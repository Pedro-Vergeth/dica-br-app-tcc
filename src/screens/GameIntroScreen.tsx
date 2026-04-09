import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";

import { styles } from "../styles/GameIntroScreenStyles";

export default function GameIntroScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../../assets/fonts/Poppins/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../../assets/fonts/Poppins/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../../assets/fonts/Poppins/Poppins-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" translucent />

      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
          <Text style={styles.backButtonIcon}>←</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Monte seu prato</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.copyBlock}>
          <Text style={styles.title}>Monte Seu Prato</Text>
          <Text style={styles.paragraph}>Monte seu prato com a Alimentação Cardioprotetora!</Text>
          <Text style={styles.paragraph}>
            A alimentação deve ser como as cores da nossa bandeira nacional. Cada cor representa um grupo de alimentos e a proporção em que devem ser consumidos. Essas são as cores certas para o seu coração.
          </Text>
        </View>

        <View style={styles.howToBlock}>
          <Text style={styles.howToTitle}>Como jogar?</Text>
          <Text style={styles.howToText}>
            Monte seu prato com os alimentos disponíveis. Equilibre os grupos alimentares conforme orientações DICA e promova escolhas saudáveis para o cuidado do seu coração!
          </Text>
        </View>

        <View style={styles.imageWrap}>
          <Image
            source={require("../../assets/images/game/plateInfo.png")}
            resizeMode="contain"
            style={styles.heroImage}
          />
        </View>

        <Pressable style={styles.primaryButton} onPress={() => router.replace("/game")}>
          <Text style={styles.primaryButtonText}>Jogar Agora</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}