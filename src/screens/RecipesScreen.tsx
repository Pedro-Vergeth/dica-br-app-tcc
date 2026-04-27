import React from "react";
import { Animated, Easing, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";

import { SearchIcon as NavbarSearchIcon } from "../components/NavbarIcons";
import { fetchRecipes, type RecipeItem, type RecipeSortOption } from "../services/recipeService";
import { getRecentHistoryEntries, saveRecentAccessedItem, type RecentHistoryEntry } from "../services/recentHistoryService";
import { styles as searchStyles } from "../styles/SearchScreenStyles";

type RecipeResultItem = RecipeItem & {
  imageUri: string;
};

type RecentRecipeItem = RecentHistoryEntry;

const PAGE_SIZE = 10;
const RECIPE_DETAIL_ROUTE = "/recipe-details";
const tipoRefeicaoOptions = ["CAFE_DA_MANHA", "ALMOCO", "JANTAR", "LANCHE"] as const;
const tipoRefeicaoLabels: Record<(typeof tipoRefeicaoOptions)[number], string> = {
  CAFE_DA_MANHA: "Café da manhã",
  ALMOCO: "Almoço",
  JANTAR: "Jantar",
  LANCHE: "Lanche",
};
const grupoAlimentarOptions = ["Verde", "Amarelo", "Azul"] as const;

type StoredRecipePayload = {
  route: string;
  recipe: RecipeResultItem;
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

function resolveGroupAccentColor(groupName: string) {
  const normalized = groupName
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

  return "#145FA0";
}

function normalizeGrupoAlimentarOption(value: string) {
  const normalizedValue = value
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const matchedOption = grupoAlimentarOptions.find((option) => option
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") === normalizedValue);

  return matchedOption ?? value;
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

  if (normalizedValue === "ALMOÇO") {
    return "ALMOCO";
  }

  return "";
}

function SearchIcon() {
  return <NavbarSearchIcon width={18} height={18} color="#145FA0" />;
}

function SortIcon() {
  return <Ionicons name="options-outline" size={20} color="#FFFFFF" />;
}

function buildStoredRecipePayload(recipe: RecipeResultItem): StoredRecipePayload {
  return {
    route: RECIPE_DETAIL_ROUTE,
    recipe,
  };
}

function readStoredRecipePayload(payload: Record<string, unknown> | null) {
  if (!payload) {
    return null;
  }

  const route = typeof payload.route === "string" ? payload.route : "";
  const recipe = payload.recipe && typeof payload.recipe === "object" ? (payload.recipe as RecipeResultItem) : null;

  if (!route || !recipe) {
    return null;
  }

  return {
    route,
    recipe,
  } as StoredRecipePayload;
}

function openRecipeDetails(router: ReturnType<typeof useRouter>, recipe: RecipeResultItem) {
  router.push({
    pathname: RECIPE_DETAIL_ROUTE,
    params: {
      recipeJson: encodeURIComponent(JSON.stringify(recipe)),
    },
  });
}

function RecipeCard({
  item,
  onPress,
}: {
  item: RecipeResultItem;
  onPress: () => void;
}) {
  const heartColor = resolveHeartColor(item.grupoAlimentar);

  return (
    <Pressable style={searchStyles.resultCard} onPress={onPress} accessibilityRole="button">
      <View style={searchStyles.resultThumbWrap}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} resizeMode="cover" style={searchStyles.resultThumb} />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#E7EEF7" }}>
            <Ionicons name="restaurant-outline" size={18} color="#145FA0" />
          </View>
        )}
      </View>

      <View style={searchStyles.resultContent}>
        <Text style={searchStyles.resultName} numberOfLines={2}>
          {item.titulo}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
          <Ionicons name="heart" size={16} color={heartColor} />
          <Text style={{ color: "#4A5568", fontSize: 13, lineHeight: 16, fontWeight: "600" }}>
            {item.tempoPreparoMinutos ? `${item.tempoPreparoMinutos} min` : "Tempo não informado"}
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color="#A8B3BF" />
    </Pressable>
  );
}

