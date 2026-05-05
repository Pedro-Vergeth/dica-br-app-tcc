import React from "react";
import { ActivityIndicator, FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import AppHeader from "../../components/AppHeader";
import { SearchIcon as NavbarSearchIcon } from "../../components/NavbarIcons";
import { saveRecentAccessedItem } from "../../services/recentHistoryService";
import { fetchEducationalVideos, formatVideoDuration, type EducationalVideoItem } from "../../services/videoService";
import { styles as searchStyles } from "../../styles/SearchScreenStyles";

type SortOption = "recentes" | "menorDuracao" | "maiorDuracao" | "tituloAZ";

const PAGE_SIZE = 5;
const RECOMMENDATION_LIMIT = 8;

const sortLabels: Record<SortOption, string> = {
  recentes: "Mais recentes",
  menorDuracao: "Menor duração",
  maiorDuracao: "Maior duração",
  tituloAZ: "A-Z por título",
};

const posterPalette = [
  { backgroundColor: "#0F5F9A", accentColor: "#F7C300" },
  { backgroundColor: "#01632F", accentColor: "#E7EEF7" },
  { backgroundColor: "#145FA0", accentColor: "#01AB51" },
  { backgroundColor: "#2C4FA3", accentColor: "#F7C300" },
];

function SearchIcon() {
  return <NavbarSearchIcon width={18} height={18} color="#145FA0" />;
}

function sortVideos(videos: EducationalVideoItem[], sort: SortOption) {
  const list = [...videos];

  switch (sort) {
    case "menorDuracao":
      return list.sort((left, right) => (left.duracaoSegundos ?? Number.MAX_SAFE_INTEGER) - (right.duracaoSegundos ?? Number.MAX_SAFE_INTEGER));
    case "maiorDuracao":
      return list.sort((left, right) => (right.duracaoSegundos ?? -1) - (left.duracaoSegundos ?? -1));
    case "tituloAZ":
      return list.sort((left, right) => left.titulo.localeCompare(right.titulo, "pt-BR"));
    case "recentes":
    default:
      return list;
  }
}

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

function getPosterTone(index: number) {
  return posterPalette[index % posterPalette.length];
}

function getYoutubeVideoId(videoUrl: string) {
  const trimmedUrl = videoUrl.trim();

  if (!trimmedUrl) {
    return "";
  }

  const directIdMatch = trimmedUrl.match(/^([a-zA-Z0-9_-]{11})$/);

  if (directIdMatch) {
    return directIdMatch[1];
  }

  const patterns = [/[?&]v=([a-zA-Z0-9_-]{11})/, /youtu\.be\/([a-zA-Z0-9_-]{11})/, /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/, /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/];

  for (const pattern of patterns) {
    const match = trimmedUrl.match(pattern);

    if (match?.[1]) {
      return match[1];
    }
  }

  return "";
}

function isYoutubeUrl(videoUrl: string) {
  return /(?:youtu\.be|youtube\.com)/i.test(videoUrl);
}

function VideoPoster({
  item,
  index,
  compact = false,
}: {
  item: EducationalVideoItem;
  index: number;
  compact?: boolean;
}) {
  const tone = getPosterTone(index);
  const youtubeVideoId = getYoutubeVideoId(item.videoUrl);
  const thumbnailUri = youtubeVideoId ? `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg` : "";
  const useThumbnail = Boolean(isYoutubeUrl(item.videoUrl) && thumbnailUri);
  const [thumbnailFailed, setThumbnailFailed] = React.useState(false);

  React.useEffect(() => {
    setThumbnailFailed(false);
  }, [thumbnailUri]);

  return (
    <View style={[styles.posterCard, compact ? styles.posterCardCompact : null, { backgroundColor: tone.backgroundColor }]}>
      {useThumbnail && !thumbnailFailed ? (
        <>
          <Image source={{ uri: thumbnailUri }} resizeMode="cover" style={styles.posterThumbnail} onError={() => setThumbnailFailed(true)} />
          <View style={styles.posterThumbnailOverlay} />
        </>
      ) : (
        <>
          <Image source={require("../../../assets/images/openScreen/vetor.png")} resizeMode="cover" style={styles.posterDecoration} />
          <View style={styles.posterGlow} />
        </>
      )}

      <View style={styles.posterContent}>
        <Ionicons name="play" size={compact ? 18 : 22} color="#FFFFFF" />
        <Text style={styles.posterLabel}>Vídeo</Text>
        <Text style={styles.posterDuration}>{formatVideoDuration(item.duracaoSegundos)}</Text>
      </View>

    </View>
  );
}

function RecommendationCard({
  item,
  index,
  onPress,
}: {
  item: EducationalVideoItem;
  index: number;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.recommendationCard} onPress={onPress} accessibilityRole="button">
      <VideoPoster item={item} index={index} />
      <Text style={styles.recommendationTitle} numberOfLines={2}>
        {item.titulo}
      </Text>
      <Text style={styles.recommendationDuration} numberOfLines={1}>
        {formatVideoDuration(item.duracaoSegundos)}
      </Text>
    </Pressable>
  );
}

