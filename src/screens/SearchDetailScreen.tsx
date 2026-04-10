import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";

import { fetchSearchFoods, type SearchFoodItem } from "../services/searchFoodService";
import { styles } from "../styles/SearchDetailScreenStyles";

type DetailParams = {
  nomePrincipal?: string | string[];
  grupoAlimentar?: string | string[];
};

type DetailItem = SearchFoodItem & {
  sinonimos?: string | string[];
  porcao?: string;
  medidaCaseira?: string;
  medidacaseira?: string;
  textoInformativo?: string;
};

function getParamValue(value: string | string[] | undefined, fallback: string) {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value) && value[0]?.trim()) {
    return value[0];
  }

  return fallback;
}

function toImageUri(imagem64: string) {
  if (imagem64.startsWith("data:")) {
    return imagem64;
  }

  if (imagem64.startsWith("http://") || imagem64.startsWith("https://")) {
    return imagem64;
  }

  return `data:image/png;base64,${imagem64}`;
}

function toList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/,|\n/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

function readText(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return fallback;
}

function readFoodField(item: DetailItem | null, key: keyof DetailItem, fallback = "") {
  if (!item) {
    return fallback;
  }

  return readText(item[key], fallback);
}

function readMeasureField(item: DetailItem | null) {
  if (!item) {
    return "Não informado";
  }

  const measure = readText(item.medidaCaseira, "") || readText(item.medidacaseira, "");
  return measure || "Não informado";
}

export default function SearchDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<DetailParams>();
  const nomePrincipalParam = getParamValue(params.nomePrincipal, "");
  const grupoAlimentarParam = getParamValue(params.grupoAlimentar, "");

  const [item, setItem] = React.useState<DetailItem | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isActive = true;

    async function loadFood() {
      if (!nomePrincipalParam.trim()) {
        setItem(null);
        setError("Alimento não informado.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const foods = await fetchSearchFoods(nomePrincipalParam);
        const normalizedTarget = nomePrincipalParam.trim().toLowerCase();
        const normalizedGroup = grupoAlimentarParam.trim().toLowerCase();

        const matchedFood =
          foods.find((food) => food.nomePrincipal.trim().toLowerCase() === normalizedTarget && (!normalizedGroup || food.grupoAlimentar.trim().toLowerCase() === normalizedGroup)) ??
          foods.find((food) => food.nomePrincipal.trim().toLowerCase() === normalizedTarget) ??
          foods.find((food) => normalizedGroup && food.grupoAlimentar.trim().toLowerCase() === normalizedGroup) ??
          foods[0] ??
          null;

        if (isActive) {
          setItem(matchedFood as DetailItem | null);
        }
      } catch (loadError) {
        if (isActive) {
          setItem(null);
          setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar os detalhes.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadFood();

    return () => {
      isActive = false;
    };
  }, [grupoAlimentarParam, nomePrincipalParam]);

  const nomePrincipal = item?.nomePrincipal?.trim() || nomePrincipalParam || "Alimento selecionado";
  const grupoAlimentar = "Grupo " + (item?.grupoAlimentar?.trim().toLowerCase() || grupoAlimentarParam || "Grupo alimentar não informado");
  const imageUri = item?.imagem64 ? toImageUri(item.imagem64) : "";
  const heartColor = item?.heartColor?.trim() || "#01AB51";
  const portionText = readFoodField(item, "porcao", "Não informado");
  const synonymValues = toList(item?.sinonimos);
  const informationText = readFoodField(item, "textoInformativo", "Não informado");
  const houseMeasure = readMeasureField(item);

  return (
    <View style={styles.screen}>
      <ExpoStatusBar style="dark" translucent />

      <View style={styles.content}>
        <View style={styles.headerBar}>
          <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityRole="button">
            <Ionicons name="arrow-back" size={33} color="#01AB51" />
          </Pressable>

          <View style={styles.headerRightWrap}>
            <Text style={styles.headerRightText}>Detalhes pesquisa</Text>
          </View>

          <View pointerEvents="none" style={styles.headerBarShadow} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {loading ? <Text style={styles.sectionBody}>Carregando detalhes...</Text> : null}
          {error ? <Text style={styles.sectionBody}>{error}</Text> : null}

          {!loading && !error ? (
            <>
              <View style={styles.heroBlock}>
                <Text style={styles.foodName} numberOfLines={2}>
                  {nomePrincipal}
                </Text>

                <View style={styles.groupRow}>
                  <Ionicons name="heart" size={18} color={heartColor} style={styles.heartIcon} />
                  <Text style={[styles.groupText, { color: heartColor }]} numberOfLines={2}>
                    {grupoAlimentar}
                  </Text>
                </View>

                <View style={styles.imageFrame}>
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} resizeMode="cover" style={styles.image} />
                  ) : (
                    <View style={[styles.image, { alignItems: "center", justifyContent: "center" }]}>
                      <Text style={styles.mutedText}>Imagem indisponível</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Porção</Text>
                <Text style={styles.sectionValue}>{portionText}</Text>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Sinônimos Regionais</Text>
                <Text style={styles.sectionBody}>{synonymValues.length > 0 ? synonymValues.join(", ") : "Não informado"}</Text>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Medida caseira</Text>
                <Text style={styles.sectionValue}>{houseMeasure}</Text>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Texto informativo</Text>
                <Text style={styles.sectionBody}>{informationText}</Text>
              </View>
            </>
          ) : null}
        </ScrollView>
      </View>
    </View>
  );
}
