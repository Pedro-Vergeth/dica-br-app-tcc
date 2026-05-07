import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import AppHeader from "../../components/AppHeader";
import { loadProfileSummary } from "../../services/profileStorage";
import { styles } from "../../styles/HomeScreenStyles";

export default function HomeScreen() {
  const router = useRouter();
  const [hasProfile, setHasProfile] = React.useState<boolean | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const resolveProfileState = async () => {
        const storedProfile = await loadProfileSummary();

        if (isActive) {
          setHasProfile(Boolean(storedProfile));
        }
      };

      void resolveProfileState();

      return () => {
        isActive = false;
      };
    }, []),
  );

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" translucent />

      <View style={styles.content}>
        <AppHeader title="Início" />

        {hasProfile === false ? (
          <Pressable style={styles.profileCard} onPress={() => router.push("/profile")}>
            <View style={styles.profileCardTextWrap}>
              <Text style={styles.profileCardTitle}>Personalize sua dieta</Text>
              <Text style={styles.profileCardText}>
                Informe sua altura, peso e idade para calcular seu IMC e suas metas diárias de alimentação.
              </Text>
              <View style={styles.profileButton}>
                <Text style={styles.profileButtonText}>Configurar perfil</Text>
              </View>
            </View>
            <View style={styles.profileIllustration} />
          </Pressable>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Sugestões Para Você</Text>
          <Pressable onPress={() => router.push("/recipes")}>
            <Text style={styles.sectionHeaderAction}>Ver tudo</Text>
          </Pressable>
        </View>

        <View style={styles.suggestionGrid}>
          <Pressable
            style={[styles.suggestionCard, { backgroundColor: "#0A7B3D" }]}
            onPress={() => router.push("/recipes")}
          >
            <View style={styles.suggestionTop}>
              <Text style={styles.suggestionLabel}>Como funciona a dieta</Text>
              <Text style={styles.suggestionMeta}>⏱ 2 min</Text>
            </View>
          </Pressable>

          <Pressable
            style={[styles.suggestionCard, styles.suggestionCardSecondary]}
            onPress={() => router.push("/recipes")}
          >
            <View style={styles.suggestionTop}>
              <Text style={[styles.suggestionLabel, styles.suggestionLabelDark]}>
                Abacate: conheça os benefícios
              </Text>
              <Text style={styles.suggestionMeta}>📖 Leitura</Text>
            </View>
          </Pressable>
        </View>

        <Text style={styles.sectionHeaderTitle}>Game Monte seu Prato</Text>
        <View style={styles.gameCard}>
          <View style={styles.gameCardContent}>
            <Text style={styles.gameCardTitle}>VEJA SE APRENDEU</Text>
            <Text style={styles.gameCardSubtitle}>Monte o seu Prato</Text>
            <Pressable style={styles.gameButton} onPress={() => router.push("/game-intro")}>
              <Text style={styles.gameButtonText}>Começar</Text>
            </Pressable>
          </View>
          <View style={styles.plateCircle} />
        </View>
      </View>

    </View>
  );
}
