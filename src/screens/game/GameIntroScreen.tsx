import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";

import BackHeader from "../../components/BackHeader";
import { styles } from "../../styles/GameIntroScreenStyles";

export default function GameIntroScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../../../assets/fonts/Poppins/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../../../assets/fonts/Poppins/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../../../assets/fonts/Poppins/Poppins-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" translucent />

      <View style={styles.scrollContent}>
        <View>
          <BackHeader title="Monte seu prato" onBackPress={() => router.back()} containerStyle={{marginTop: 25 }} />

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
              source={require("../../../assets/images/game/plateInfo.png")}
              resizeMode="contain"
              style={styles.heroImage}
            />
          </View>
        </View>

        <Pressable style={styles.primaryButton} onPress={() => router.replace("/game")}>
          <Text style={styles.primaryButtonText}>Jogar Agora</Text>
        </Pressable>
      </View>
    </View>
  );
}
