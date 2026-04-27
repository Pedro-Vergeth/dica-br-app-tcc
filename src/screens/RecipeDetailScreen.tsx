import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";

import type { RecipeItem } from "../services/recipeService";
import { styles } from "../styles/RecipeDetailScreenStyles";

type DetailParams = {
  recipeJson?: string | string[];
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

function toImageUri(imagem64: string) {
  if (!imagem64) {
    return "";
  }

  if (imagem64.startsWith("data:")) {
    return imagem64;
  }

  if (imagem64.startsWith("http://") || imagem64.startsWith("https://")) {
    return imagem64;
  }

  return `data:image/png;base64,${imagem64}`;
}

function resolveHeartColor(grupoAlimentar: string) {
  const normalized = grupoAlimentar
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes("VERDE")) {
    return "#01632F";
  }

  if (normalized.includes("AZUL")) {
    return "#3F8CE2";
  }

  if (normalized.includes("AMARELO")) {
    return "#FAC800";
  }

  if (normalized.startsWith("#") || normalized.startsWith("RGB")) {
    return grupoAlimentar.trim();
  }

  return "#C6C6C6";
}

function formatTipoRefeicao(tipoRefeicao: string) {
  const normalized = tipoRefeicao.trim().toUpperCase();

  switch (normalized) {
    case "CAFE_DA_MANHA":
      return "Café da manhã";
    case "ALMOCO":
      return "Almoço";
    case "JANTAR":
      return "Jantar";
    case "LANCHE":
      return "Lanche";
    default:
      return tipoRefeicao.trim() || "Tipo de refeição não informado";
  }
}

function toList(value: string) {
  return value
    .split(/,|\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function readRecipe(recipeJson: string): RecipeItem | null {
  try {
    const normalizedJson = recipeJson.includes("%7B") || recipeJson.includes("%22") ? decodeURIComponent(recipeJson) : recipeJson;
    const parsed = JSON.parse(normalizedJson) as Partial<RecipeItem & { dificuldade?: string; rendimento?: string }>;

    if (!parsed || typeof parsed !== "object" || !parsed.id || !parsed.titulo) {
      return null;
    }

    return {
      id: String(parsed.id),
      titulo: String(parsed.titulo),
      tipoRefeicao: String(parsed.tipoRefeicao ?? ""),
      tempoPreparoMinutos: typeof parsed.tempoPreparoMinutos === "number" ? parsed.tempoPreparoMinutos : null,
      porcao: String(parsed.porcao ?? ""),
      grupoAlimentar: String(parsed.grupoAlimentar ?? ""),
      ingredientes: String(parsed.ingredientes ?? ""),
      modoPreparo: String(parsed.modoPreparo ?? ""),
      imagem64: String(parsed.imagem64 ?? ""),
      estado: String(parsed.estado ?? ""),
    };
  } catch {
    return null;
  }
}

export default function RecipeDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<DetailParams>();
  const recipeJson = getParamValue(params.recipeJson);
  const recipe = React.useMemo(() => readRecipe(recipeJson), [recipeJson]);
  const imageUri = recipe?.imagem64 ? toImageUri(recipe.imagem64) : "";
  const heartColor = resolveHeartColor(recipe?.grupoAlimentar ?? "");
  const ingredientValues = recipe?.ingredientes ? toList(recipe.ingredientes) : [];
  const tempoPreparo = recipe?.tempoPreparoMinutos ? `${recipe.tempoPreparoMinutos} min` : "Não informado";
  const dificuldade = "Média";
  const porcao = recipe?.porcao || "Não informado";
  const rendimento = "Não informado";

  return (
    <View style={styles.screen}>
      <ExpoStatusBar style="dark" translucent />

      <View style={styles.content}>
        <View style={styles.headerBar}>
          <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityRole="button">
            <Ionicons name="arrow-back" size={33} color="#01AB51" />
          </Pressable>

          <View style={styles.headerRightWrap}>
            <Text style={styles.headerRightText}>Detalhes receitas</Text>
          </View>

          <View pointerEvents="none" style={styles.headerBarShadow} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {!recipe ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Receita não encontrada</Text>
              <Text style={styles.emptyStateText}>Não foi possível ler os dados da receita para abrir esta página.</Text>
            </View>
          ) : (
            <>
              <View style={styles.heroBlock}>
                <Text style={styles.foodName} numberOfLines={2}>
                  {recipe.titulo}
                </Text>

                <View style={styles.groupRow}>
                  <Ionicons name="heart" size={18} color={heartColor} style={styles.heartIcon} />
                  <Text style={[styles.groupText, { color: heartColor }]} numberOfLines={2}>
                    {recipe.grupoAlimentar || "Grupo alimentar não informado"}
                  </Text>
                </View>

                <View style={styles.imageFrame}>
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} resizeMode="cover" style={styles.image} />
                  ) : (
                    <View style={[styles.image, { alignItems: "center", justifyContent: "center" }]}>
                      <Ionicons name="restaurant-outline" size={28} color="#145FA0" />
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.metricsBlock}>
                <Text style={styles.metricLine}>Tempo: {tempoPreparo}</Text>
                <Text style={styles.metricLine}>Dificuldade: {dificuldade}</Text>
                <Text style={styles.metricLine}>Porção: {porcao}</Text>
                <Text style={styles.metricLine}>Rendimento: {rendimento}</Text>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Ingredientes</Text>
                {ingredientValues.length > 0 ? (
                  <View style={styles.bulletList}>
                    {ingredientValues.map((ingredient) => (
                      <View key={ingredient} style={styles.bulletRow}>
                        <Text style={styles.bulletMark}>•</Text>
                        <Text style={styles.bulletText}>{ingredient}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.sectionBody}>Não informado</Text>
                )}
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Modo de preparo</Text>
                <View style={styles.paragraphStack}>
                  <Text style={styles.sectionBody}>{recipe.modoPreparo || "Não informado"}</Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