function RecentRecipeCard({
  item,
  onPress,
}: {
  item: RecentRecipeItem;
  onPress: () => void;
}) {
  const storedRecipe = readStoredRecipePayload(item.payload);
  const grupoAlimentar = storedRecipe?.recipe.grupoAlimentar ?? item.subtitle ?? "";
  const heartColor = resolveHeartColor(grupoAlimentar);

  return (
    <Pressable style={searchStyles.resultCard} onPress={onPress} accessibilityRole="button">
      <View style={searchStyles.resultThumbWrap}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} resizeMode="cover" style={searchStyles.resultThumb} />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#E7EEF7" }}>
            <Ionicons name={item.kind === "query" ? "search" : "time-outline"} size={18} color="#145FA0" />
          </View>
        )}
      </View>

      <View style={searchStyles.resultContent}>
        <Text style={searchStyles.resultName} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
          <Ionicons name="heart" size={16} color={heartColor} />
          <Text style={{ color: "#6B7280", fontSize: 12, lineHeight: 16, fontWeight: "500", flex: 1 }} numberOfLines={1}>
            {grupoAlimentar || (item.kind === "query" ? "Busca recente" : "Receita acessada")}
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color="#A8B3BF" />
    </Pressable>
  );
}

const sortLabels: Record<RecipeSortOption, string> = {
  recentes: "Mais recentes",
  menorTempo: "Menor tempo de preparo",
  maiorTempo: "Maior tempo de preparo",
  tituloAZ: "A-Z por título",
};