function RecentVideoRow({
  item,
  index,
  onPress,
}: {
  item: EducationalVideoItem;
  index: number;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.listRow} onPress={onPress} accessibilityRole="button">
      <VideoPoster item={item} index={index} compact />

      <View style={styles.listRowContent}>
        <Text style={styles.listRowTitle} numberOfLines={2}>
          {item.titulo}
        </Text>
        <Text style={styles.listRowMeta} numberOfLines={1}>
          {formatVideoDuration(item.duracaoSegundos)}
        </Text>
        <Text style={styles.listRowDescription} numberOfLines={2}>
          {item.descricao}
        </Text>
      </View>
    </Pressable>
  );
}

function VideoListRow({
  item,
  index,
  onPress,
}: {
  item: EducationalVideoItem;
  index: number;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.listRow} onPress={onPress} accessibilityRole="button">
      <VideoPoster item={item} index={index} compact />

      <View style={styles.listRowContent}>
        <Text style={styles.listRowTitle} numberOfLines={2}>
          {item.titulo}
        </Text>
        <Text style={styles.listRowMeta} numberOfLines={1}>
          {formatVideoDuration(item.duracaoSegundos)}
        </Text>
        <Text style={styles.listRowDescription} numberOfLines={2}>
          {item.descricao}
        </Text>
      </View>
    </Pressable>
  );
}

