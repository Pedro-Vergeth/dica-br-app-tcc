import React from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import AppHeader from "../../components/AppHeader";
import { fetchSearchFoods, type SearchFoodItem } from "../../services/searchFoodService";
import { styles } from "../../styles/SearchScreenStyles";

type SearchResultItem = SearchFoodItem & {
  imageUri: string;
};

function toImageUri(imagem64: string) {
  if (imagem64.startsWith("data:")) {
    return imagem64;
  }

  if (imagem64.startsWith("http://") || imagem64.startsWith("https://")) {
    return imagem64;
  }

  return `data:image/png;base64,${imagem64}`;
}

function SearchIcon() {
  return <Ionicons name="search" size={18} color="#145FA0" />;
}

function CameraButton() {
  return <Ionicons name="camera-outline" size={20} color="#FFFFFF" />;
}

function SearchResultCard({
  item,
  onPress,
}: {
  item: SearchResultItem;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.resultCard} onPress={onPress} accessibilityRole="button">
      <View style={styles.resultThumbWrap}>
        <Image source={{ uri: item.imageUri }} resizeMode="cover" style={styles.resultThumb} />
      </View>

      <View style={styles.resultContent}>
        <Text style={styles.resultName} numberOfLines={2}>
          {item.nomePrincipal}
        </Text>
        <Ionicons name="heart" size={16} color={item.heartColor} style={styles.resultHeart} />
      </View>
    </Pressable>
  );
}

function isRedGroup(group: string) {
  const normalized = group
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return normalized.includes("VERMELHO");
}

function normalizeSearchText(value: string) {
  return value
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string | string[] }>();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResultItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const redGroupItem = React.useMemo(() => {
    const normalizedQuery = normalizeSearchText(query);

    if (!normalizedQuery) {
      return null;
    }

    return (
      results.find(
        (item) => isRedGroup(item.grupoAlimentar) && normalizeSearchText(item.nomePrincipal) === normalizedQuery,
      ) ?? null
    );
  }, [query, results]);
  const visibleResults = React.useMemo(
    () => results.filter((item) => !isRedGroup(item.grupoAlimentar) || normalizeSearchText(item.nomePrincipal) === normalizeSearchText(query)),
    [query, results],
  );

  React.useEffect(() => {
    const routeQuery = Array.isArray(params.query) ? params.query[0] : params.query;

    if (typeof routeQuery === "string" && routeQuery.trim() && routeQuery !== query) {
      setQuery(routeQuery);
    }
  }, [params.query, query]);

  const runSearch = React.useCallback(async (searchValue: string) => {
    const normalizedSearch = searchValue.trim();

    if (!normalizedSearch) {
      setResults([]);
      setSearched(false);
      setError(null);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const foods = await fetchSearchFoods(normalizedSearch);

      const mappedResults = foods.map((item) => ({
        ...item,
        imageUri: toImageUri(item.imagem64),
      }));

      setResults(mappedResults);
      setError(null);
    } catch (searchError) {
      setResults([]);
      setError(searchError instanceof Error ? searchError.message : "Não foi possível buscar alimentos.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setSearched(true);

    const timeoutId = setTimeout(() => {
      void runSearch(normalizedQuery);
    }, 350);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query, runSearch]);

  return (
    <View style={styles.screen}>
      <ExpoStatusBar style="dark" translucent />

      <View style={styles.content}>
        <AppHeader title="IA" />

        <View style={styles.searchBarRow}>
          <View style={styles.searchInputWrap}>
            <View style={styles.searchInputIconWrap}>
              <SearchIcon />
            </View>
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => void runSearch(query)}
              placeholder="Procurar alimento"
              placeholderTextColor="#145FA0"
              style={styles.searchInput}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Pressable accessibilityRole="button" style={styles.cameraButton} onPress={() => router.push("/camera-capture")}>
            <CameraButton />
          </Pressable>
        </View>

        <Text style={styles.resultsTitle}>Resultado da pesquisa</Text>

        {loading ? (
          <Text style={styles.resultStatusText}>Buscando alimentos...</Text>
        ) : null}

        {error ? (
          <Text style={[styles.resultStatusText, styles.resultErrorText]}>{error}</Text>
        ) : null}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultsList}>
          {!loading && redGroupItem ? (
            <View style={styles.redWarningState}>
              <Ionicons name="heart" size={62} color="#E60000" style={styles.redWarningIcon} />

              <Text style={styles.redWarningTitle}>“{redGroupItem.nomePrincipal}”</Text>
              <Text style={styles.redWarningSubtitle}>EVITE O CONSUMO!</Text>
              <Text style={styles.redWarningText}>
                Este alimento está no grupo vermelho e não é recomendado para a saúde do coração.
              </Text>

              <Pressable onPress={() => router.push("/search-red-group")} accessibilityRole="link">
                <Text style={styles.redWarningLink}>entenda mais sobre esse grupo alimentar!</Text>
              </Pressable>
            </View>
          ) : visibleResults.length > 0 ? (
            visibleResults.map((item, index) => (
              <SearchResultCard
                key={`${item.nomePrincipal}-${index}`}
                item={item}
                onPress={() => {
                  router.push({
                    pathname: "/search-details",
                    params: {
                      nomePrincipal: item.nomePrincipal,
                      grupoAlimentar: item.grupoAlimentar,
                    },
                  });
                }}
              />
            ))
          ) : searched && !loading && !error ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Buscar por IA</Text>
              <Text style={styles.emptyStateText}>Nenhum item encontrado</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Buscar por IA</Text>
              <Text style={styles.emptyStateText}>Nenhum item encontrado</Text>
            </View>
          )}
        </ScrollView>
      </View>

    </View>
  );
}