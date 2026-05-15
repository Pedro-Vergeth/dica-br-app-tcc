import React from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";

import { saveIntroSeen } from "../../services/onboardingStorage";
import { fetchIntroductoryVideoSource } from "../../services/videoService";
import { styles } from "../../styles/VideoScreenStyles";

export default function VideoScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [videoSource, setVideoSource] = React.useState<string | null>(null);

  const player = useVideoPlayer(videoSource, (videoPlayer) => {
    videoPlayer.loop = true;

    if (videoSource) {
      videoPlayer.play();
    }
  });

  React.useEffect(() => {
    void saveIntroSeen();
  }, []);

  React.useEffect(() => {
    let isActive = true;

    async function loadVideoSource() {
      try {
        const source = await fetchIntroductoryVideoSource();

        if (isActive) {
          setVideoSource(source);
        }
      } catch {
        if (isActive) {
          setVideoSource(null);
        }
      }
    }

    void loadVideoSource();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent />

      <VideoView
        player={player}
        style={[styles.player, { width, height }]}
        nativeControls={false}
        contentFit="cover"
        allowsFullscreen={false}
        requiresLinearPlayback={false}
      />

      <View style={styles.overlay} pointerEvents="none" />

      <View style={styles.titleCard}>
        <Text style={styles.title}>Conheça DICA!</Text>
      </View>

      <Pressable
        style={styles.skipButton}
        onPress={() => {
          void saveIntroSeen();
          router.replace("/home");
        }}
      >
        <Text style={styles.skipText}>Pular vídeo explicativo</Text>
        <Text style={styles.skipArrow}>»</Text>
      </Pressable>
    </View>
  );
}