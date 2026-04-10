import React from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import { SearchIcon as NavbarSearchIcon } from "../components/NavbarIcons";
import { fetchSearchFoods, type SearchFoodItem } from "../services/searchFoodService";
import { styles } from "../styles/SearchScreenStyles";

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
  return (
    <NavbarSearchIcon width={18} height={18} color="#145FA0" />
  );
}

function CameraButton() {
  return (
    <View style={styles.cameraIcon}>
      <View style={styles.cameraIconTop} />
      <View style={styles.cameraIconLens} />
    </View>
  );
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

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResultItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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
        <View style={styles.logoRow}>
          <Image
            source={require("../../assets/images/openScreen/logo.png")}
            resizeMode="contain"
            style={styles.logoImage}
          />
          <Text style={styles.logoRightLabel}>IA</Text>
          <View pointerEvents="none" style={styles.logoRowBottomShadow} />
        </View>

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

          <Pressable accessibilityRole="button" style={styles.cameraButton} onPress={() => {}}>
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
          {results.length > 0 ? (
            results.map((item, index) => (
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

      <View style={styles.bottomNav}>
        <View style={styles.bottomNavRow}>
          <Pressable style={styles.navItem} onPress={() => router.replace("/home")}>
            <Image
              source={require("../../assets/images/navbar/home.png")}
              resizeMode="contain"
              style={styles.navIconImage}
            />
            <Text style={styles.navLabel}>Início</Text>
          </Pressable>

          <Pressable style={styles.navItem} onPress={() => router.push("/recipes")}>
            <Image
              source={require("../../assets/images/navbar/receitas.png")}
              resizeMode="contain"
              style={styles.navIconImage}
            />
            <Text style={styles.navLabel}>Receitas</Text>
          </Pressable>

          <Pressable style={styles.navCenterPressable} onPress={() => router.push("/search")}>
            <View style={styles.navCenterGroup}>
              <View style={styles.navCenterHalo} />
              <View style={styles.navCenterButton}>
                <NavbarSearchIcon />
              </View>
              <Text style={styles.navCenterLabel}>Pesquisar</Text>
            </View>
          </Pressable>

          <Pressable style={styles.navItem} onPress={() => router.push("/library")}>
            <Image
              source={require("../../assets/images/navbar/biblioteca.png")}
              resizeMode="contain"
              style={styles.navIconImage}
            />
            <Text style={styles.navLabel}>Biblioteca</Text>
          </Pressable>

          <Pressable style={styles.navItem} onPress={() => router.push("/profile")}>
            <Image
              source={require("../../assets/images/navbar/perfil.png")}
              resizeMode="contain"
              style={styles.navIconImage}
            />
            <Text style={styles.navLabel}>Perfil</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}