export default function LibraryScreen() {
  const router = useRouter();
  const listRef = React.useRef<FlatList<EducationalVideoItem>>(null);
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortOption>("recentes");
  const [sortMenuVisible, setSortMenuVisible] = React.useState(false);
  const [videos, setVideos] = React.useState<EducationalVideoItem[]>([]);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const [loadingInitial, setLoadingInitial] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadPage = React.useCallback(async (page: number, replace = false) => {
    if (replace) {
      setLoadingInitial(true);
    } else {
      setLoadingMore(true);
    }

    setError(null);

    try {
      const pageItems = await fetchEducationalVideos({ page, size: PAGE_SIZE });

      setVideos((current) => (replace ? pageItems : [...current, ...pageItems]));
      setCurrentPage(page);
      setHasMore(pageItems.length === PAGE_SIZE);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar os vídeos.");

      if (replace) {
        setVideos([]);
        setHasMore(false);
      }
    } finally {
      if (replace) {
        setLoadingInitial(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []);

  React.useEffect(() => {
    void loadPage(0, true);
  }, [loadPage]);

  const sortedVideos = React.useMemo(() => sortVideos(videos, sort), [sort, videos]);

  const filteredVideos = React.useMemo(() => {
    const normalizedQuery = normalizeQuery(query);

    if (!normalizedQuery) {
      return sortedVideos;
    }

    return sortedVideos.filter((video) => {
      const searchableText = `${video.titulo} ${video.descricao}`.toLowerCase();
      return searchableText.includes(normalizedQuery);
    });
  }, [query, sortedVideos]);

  const recommendationVideos = filteredVideos.slice(0, RECOMMENDATION_LIMIT);
  const showSearchResults = query.trim().length > 0;

  const openVideo = React.useCallback(
    async (video: EducationalVideoItem) => {
      await saveRecentAccessedItem("library", {
        id: video.id,
        title: video.titulo,
        subtitle: formatVideoDuration(video.duracaoSegundos),
        imageUri: null,
      });

      router.push({
        pathname: "/library-details",
        params: {
          videoJson: encodeURIComponent(JSON.stringify(video)),
        },
      });
    },
    [router],
  );

  const onEndReached = React.useCallback(() => {
    if (loadingInitial || loadingMore || !hasMore) {
      return;
    }

    void loadPage(currentPage + 1, false);
  }, [currentPage, hasMore, loadPage, loadingInitial, loadingMore]);

  React.useEffect(() => {
    const normalizedQuery = normalizeQuery(query);

    if (!normalizedQuery || loadingInitial || loadingMore || !hasMore || filteredVideos.length > 0) {
      return;
    }

    void loadPage(currentPage + 1, false);
  }, [currentPage, filteredVideos.length, hasMore, loadPage, loadingInitial, loadingMore, query]);

  const headerComponent = React.useMemo(
    () => (
      <View>
        <View style={searchStyles.searchBarRow}>
          <View style={searchStyles.searchInputWrap}>
            <View style={searchStyles.searchInputIconWrap}>
              <SearchIcon />
            </View>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Procurar vídeo"
              placeholderTextColor="#145FA0"
              style={searchStyles.searchInput}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Pressable accessibilityRole="button" style={styles.filterButton} onPress={() => setSortMenuVisible(true)}>
            <Ionicons name="options-outline" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recomendados</Text>
          <Pressable accessibilityRole="button" onPress={() => listRef.current?.scrollToEnd({ animated: true })}>
            <Text style={styles.seeAllText}>Ver tudo</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendationList}>
          {recommendationVideos.length > 0 ? (
            recommendationVideos.map((item, index) => (
              <RecommendationCard key={item.id} item={item} index={index} onPress={() => void openVideo(item)} />
            ))
          ) : (
            <View style={styles.recommendationEmptyState}>
              <Text style={styles.recommendationEmptyText}>Nenhuma sugestão disponível.</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>{showSearchResults ? "Resultado da pesquisa" : "Lista"}</Text>
          {showSearchResults ? <Text style={styles.resultCountText}>{filteredVideos.length} vídeo(s)</Text> : null}
        </View>

        {loadingInitial ? <Text style={searchStyles.resultStatusText}>Carregando vídeos...</Text> : null}
        {error ? <Text style={[searchStyles.resultStatusText, searchStyles.resultErrorText]}>{error}</Text> : null}
      </View>
    ),
    [error, loadingInitial, openVideo, query, recommendationVideos, showSearchResults, filteredVideos.length],
  );

  return (
    <View style={searchStyles.screen}>
      <ExpoStatusBar style="dark" translucent />

      <View style={searchStyles.content}>
        <AppHeader variant="logo" title="Biblioteca" />

        <FlatList
          ref={listRef}
          data={filteredVideos}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <VideoListRow item={item} index={index} onPress={() => void openVideo(item)} />}
          ListHeaderComponent={headerComponent}
          ListEmptyComponent={
            loadingInitial ? null : (
              <View style={searchStyles.emptyState}>
                <Text style={searchStyles.emptyStateTitle}>Biblioteca</Text>
                <Text style={searchStyles.emptyStateText}>Nenhum vídeo encontrado</Text>
              </View>
            )
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color="#145FA0" />
                <Text style={styles.footerLoaderText}>Carregando mais vídeos...</Text>
              </View>
            ) : null
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      </View>

      <View style={searchStyles.bottomNav}>
        <View style={searchStyles.bottomNavRow}>
          <Pressable style={searchStyles.navItem} onPress={() => router.replace("/home")}>
            <Image source={require("../../../assets/images/navbar/home.png")} resizeMode="contain" style={searchStyles.navIconImage} />
            <Text style={searchStyles.navLabel}>Início</Text>
          </Pressable>

          <Pressable style={searchStyles.navItem} onPress={() => router.push("/recipes")}>
            <Image source={require("../../../assets/images/navbar/receitas.png")} resizeMode="contain" style={searchStyles.navIconImage} />
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
            <Image source={require("../../../assets/images/navbar/biblioteca.png")} resizeMode="contain" style={searchStyles.navIconImage} />
            <Text style={searchStyles.navLabel}>Biblioteca</Text>
          </Pressable>

          <Pressable style={searchStyles.navItem} onPress={() => router.push("/profile")}>
            <Image source={require("../../../assets/images/navbar/perfil.png")} resizeMode="contain" style={searchStyles.navIconImage} />
            <Text style={searchStyles.navLabel}>Perfil</Text>
          </Pressable>
        </View>
      </View>

      <Modal transparent visible={sortMenuVisible} animationType="fade" onRequestClose={() => setSortMenuVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSortMenuVisible(false)}>
          <Pressable style={styles.sortMenuCard} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.sortMenuTitle}>Ordenar por</Text>

            {(Object.keys(sortLabels) as SortOption[]).map((option) => (
              <Pressable
                key={option}
                style={[styles.sortMenuItem, sort === option && styles.sortMenuItemActive]}
                onPress={() => {
                  setSort(option);
                  setSortMenuVisible(false);
                }}
              >
                <Text style={[styles.sortMenuItemText, sort === option && styles.sortMenuItemTextActive]}>{sortLabels[option]}</Text>
                {sort === option ? <Ionicons name="checkmark" size={18} color="#085491" /> : null}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#085491",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 10,
  },
  listHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 6
  },
  sectionTitle: {
    color: "#1C1C1C",
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "800",
  },
  seeAllText: {
    color: "#1C1C1C",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
  },
  resultCountText: {
    color: "#145FA0",
    fontSize: 12,
    fontWeight: "700",
  },
  recommendationList: {
    gap: 12,
    paddingBottom: 12,
  },
  recommendationCard: {
    width: 168,
    marginRight: 12,
  },
  recommendationTitle: {
    color: "#1C1C1C",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 8,
  },
  recommendationDuration: {
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    marginTop: 4,
  },
  recommendationEmptyState: {
    width: "100%",
    minHeight: 88,
    borderRadius: 18,
    backgroundColor: "#E7EEF7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  recommendationEmptyText: {
    color: "#145FA0",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  posterCard: {
    position: "relative",
    height: 104,
    borderRadius: 18,
    overflow: "hidden",
    justifyContent: "flex-end",
    backgroundColor: "#145FA0",
  },
  posterCardCompact: {
    width: 100,
    height: 88,
  },
  posterDecoration: {
    position: "absolute",
    left: -16,
    top: -10,
    width: "115%",
    height: "115%",
    opacity: 0.15,
  },
  posterThumbnail: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
  },
  posterThumbnailOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(8, 84, 145, 0.18)",
  },
  posterGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  posterContent: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  posterLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  posterDuration: {
    color: "#FFFFFF",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  recentList: {
    marginBottom: 6,
  },
  listContent: {
    paddingBottom: 136,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  listRowContent: {
    flex: 1,
    paddingTop: 2,
  },
  listRowTitle: {
    color: "#1C1C1C",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800",
  },
  listRowMeta: {
    color: "#5f5f5f",
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "700",
    fontFamily: "Poppins-Medium",
    marginTop: 4,
  },
  listRowDescription: {
    color: "#5f5f5f",
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    marginTop: 4,
  },
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  footerLoaderText: {
    color: "#145FA0",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  sortMenuCard: {
    width: "100%",
    maxWidth: 340,
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
