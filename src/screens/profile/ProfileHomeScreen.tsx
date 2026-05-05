import React from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import AppHeader from "../../components/AppHeader";
import { loadProfileSummary, type ProfileSummary } from "../../services/profileStorage";
import { styles as homeStyles } from "../../styles/HomeScreenStyles";
import { styles } from "../../styles/ProfileHomeScreenStyles";

function GoalBadge({ color, value }: { color: string; value: number }) {
  return (
    <View style={styles.goalBadge}>
      <Text style={[styles.goalBadgeValue, { color }]}>{value}</Text>
    </View>
  );
}

export default function ProfileHomeScreen() {
  const router = useRouter();
  const [summary, setSummary] = React.useState<ProfileSummary | null>(null);
  const [loading, setLoading] = React.useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const initialize = async () => {
        setLoading(true);
        const storedProfile = await loadProfileSummary();

        if (!isActive) {
          return;
        }

        if (!storedProfile) {
          router.replace("/profile-setup");
          return;
        }

        setSummary(storedProfile);
        setLoading(false);
      };

      void initialize();

      return () => {
        isActive = false;
      };
    }, [router]),
  );

  if (loading || !summary) {
    return (
      <View style={styles.screen}>
        <ExpoStatusBar style="dark" translucent />
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#145FA0" />
          <Text style={styles.loadingText}>Carregando seu perfil...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ExpoStatusBar style="dark" translucent />

      <View style={styles.content}>
        <AppHeader title="Perfil" containerStyle={{ marginHorizontal: -35, marginTop: 29 }} />
        <Text style={styles.sectionTitle}>Meu perfil</Text>

        <View style={styles.profileCard}>
          <Text style={styles.profileCardTitle}>Olá, Bem-vindo</Text>
          <View style={styles.profileCardMetaRow}>
            <Text style={styles.profileCardMetaLabel}>IMC:</Text>
            <Text style={styles.profileCardMetaValue}>{summary.bmi.toFixed(0)}</Text>
          </View>

          <Text style={styles.goalHeading}>Sua Meta Diária:</Text>

          <View style={styles.goalRow}>
            <GoalBadge color="#01AB51" value={summary.goalPlan.greenCount} />
            <GoalBadge color="#085491" value={summary.goalPlan.blueCount} />
            <GoalBadge color="#FAC800" value={summary.goalPlan.yellowCount} />
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionBlockTitle}>Diário alimentar</Text>
            <Pressable onPress={() => router.push("/meal-history")} accessibilityRole="button">
              <Text style={styles.sectionAction}>Ver tudo</Text>
            </Pressable>
          </View>
          <Pressable style={styles.actionButton} onPress={() => router.push("/meal-history")} accessibilityRole="button">
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Registrar refeição</Text>
          </Pressable>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionBlockTitle}>Lista de compras</Text>
            <Pressable onPress={() => router.push("/recipes")} accessibilityRole="button">
              <Text style={styles.sectionAction}>Ver tudo</Text>
            </Pressable>
          </View>
          <Pressable style={styles.actionButton} onPress={() => router.push("/recipes")} accessibilityRole="button">
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Criar Lista de compras</Text>
          </Pressable>
        </View>

        <View style={styles.analyticsBlock}>
          <Text style={styles.sectionBlockTitle}>Análise Gráfica</Text>
          <Text style={styles.analyticsSubtitle}>Meta vs. Realidade: Acompanhe seu progresso diário</Text>
          <View style={styles.analyticsPlaceholder}>
            <Text style={styles.analyticsPlaceholderText}>Gráficos em breve</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </View>

      <View style={homeStyles.bottomNav}>
        <View style={homeStyles.bottomNavRow}>
          <Pressable style={homeStyles.navItem} onPress={() => router.replace("/home")}> 
            <Image source={require("../../../assets/images/navbar/home.png")} resizeMode="contain" style={homeStyles.navIconImage} />
            <Text style={homeStyles.navLabel}>Início</Text>
          </Pressable>

          <Pressable style={homeStyles.navItem} onPress={() => router.push("/recipes")}> 
            <Image source={require("../../../assets/images/navbar/receitas.png")} resizeMode="contain" style={homeStyles.navIconImage} />
            <Text style={homeStyles.navLabel}>Receitas</Text>
          </Pressable>

          <Pressable style={homeStyles.navCenterPressable} onPress={() => router.push("/search")}> 
            <View style={homeStyles.navCenterGroup}>
              <View style={homeStyles.navCenterHalo} />
              <View style={homeStyles.navCenterButton}>
                <Ionicons name="search" size={24} color="#FFFFFF" />
              </View>
              <Text style={homeStyles.navCenterLabel}>Pesquisar</Text>
            </View>
          </Pressable>

          <Pressable style={homeStyles.navItem} onPress={() => router.push("/library")}>
            <Image source={require("../../../assets/images/navbar/biblioteca.png")} resizeMode="contain" style={homeStyles.navIconImage} />
            <Text style={homeStyles.navLabel}>Biblioteca</Text>
          </Pressable>

          <Pressable style={homeStyles.navItem} onPress={() => router.push("/profile-home")}>
            <Image source={require("../../../assets/images/navbar/perfil.png")} resizeMode="contain" style={homeStyles.navIconImage} />
            <Text style={homeStyles.navLabel}>Perfil</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
