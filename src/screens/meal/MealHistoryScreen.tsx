import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";

import BackHeader from "../../components/BackHeader";
import { formatMealTypeLabel, getMealRecords, type MealRecord, type MealType } from "../../services/mealLogService";
import { styles } from "../../styles/MealHistoryScreenStyles";

const mealTypeOrder: MealType[] = ["CAFE_DA_MANHA", "ALMOCO", "JANTAR", "LANCHE"];

function toDateKey(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatDateLabel(timestamp: number) {
  const recordDate = new Date(timestamp);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startOfRecordDay = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate()).getTime();
  const differenceInDays = Math.round((startOfToday - startOfRecordDay) / 86400000);

  if (differenceInDays === 0) {
    return "Hoje";
  }

  if (differenceInDays === 1) {
    return "Ontem";
  }

  return recordDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function groupRecordsByType(records: MealRecord[]) {
  return mealTypeOrder.map((mealType) => ({
    mealType,
    records: records.filter((record) => record.mealType === mealType),
  }));
}

function groupRecordsByDay(records: MealRecord[]) {
  const groups: Array<{ dateKey: string; label: string; records: MealRecord[] }> = [];

  records.forEach((record) => {
    const dateKey = toDateKey(record.createdAt);
    const lastGroup = groups[groups.length - 1];

    if (!lastGroup || lastGroup.dateKey !== dateKey) {
      groups.push({
        dateKey,
        label: formatDateLabel(record.createdAt),
        records: [record],
      });
      return;
    }

    lastGroup.records.push(record);
  });

  return groups;
}

function RecordSection({ record }: { record: MealRecord }) {
  return (
    <View style={styles.recordSection}>
      <Text style={styles.recordMealLabel}>{record.mealLabel}</Text>

      <View style={styles.foodList}>
        {record.foods.map((food, index) => {
          const isLast = index === record.foods.length - 1;
          const heartColor = food.heartColor ?? "#01AB51";

          return (
            <View key={food.id} style={[styles.foodRow, !isLast ? styles.foodRowDivider : null]}>
              <View style={styles.foodRowTop}>
                <Text style={styles.foodRowTitle} numberOfLines={1}>
                  {food.title}
                </Text>
                <Ionicons name="heart" size={13} color={heartColor} style={styles.foodHeartIcon} />
              </View>

              <Text style={styles.foodRowMeta} numberOfLines={1}>
                {food.quantity} {food.unit}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function MealHistoryScreen() {
  const router = useRouter();
  const [records, setRecords] = React.useState<MealRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const initialize = async () => {
        setLoading(true);

        try {
          const storedRecords = await getMealRecords();

          if (!isActive) {
            return;
          }

          setRecords(storedRecords);
          setError(null);
        } catch (loadError) {
          if (isActive) {
            setRecords([]);
            setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar o histórico de refeições.");
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      void initialize();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const groupedRecordsByDay = React.useMemo(() => groupRecordsByDay(records), [records]);
  const hasRecords = records.length > 0;

  return (
    <View style={styles.screen}>
      <ExpoStatusBar style="dark" translucent />

      <View style={styles.content}>
        <BackHeader
          title="Diário alimentar"
          onBackPress={() => router.back()}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Pressable style={styles.primaryAction} onPress={() => router.push("/meal-register")} accessibilityRole="button">
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Registrar refeição</Text>
          </Pressable>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Histórico</Text>
          </View>

          {loading ? <Text style={styles.emptyStateText}>Carregando histórico...</Text> : null}
          {error ? <Text style={styles.emptyStateText}>{error}</Text> : null}

          {!loading && !error && !hasRecords ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Nenhuma refeição registrada</Text>
              <Text style={styles.emptyStateText}>Toque em "Registrar refeição" para começar a salvar o que você comeu.</Text>
            </View>
          ) : null}

          {groupedRecordsByDay.map(({ dateKey, label, records: dayRecords }) => {
            if (dayRecords.length === 0) {
              return null;
            }

            return (
              <View key={dateKey} style={styles.daySection}>
                <Text style={styles.dayLabel}>{label}</Text>

                {groupRecordsByType(dayRecords).map(({ mealType, records: mealRecords }) => {
                  if (mealRecords.length === 0) {
                    return null;
                  }

                  return (
                    <View key={mealType} style={styles.typeSection}>
                      <Text style={styles.typeSectionTitle}>{formatMealTypeLabel(mealType)}</Text>

                      {mealRecords.map((record) => (
                        <RecordSection key={record.id} record={record} />
                      ))}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