export default function RecipesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string | string[]; tipoRefeicao?: string | string[]; grupoAlimentar?: string | string[] }>();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<RecipeResultItem[]>([]);
  const [recentItems, setRecentItems] = React.useState<RecentRecipeItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const [sort, setSort] = React.useState<RecipeSortOption>("recentes");
  const [sortMenuVisible, setSortMenuVisible] = React.useState(false);
  const [filtersVisible, setFiltersVisible] = React.useState(false);
  const [filterTipoRefeicao, setFilterTipoRefeicao] = React.useState("");
  const [filterGrupoAlimentar, setFilterGrupoAlimentar] = React.useState("");
  const [groupSelectorWidth, setGroupSelectorWidth] = React.useState(0);
  const groupSelectorTranslateX = React.useRef(new Animated.Value(0)).current;
  const lastRouteQueryRef = React.useRef("");

  const tipoRefeicao = typeof params.tipoRefeicao === "string" ? params.tipoRefeicao : Array.isArray(params.tipoRefeicao) ? params.tipoRefeicao[0] : "";
  const grupoAlimentar = typeof params.grupoAlimentar === "string" ? params.grupoAlimentar : Array.isArray(params.grupoAlimentar) ? params.grupoAlimentar[0] : "";

  React.useEffect(() => {
    setFilterTipoRefeicao(normalizeTipoRefeicaoOption(tipoRefeicao));
    setFilterGrupoAlimentar(normalizeGrupoAlimentarOption(grupoAlimentar));
  }, [grupoAlimentar, tipoRefeicao]);

  React.useEffect(() => {
    if (!filtersVisible) {
      return;
    }

    setFilterTipoRefeicao(normalizeTipoRefeicaoOption(tipoRefeicao));
    setFilterGrupoAlimentar(normalizeGrupoAlimentarOption(grupoAlimentar));
  }, [filtersVisible, grupoAlimentar, tipoRefeicao]);

  React.useEffect(() => {
    if (!filterGrupoAlimentar) {
      Animated.timing(groupSelectorTranslateX, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    const selectedIndex = grupoAlimentarOptions.findIndex((option) => option === filterGrupoAlimentar);
    const segmentWidth = groupSelectorWidth > 0 ? groupSelectorWidth / grupoAlimentarOptions.length : 0;

    Animated.timing(groupSelectorTranslateX, {
      toValue: selectedIndex * segmentWidth,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [filterGrupoAlimentar, groupSelectorTranslateX, groupSelectorWidth]);

  const loadRecentItems = React.useCallback(async () => {
    try {
      const storedItems = await getRecentHistoryEntries("recipes", 20);
      setRecentItems(storedItems.filter((item) => item.kind === "item"));
    } catch (historyError) {
      console.log("[recipes] recent history load error", historyError);
      setRecentItems([]);
    }
  }, []);

  React.useEffect(() => {
    const routeQuery = Array.isArray(params.query) ? params.query[0] : params.query;
    const normalizedRouteQuery = typeof routeQuery === "string" ? routeQuery.trim() : "";

    if (normalizedRouteQuery && normalizedRouteQuery !== lastRouteQueryRef.current) {
      lastRouteQueryRef.current = normalizedRouteQuery;
      setQuery(normalizedRouteQuery);
    }
  }, [params.query, query]);

  const runSearch = React.useCallback(
    async (searchValue: string, nextPage = 0) => {
      const normalizedSearch = searchValue.trim();

      if (!normalizedSearch) {
        setResults([]);
        setSearched(false);
        setError(null);
        setPage(0);
        setHasMore(true);
        void loadRecentItems();
        return;
      }

      setLoading(true);
      setSearched(true);

      console.log("[recipes] search started", {
        searchValue: normalizedSearch,
        tipoRefeicao,
        grupoAlimentar,
        sort,
        page: nextPage,
      });

      try {
        const foods = await fetchRecipes({
          page: nextPage,
          size: PAGE_SIZE,
          buscaLivre: normalizedSearch,
          tipoRefeicao: tipoRefeicao || undefined,
          grupoAlimentar: grupoAlimentar || undefined,
          sort,
        });

        const mappedResults = foods.map((item) => ({
          ...item,
          imageUri: toImageUri(item.imagem64),
        }));

        if (nextPage === 0) {
          setResults(mappedResults);
        } else {
          setResults((current) => [...current, ...mappedResults]);
        }

        setHasMore(mappedResults.length === PAGE_SIZE);
        setError(null);
        setPage(nextPage);
      } catch (searchError) {
        console.log("[recipes] search error", searchError);
        setResults([]);
        setError(searchError instanceof Error ? searchError.message : "Não foi possível buscar receitas.");
      } finally {
        setLoading(false);
      }
    },
    [grupoAlimentar, loadRecentItems, sort, tipoRefeicao],
  );

  React.useEffect(() => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      setError(null);
      setPage(0);
      setHasMore(true);
      void loadRecentItems();
      return;
    }

    setLoading(true);
    setSearched(true);

    const timeoutId = setTimeout(() => {
      void runSearch(normalizedQuery, 0);
    }, 350);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [loadRecentItems, query, runSearch]);

  React.useEffect(() => {
    if (query.trim()) {
      void runSearch(query, 0);
    }
  }, [grupoAlimentar, query, runSearch, sort, tipoRefeicao]);

  const handleOpenRecentItem = React.useCallback(
    async (item: RecentRecipeItem) => {
      if (item.kind === "query") {
        setQuery(item.title);
        return;
      }

      const storedRecipe = readStoredRecipePayload(item.payload);

      if (storedRecipe?.route === RECIPE_DETAIL_ROUTE) {
        openRecipeDetails(router, storedRecipe.recipe);
        return;
      }

      openRecipeDetails(router, {
        id: item.id,
        titulo: item.title,
        tipoRefeicao: item.subtitle ?? "",
        tempoPreparoMinutos: null,
        porcao: "",
        grupoAlimentar: item.subtitle ?? "",
        ingredientes: "",
        modoPreparo: "",
        imagem64: item.imageUri ?? "",
        estado: "",
        imageUri: item.imageUri ?? "",
      });
    },
    [router],
  );

  const applyFilters = React.useCallback(() => {
    router.replace({
      pathname: "/recipes",
      params: {
        query: query.trim() || undefined,
        tipoRefeicao: filterTipoRefeicao || undefined,
        grupoAlimentar: filterGrupoAlimentar ? filterGrupoAlimentar.toUpperCase() : undefined,
      },
    });
    setFiltersVisible(false);
  }, [filterGrupoAlimentar, filterTipoRefeicao, query, router]);

  return (
    <View style={searchStyles.screen}>
      <ExpoStatusBar style="dark" translucent />

      <View style={searchStyles.content}>
        <View style={searchStyles.logoRow}>
          <Image
            source={require("../../assets/images/openScreen/logo.png")}
            resizeMode="contain"
            style={searchStyles.logoImage}
          />
          <Text style={searchStyles.logoRightLabel}>Receitas</Text>
          <View pointerEvents="none" style={searchStyles.logoRowBottomShadow} />
        </View>

        <View style={screenStyles.searchBarRow}>
          <View style={searchStyles.searchInputWrap}>
            <View style={searchStyles.searchInputIconWrap}>
              <SearchIcon />
            </View>
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => void runSearch(query, 0)}
              placeholder="Procurar receita"
              placeholderTextColor="#145FA0"
              style={searchStyles.searchInput}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Pressable accessibilityRole="button" style={screenStyles.filterButton} onPress={() => setFiltersVisible(true)}> 
            <Ionicons name="options-outline" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={screenStyles.sectionRow}>
          <Text style={searchStyles.resultsTitle}>{query.trim() ? "Resultado da pesquisa" : "Lista"}</Text>

          <Pressable accessibilityRole="button" accessibilityLabel="Ordenar por" onPress={() => setSortMenuVisible(true)}>
            <Text style={screenStyles.sortLabel}>Ordenar por</Text>
          </Pressable>
        </View>

        {query.trim() ? (
          <>
            {loading ? <Text style={searchStyles.resultStatusText}>Buscando receitas...</Text> : null}
            {error ? <Text style={[searchStyles.resultStatusText, searchStyles.resultErrorText]}>{error}</Text> : null}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={searchStyles.resultsList}>
              {results.length > 0 ? (
                results.map((item, index) => (
                  <RecipeCard
                    key={`${item.id}-${index}`}
                    item={item}
                    onPress={() => {
                      void saveRecentAccessedItem("recipes", {
                        id: item.id,
                        title: item.titulo,
                        subtitle: item.grupoAlimentar,
                        imageUri: item.imageUri,
                        payload: buildStoredRecipePayload(item),
                      });

                      openRecipeDetails(router, item);
                    }}
                  />
                ))
              ) : searched && !loading && !error ? (
                <View style={searchStyles.emptyState}>
                  <Text style={searchStyles.emptyStateTitle}>Receitas</Text>
                  <Text style={searchStyles.emptyStateText}>Nenhum item encontrado</Text>
                </View>
              ) : (
                <View style={searchStyles.emptyState}>
                  <Text style={searchStyles.emptyStateTitle}>Receitas</Text>
                  <Text style={searchStyles.emptyStateText}>Nenhum item encontrado</Text>
                </View>
              )}

              {query.trim() && hasMore && results.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  style={screenStyles.loadMoreButton}
                  onPress={() => void runSearch(query, page + 1)}
                  disabled={loading}
                >
                  <Text style={screenStyles.loadMoreButtonText}>{loading ? "Carregando..." : "Carregar mais"}</Text>
                </Pressable>
              ) : null}
            </ScrollView>
          </>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={searchStyles.resultsList}>
            {recentItems.length > 0 ? (
              recentItems.map((item) => <RecentRecipeCard key={item.id} item={item} onPress={() => void handleOpenRecentItem(item)} />)
            ) : (
              <View style={searchStyles.emptyState}>
                <Text style={searchStyles.emptyStateTitle}>Busca recente</Text>
                <Text style={searchStyles.emptyStateText}>Os itens pesquisados e acessados vão aparecer aqui.</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      <View style={searchStyles.bottomNav}>
        <View style={searchStyles.bottomNavRow}>
          <Pressable style={searchStyles.navItem} onPress={() => router.replace("/home")}> 
            <Image source={require("../../assets/images/navbar/home.png")} resizeMode="contain" style={searchStyles.navIconImage} />
            <Text style={searchStyles.navLabel}>Início</Text>
          </Pressable>

          <Pressable style={searchStyles.navItem} onPress={() => router.push("/recipes")}> 
            <Image source={require("../../assets/images/navbar/receitas.png")} resizeMode="contain" style={searchStyles.navIconImage} />
            <Text style={searchStyles.navLabel}>Receitas</Text>
          </Pressable>

          <Pressable style={searchStyles.navCenterPressable} onPress={() => router.push("/search")}> 
            <View style={searchStyles.navCenterGroup}>
              <View style={searchStyles.navCenterHalo} />
              <View style={searchStyles.navCenterButton}>
                <NavbarSearchIcon />
              </View>
              <Text style={searchStyles.navCenterLabel}>Pesquisar</Text>
            </View>
          </Pressable>

          <Pressable style={searchStyles.navItem} onPress={() => router.push("/library")}> 
            <Image source={require("../../assets/images/navbar/biblioteca.png")} resizeMode="contain" style={searchStyles.navIconImage} />
            <Text style={searchStyles.navLabel}>Biblioteca</Text>
          </Pressable>

          <Pressable style={searchStyles.navItem} onPress={() => router.push("/profile")}> 
            <Image source={require("../../assets/images/navbar/perfil.png")} resizeMode="contain" style={searchStyles.navIconImage} />
            <Text style={searchStyles.navLabel}>Perfil</Text>
          </Pressable>
        </View>
      </View>

      <Modal transparent visible={sortMenuVisible} animationType="fade" onRequestClose={() => setSortMenuVisible(false)}>
        <Pressable style={screenStyles.modalBackdrop} onPress={() => setSortMenuVisible(false)}>
          <Pressable style={screenStyles.sortMenuCard} onPress={(event) => event.stopPropagation()}>
            <Text style={screenStyles.sortMenuTitle}>Ordenar por</Text>

            {(Object.keys(sortLabels) as RecipeSortOption[]).map((option) => (
              <Pressable
                key={option}
                style={[screenStyles.sortMenuItem, sort === option && screenStyles.sortMenuItemActive]}
                onPress={() => {
                  setSort(option);
                  setSortMenuVisible(false);
                  if (query.trim()) {
                    void runSearch(query, 0);
                  }
                }}
              >
                <Text style={[screenStyles.sortMenuItemText, sort === option && screenStyles.sortMenuItemTextActive]}>{sortLabels[option]}</Text>
                {sort === option ? <Ionicons name="checkmark" size={18} color="#085491" /> : null}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={filtersVisible} animationType="slide" onRequestClose={() => setFiltersVisible(false)}>
        <Pressable style={screenStyles.modalBackdrop} onPress={() => setFiltersVisible(false)}>
          <Pressable style={screenStyles.filterSheetCard} onPress={(event) => event.stopPropagation()}>
            <View style={screenStyles.filterSheetHeader}>
              <Pressable accessibilityRole="button" onPress={() => setFiltersVisible(false)} style={screenStyles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#145FA0" />
              </Pressable>
              <Text style={screenStyles.filterSheetTitle}>Filtros</Text>
              <View style={screenStyles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={screenStyles.filterSheetContent} showsVerticalScrollIndicator={false}>
              <Text style={screenStyles.filterSectionTitle}>Tipo de refeição</Text>
              <View style={screenStyles.filterOptionsRow}>
                {tipoRefeicaoOptions.map((option) => (
                  <Pressable
                    key={option}
                    style={[screenStyles.filterOptionChip, filterTipoRefeicao === option && screenStyles.filterOptionChipActive]}
                    onPress={() => setFilterTipoRefeicao((currentValue) => (currentValue === option ? "" : option))}
                  >
                    <Text style={[screenStyles.filterOptionText, filterTipoRefeicao === option && screenStyles.filterOptionTextActive]}>{tipoRefeicaoLabels[option]}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={screenStyles.filterSectionTitle}>Grupo alimentar</Text>
              <View
                style={screenStyles.groupSelectorRow}
                onLayout={(event) => setGroupSelectorWidth(event.nativeEvent.layout.width)}
              >
                {groupSelectorWidth > 0 && filterGrupoAlimentar ? (
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      screenStyles.groupSelectorIndicator,
                      {
                        width: groupSelectorWidth / grupoAlimentarOptions.length,
                        transform: [{ translateX: groupSelectorTranslateX }],
                      },
                    ]}
                  />
                ) : null}
                {grupoAlimentarOptions.map((option) => (
                  <Pressable
                    key={option}
                    style={[screenStyles.groupSelectorItem, filterGrupoAlimentar === option && screenStyles.groupSelectorItemActive]}
                    onPress={() => setFilterGrupoAlimentar((currentValue) => (currentValue === option ? "" : option))}
                  >
                    <Text
                      style={[
                        screenStyles.groupSelectorText,
                        { color: resolveGroupAccentColor(option) },
                        filterGrupoAlimentar === option && screenStyles.groupSelectorTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View style={screenStyles.filterFooter}>
              <Pressable style={screenStyles.applyButton} onPress={applyFilters}>
                <Text style={screenStyles.applyButtonText}>Aplicar filtros</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const screenStyles = StyleSheet.create({
  searchBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#085491",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sortLabel: {
    color: "#1C1C1C",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "500",
    paddingTop: 4,
  },
  filterSummaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#E7EEF7",
    borderRadius: 16,
  },
  filterChipText: {
    color: "#145FA0",
    fontSize: 12,
    fontWeight: "700",
  },
  loadMoreButton: {
    marginTop: 8,
    marginBottom: 8,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#085491",
  },
  loadMoreButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  filterSheetCard: {
    width: "100%",
    maxWidth: 332,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingBottom: 14,
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 10,
  },
  filterSheetHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  filterSheetTitle: {
    color: "#1C1C1C",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
    flex: 1,
    marginLeft: 170,
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  filterSheetContent: {
    paddingHorizontal: 20,
    paddingTop: 2,
    paddingBottom: 12,
  },
  filterSectionTitle: {
    color: "#6D6D6D",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  filterOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  filterOptionChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: "#E5E5E5",
  },
  filterOptionChipActive: {
    backgroundColor: "#145FA0",
  },
  filterOptionText: {
    color: "#000000",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },
  filterOptionTextActive: {
    color: "#FFFFFF",
  },
  groupSelectorRow: {
    flexDirection: "row",
    backgroundColor: "#E5E5E5",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden",
    marginBottom: 18,
  },
  groupSelectorIndicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  groupSelectorItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  groupSelectorItemActive: {
    backgroundColor: "transparent",
  },
  groupSelectorText: {
    fontSize: 11,
    fontWeight: "700",
  },
  groupSelectorTextActive: {
    transform: [{ scale: 1.02 }],
  },
  filterFooter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 2,
    justifyContent: "center",
  },
  applyButton: {
    width: 150,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#4BB05B",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#196926",
    shadowOpacity: 0.32,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 0,
    elevation: 5,
    borderBottomWidth: 3,
    borderBottomColor: "#196926",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
  },
  sortMenuCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 20,
    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 10,
  },
  sortMenuTitle: {
    color: "#1C1C1C",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
    marginBottom: 14,
  },
  sortMenuItem: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
    backgroundColor: "#F5F8FB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sortMenuItemActive: {
    backgroundColor: "#E7EEF7",
  },
  sortMenuItemText: {
    flex: 1,
    color: "#1C1C1C",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
    marginRight: 10,
  },
  sortMenuItemTextActive: {
    color: "#085491",
  },
});
