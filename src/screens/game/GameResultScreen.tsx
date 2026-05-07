import React from "react";
import { Pressable, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";

import BackHeader from "../../components/BackHeader";
import { styles } from "../../styles/GameResultScreenStyles";

export default function GameResultScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../../../assets/fonts/Poppins/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../../../assets/fonts/Poppins/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../../../assets/fonts/Poppins/Poppins-Bold.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" translucent />

      <View style={styles.content}>
        <BackHeader
          title="Monte seu prato"
          onBackPress={() => router.replace("/home")}
          containerStyle={{ marginHorizontal: -30 }}
        />

        <View style={styles.body}>
          <Text style={styles.title}>Parabéns!</Text>

          <Text style={styles.paragraph}>
            Você compreendeu os grupos alimentares da Alimentação Cardioprotetora e montou um prato equilibrado.
          </Text>

          <Text style={styles.paragraph}>
            Entender quais alimentos fazem parte dos grupos{" "}
            <Text style={styles.colorVerde}>VERDE</Text>,{" "}
            <Text style={styles.colorAmarelo}>AMARELO</Text> E{" "}
            <Text style={styles.colorAzul}>AZUL</Text> é fundamental para fazer
            escolhas mais equilibradas e cuidar melhor da saúde do coração.
          </Text>

          <Text style={styles.question}>
            Que tal testar novamente seus conhecimentos?
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace("/game-intro")}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Jogar Novamente</Text>
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={() => router.replace("/home")}
            accessibilityRole="button"
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
