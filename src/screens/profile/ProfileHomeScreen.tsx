import React from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { PieChart } from "react-native-gifted-charts";

import AppHeader from "../../components/AppHeader";
import ProfileScreen from "./ProfileScreen";
import { loadProfileSummary, type ProfileSummary } from "../../services/profileStorage";
import { getMealRecords, type MealRecord } from "../../services/mealLogService";
import { styles } from "../../styles/ProfileHomeScreenStyles";

function isToday(timestamp: number): boolean {
  const today = new Date();
  const date = new Date(timestamp);
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function formatHeartCount(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getTodayHearts(records: MealRecord[]) {
  const result = { verde: 0, azul: 0, amarelo: 0 };
  for (const record of records.filter((r) => isToday(r.createdAt))) {
    for (const food of record.foods) {
      if (food.heartColor === "#4BB05B") result.verde += food.heartQuantity;
      else if (food.heartColor === "#0F5F9A") result.azul += food.heartQuantity;
      else if (food.heartColor === "#F7C300") result.amarelo += food.heartQuantity;
    }
  }
  return result;
}

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
  const [todayHearts, setTodayHearts] = React.useState({ verde: 0, azul: 0, amarelo: 0 });
  const [profileChecked, setProfileChecked] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const initialize = async () => {
        setProfileChecked(false);

        const storedProfile = await loadProfileSummary();

        if (!isActive) {
          return;
        }

        if (!storedProfile) {
          setSummary(null);
          setTodayHearts({ verde: 0, azul: 0, amarelo: 0 });
          setProfileChecked(true);
          return;
        }

        setSummary(storedProfile);
        const mealRecords = await getMealRecords();
        if (isActive) {
          setTodayHearts(getTodayHearts(mealRecords));
          setProfileChecked(true);
        }
      };

      void initialize();

      return () => {
        isActive = false;
      };
    }, [router]),
  );

  if (!profileChecked) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" }}>
        <ExpoStatusBar style="dark" translucent />
        <ActivityIndicator color="#145FA0" />
      </View>
    );
  }

  if (!summary) {
    return <ProfileScreen />;
  }

  const profileData = summary ?? {
    bmi: 0,
    goalPlan: {
      greenCount: 0,
      yellowCount: 0,
      blueCount: 0,
    },
  };

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
            <Text style={styles.profileCardMetaValue}>{profileData.bmi.toFixed(0)}</Text>
          </View>

          <Text style={styles.goalHeading}>Sua Meta Diária:</Text>

          <View style={styles.goalRow}>
            <GoalBadge color="#01AB51" value={profileData.goalPlan.greenCount} />
            <GoalBadge color="#085491" value={profileData.goalPlan.blueCount} />
            <GoalBadge color="#FAC800" value={profileData.goalPlan.yellowCount} />
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
            <Pressable onPress={() => router.push("/shopping-list")} accessibilityRole="button">
              <Text style={styles.sectionAction}>Ver tudo</Text>
            </Pressable>
          </View>
          <Pressable style={styles.actionButton} onPress={() => router.push("/shopping-list")} accessibilityRole="button">
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Criar Lista de compras</Text>
          </Pressable>
        </View>

        <View style={styles.analyticsBlock}>
          <Text style={styles.sectionBlockTitle}>Análise Gráfica</Text>
          <Text style={styles.analyticsSubtitle}>Meta vs. Realidade: Acompanhe seu progresso diário</Text>
          <View style={styles.chartsRow}>
            <View style={styles.chartItem}>
              <PieChart
                data={
                  summary
                    ? [
                        { value: profileData.goalPlan.greenCount, color: "#4BB05B", text: String(profileData.goalPlan.greenCount) },
                        { value: profileData.goalPlan.blueCount, color: "#0F5F9A", text: String(profileData.goalPlan.blueCount) },
                        { value: profileData.goalPlan.yellowCount, color: "#F7C300", text: String(profileData.goalPlan.yellowCount) },
                      ]
                    : [{ value: 1, color: "#E0E0E0", text: "" }]
                }
                radius={65}
                showText
                textColor="#FFFFFF"
                textSize={13}
              />
              <Text style={styles.chartLabel}>Seu consumo ideal</Text>
            </View>
            <View style={styles.chartItem}>
              <PieChart
                data={
                  todayHearts.verde + todayHearts.azul + todayHearts.amarelo > 0
                    ? [
                        todayHearts.verde > 0 ? { value: todayHearts.verde, color: "#4BB05B", text: formatHeartCount(todayHearts.verde) } : null,
                        todayHearts.azul > 0 ? { value: todayHearts.azul, color: "#0F5F9A", text: formatHeartCount(todayHearts.azul) } : null,
                        todayHearts.amarelo > 0 ? { value: todayHearts.amarelo, color: "#F7C300", text: formatHeartCount(todayHearts.amarelo) } : null,
                      ].filter(Boolean) as { value: number; color: string; text: string }[]
                    : [{ value: 1, color: "#E0E0E0", text: "" }]
                }
                radius={65}
                showText
                textColor="#FFFFFF"
                textSize={13}
              />
              <Text style={styles.chartLabel}>Seu consumo hoje</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </View>

    </View>
  );
}
