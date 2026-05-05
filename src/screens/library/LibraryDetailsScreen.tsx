import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import YoutubePlayer from "react-native-youtube-iframe";

import BackHeader from "../../components/BackHeader";
import { type EducationalVideoItem } from "../../services/videoService";
import { styles } from "../../styles/LibraryDetailsScreenStyles";

type DetailParams = {
  videoJson?: string | string[];
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

function readVideo(videoJson: string): EducationalVideoItem | null {
  try {
    const normalizedJson = videoJson.includes("%7B") || videoJson.includes("%22") ? decodeURIComponent(videoJson) : videoJson;
    const parsed = JSON.parse(normalizedJson) as Partial<EducationalVideoItem>;

    if (!parsed || typeof parsed !== "object" || !parsed.id || !parsed.titulo || !parsed.videoUrl) {
      return null;
    }

    return {
      id: String(parsed.id),
      titulo: String(parsed.titulo),
      duracaoSegundos: typeof parsed.duracaoSegundos === "number" ? parsed.duracaoSegundos : null,
      descricao: String(parsed.descricao ?? ""),
      videoUrl: String(parsed.videoUrl),
    };
  } catch {
    return null;
  }
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

  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];

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

export default function LibraryDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<DetailParams>();
  const videoJson = getParamValue(params.videoJson);
  const video = React.useMemo(() => readVideo(videoJson), [videoJson]);
  const youtubeVideoId = video?.videoUrl ? getYoutubeVideoId(video.videoUrl) : "";
  const useYoutubePlayer = Boolean(video?.videoUrl && isYoutubeUrl(video.videoUrl) && youtubeVideoId);

  const player = useVideoPlayer(
    !useYoutubePlayer && video?.videoUrl ? { uri: video.videoUrl } : require("../../../assets/videos/videoDicabr.mp4"),
    (videoPlayer) => {
      videoPlayer.loop = false;
    },
  );

  return (
    <View style={styles.screen}>
      <ExpoStatusBar style="dark" translucent />

      <View style={styles.content}>
        <BackHeader title="Biblioteca" onBackPress={() => router.back()} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {!video ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>Vídeo não encontrado</Text>
              <Text style={styles.emptyStateText}>Não foi possível abrir os dados deste vídeo.</Text>
            </View>
          ) : (
            <>
              <View style={styles.heroBlock}>
                <Text style={styles.title} numberOfLines={3}>
                  {video.titulo}
                </Text>

                <View style={styles.videoFrame}>
                  {useYoutubePlayer ? (
                    <YoutubePlayer height={220} play={false} videoId={youtubeVideoId} />
                  ) : (
                    <VideoView
                      player={player}
                      style={styles.videoPlayer}
                      nativeControls
                      contentFit="cover"
                      allowsFullscreen
                      requiresLinearPlayback={false}
                    />
                  )}
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Descrição</Text>
                <Text style={styles.sectionBody}>{video.descricao || "Não informado"}</Text>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
