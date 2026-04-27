import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";

const tipoRefeicaoOptions = ["CAFE_DA_MANHA", "ALMOCO", "JANTAR", "LANCHE"] as const;
const tipoRefeicaoLabels: Record<(typeof tipoRefeicaoOptions)[number], string> = {
  CAFE_DA_MANHA: "Café da manhã",
  ALMOCO: "Almoço",
  JANTAR: "Jantar",
  LANCHE: "Lanche",
};
const grupoAlimentarOptions = ["Amarelo", "Verde", "Azul"] as const;

type FilterParams = {
  tipoRefeicao?: string | string[];
  grupoAlimentar?: string | string[];
};

function getParamValue(value: string | string[] | undefined) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return "";
}

function normalizeTipoRefeicaoOption(value: string) {
  const normalizedValue = value
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");

  const matchedOption = tipoRefeicaoOptions.find((option) => option === normalizedValue);

  if (matchedOption) {
    return matchedOption;
  }

  if (normalizedValue === "CAFEDAMANHA") {
    return "CAFE_DA_MANHA";
  }

  return value;
}

export default function RecipeFiltersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<FilterParams>();
  const [tipoRefeicao, setTipoRefeicao] = React.useState(normalizeTipoRefeicaoOption(getParamValue(params.tipoRefeicao)));
  const [grupoAlimentar, setGrupoAlimentar] = React.useState(getParamValue(params.grupoAlimentar));

  const applyFilters = React.useCallback(() => {
    router.replace({
      pathname: "/recipes",
      params: {
        tipoRefeicao: tipoRefeicao || undefined,
        grupoAlimentar: grupoAlimentar || undefined,
      },
    });
  }, [grupoAlimentar, router, tipoRefeicao]);

  return (
    <View style={styles.screen}>
      <ExpoStatusBar style="dark" translucent />

      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#145FA0" />
        </Pressable>
        <Text style={styles.title}>Filtros</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Tipo de refeição</Text>
        <View style={styles.optionGroup}>
          {tipoRefeicaoOptions.map((option) => (
            <Pressable
              key={option}
              style={[styles.optionChip, tipoRefeicao === option && styles.optionChipActive]}
              onPress={() => setTipoRefeicao(option)}
            >
              <Text style={[styles.optionChipText, tipoRefeicao === option && styles.optionChipTextActive]}>{tipoRefeicaoLabels[option]}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Grupo alimentar</Text>
        <View style={styles.optionGroup}>
          {grupoAlimentarOptions.map((option) => (
            <Pressable
              key={option}
              style={[styles.optionChip, grupoAlimentar === option && styles.optionChipActive]}
              onPress={() => setGrupoAlimentar(option)}
            >
              <Text style={[styles.optionChipText, grupoAlimentar === option && styles.optionChipTextActive]}>{option}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.clearButton} onPress={() => {
          setTipoRefeicao("");
          setGrupoAlimentar("");
        }}>
          <Text style={styles.clearButtonText}>Limpar</Text>
        </Pressable>

        <Pressable style={styles.applyButton} onPress={applyFilters}>
          <Text style={styles.applyButtonText}>Aplicar filtros</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
    backgroundColor: "#F7F8FA",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E7EEF7",
  },
  title: {
    color: "#1C1C1C",
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "800",
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  sectionTitle: {
    color: "#1C1C1C",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
    marginBottom: 12,
  },
  optionGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "#E7EEF7",
  },
  optionChipActive: {
    backgroundColor: "#145FA0",
  },
  optionChipText: {
    color: "#145FA0",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "700",
  },
  optionChipTextActive: {
    color: "#FFFFFF",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
  clearButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E7EEF7",
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    color: "#145FA0",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
  },
  applyButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#085491",
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
  },
});
