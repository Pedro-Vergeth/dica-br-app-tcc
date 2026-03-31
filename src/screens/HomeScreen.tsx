import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import { loadSelectedState } from "../services/onboardingStorage";
import { styles } from "../styles/HomeScreenStyles";

export default function HomeScreen() {
  const router = useRouter();
  const [stateLabel, setStateLabel] = React.useState("Nenhum estado salvo");

  React.useEffect(() => {
    let isMounted = true;

    const loadState = async () => {
      const selectedState = await loadSelectedState();

      if (isMounted && selectedState) {
        setStateLabel(selectedState.state);
      }
    };

    void loadState();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" translucent />

      <View style={styles.content}>
        <View style={styles.logoRow}>
          <Image
            source={require("../../assets/images/openScreen/logo.png")}
            resizeMode="contain"
            style={styles.logoImage}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Meu perfil</Text>
        </View>

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
            <Pressable style={styles.gameButton} onPress={() => router.push("/game")}>
              <Text style={styles.gameButtonText}>Começar</Text>
            </Pressable>
          </View>
          <View style={styles.plateCircle} />
        </View>

        <View style={styles.statePill}>
          <Text style={styles.statePillLabel}>Estado salvo</Text>
          <Text style={styles.statePillValue}>{stateLabel}</Text>
        </View>
      </View>

      <View style={styles.bottomNav}>
        <View style={styles.bottomNavRow}>
          <Pressable style={styles.navItem} onPress={() => router.replace("/home")}>
            <Text style={styles.navIcon}>⌂</Text>
            <Text style={styles.navLabel}>Início</Text>
          </Pressable>

          <Pressable style={styles.navItem} onPress={() => router.push("/recipes")}>
            <Text style={styles.navIcon}>🍴</Text>
            <Text style={styles.navLabel}>Receitas</Text>
          </Pressable>

          <Pressable style={styles.navCenterButtonWrap} onPress={() => router.push("/game")}>
            <View style={styles.navCenterButton}>
              <Text style={styles.navCenterText}>IA</Text>
            </View>
            <Text style={styles.navLabel}>Pesquisar</Text>
          </Pressable>

          <Pressable style={styles.navItem} onPress={() => router.push("/library")}>
            <Text style={styles.navIcon}>▤</Text>
            <Text style={styles.navLabel}>Biblioteca</Text>
          </Pressable>

          <Pressable style={styles.navItem} onPress={() => router.push("/profile")}>
            <Text style={styles.navIcon}>☺</Text>
            <Text style={styles.navLabel}>Perfil</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
