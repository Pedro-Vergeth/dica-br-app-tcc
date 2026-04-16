import React from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";

import { saveIntroSeen } from "../services/onboardingStorage";
import { styles } from "../styles/VideoScreenStyles";

export default function VideoScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const player = useVideoPlayer(require("../../assets/videos/videoDicabr.mp4"), (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.play();
  });

  React.useEffect(() => {
    void saveIntroSeen();
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