import React from "react";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";

import { saveIntroSeen } from "../services/onboardingStorage";
import { styles } from "../styles/VideoScreenStyles";

const foodItems = [
  { id: "banana", label: "Banana", group: "Frutas", backgroundColor: "#FFF1A6", accentColor: "#F7C300" },
  { id: "bread", label: "Pão francês", group: "Cereais", backgroundColor: "#F7E6C6", accentColor: "#D5A85A" },
  { id: "butter", label: "Manteiga", group: "Laticínios", backgroundColor: "#FFF7CF", accentColor: "#E7C85B" },
  { id: "honey", label: "Mel", group: "Açúcares", backgroundColor: "#FFE6AA", accentColor: "#D98B1D" },
  { id: "oats", label: "Aveia", group: "Grãos", backgroundColor: "#E8DCC6", accentColor: "#AF8C5D" },
  { id: "broccoli", label: "Brócolis", group: "Verduras", backgroundColor: "#DDF2CA", accentColor: "#4BB05B" },
  { id: "fish", label: "Peixe", group: "Proteínas", backgroundColor: "#D7EBFF", accentColor: "#0F5F9A" },
] as const;

export default function VideoScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const foodRailWidth = width + 33;
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

      <Text style={styles.foodSectionTitle}>Alimentos</Text>

      <View style={[styles.foodRail, { left: 32, width: foodRailWidth }]} pointerEvents="box-none">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.foodRailContent}
          bounces={false}
        >
          {foodItems.map((item) => (
            <View key={item.id} style={styles.foodRailCard}>
              <Text style={styles.foodRailLabel}>{item.label}</Text>
              <View style={styles.foodRailThumbWrap}>
                <View style={[styles.foodRailThumb, { backgroundColor: item.backgroundColor, borderColor: item.accentColor }]} />
              </View>
              <Text style={styles.foodRailGroup}>{item.group}</Text>
            </View>
          ))}
        </ScrollView>
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