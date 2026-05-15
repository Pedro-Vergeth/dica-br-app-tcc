import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";

import BackHeader from "../../components/BackHeader";
import { fetchFoodsByGroup, fetchSearchFoods, type SearchFoodItem } from "../../services/searchFoodService";
import { styles } from "../../styles/SearchDetailScreenStyles";

type DetailParams = {
  nomePrincipal?: string | string[];
  grupoAlimentar?: string | string[];
};

type DetailItem = SearchFoodItem & {
  sinonimos?: string | string[];
  qtdMedidaCaseira?: number;
  unidadeMedidaCaseira?: string;
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

export default function SearchDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<DetailParams>();
  const nomePrincipalParam = getParamValue(params.nomePrincipal, "");
  const grupoAlimentarParam = getParamValue(params.grupoAlimentar, "");

  const [item, setItem] = React.useState<DetailItem | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [groupFoods, setGroupFoods] = React.useState<SearchFoodItem[]>([]);

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

  React.useEffect(() => {
    let isActive = true;

    async function loadGroupFoods() {
      const activeGroup = item?.grupoAlimentar?.trim() || grupoAlimentarParam.trim();

      if (!activeGroup) {
        if (isActive) {
          setGroupFoods([]);
        }

        return;
      }

      const foods = await fetchFoodsByGroup(activeGroup, 4);
      const currentName = nomePrincipalParam.trim().toLowerCase();

      const filteredFoods = foods
        .filter((food) => food.nomePrincipal.trim().toLowerCase() !== currentName)
        .slice(0, 4);

      if (isActive) {
        setGroupFoods(filteredFoods);
      }
    }

    void loadGroupFoods();

    return () => {
      isActive = false;
    };
  }, [grupoAlimentarParam, item?.grupoAlimentar, nomePrincipalParam]);

  const nomePrincipal = item?.nomePrincipal?.trim() || nomePrincipalParam || "Alimento selecionado";
  const grupoAlimentar = "Grupo " + (item?.grupoAlimentar?.trim().toLowerCase() || grupoAlimentarParam || "Grupo alimentar não informado");
  const imageUri = item?.imagem64 ? toImageUri(item.imagem64) : "";
  const heartColor = item?.heartColor?.trim() || "#01AB51";
  const synonymValues = toList(item?.sinonimos);
  const informationText = readFoodField(item, "textoInformativo", "Não informado");

  const portionQty = item?.qtdParaUmCoracao ?? null;
  const portionUnit = item?.unidade?.trim() || null;

  const measureQty = item?.qtdMedidaCaseira ?? null;
  const measureUnit = item?.unidadeMedidaCaseira?.trim() || null;

  return (
    <View style={styles.screen}>
      <ExpoStatusBar style="dark" translucent />

      <View style={styles.content}>
        <BackHeader title="Detalhes pesquisa" onBackPress={() => router.back()} />

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
                <View style={styles.valueRow}>
                  <Text style={styles.valueNumber}>
                    {portionQty != null ? String(portionQty) : "—"}
                  </Text>
                  <Text style={styles.valueUnit}>{portionUnit ?? ""}</Text>
                  <Text style={styles.valueNumber}>
                    {measureQty != null ? String(measureQty) : "—"}
                  </Text>
                  <Text style={styles.valueUnit}>{measureUnit ? `(${measureUnit})` : ""}</Text>
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Sinônimos Regionais</Text>
                <Text style={styles.sectionBody}>{synonymValues.length > 0 ? synonymValues.join(", ") : "Não informado"}</Text>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Alimentos do mesmo grupo</Text>
                {groupFoods.length > 0 ? (
                  <View style={styles.bulletList}>
                    {groupFoods.map((food) => (
                      <View key={food.nomePrincipal} style={styles.bulletRow}>
                        <Text style={styles.bulletMark}>•</Text>
                        <Text style={styles.bulletText}>{food.nomePrincipal}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.sectionBody}>Não informado</Text>
                )}
              </View>
            </>
          ) : null}
        </ScrollView>
      </View>
    </View>
  );
}
