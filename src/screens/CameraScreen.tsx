import React from "react";
import { Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import { recognizeFoodFromImage } from "../services/foodRecognitionService";
import { styles } from "../styles/CameraScreenStyles";

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = React.useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const takePicture = React.useCallback(async () => {
    if (!cameraRef.current || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false });

      if (!photo?.uri) {
        throw new Error("Não foi possível capturar a imagem.");
      }

      const recognizedName = await recognizeFoodFromImage(photo.uri);
      router.replace({
        pathname: "/search",
        params: { query: recognizedName },
      });
    } catch (captureError) {
      setError(captureError instanceof Error ? captureError.message : "Alimento não identificado");
      setLoading(false);
    }
  }, [loading, router]);

  if (!permission) {
    return <View style={styles.screen} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionWrap}>
        <ExpoStatusBar style="light" translucent />
        <Ionicons name="camera" size={44} color="#FFFFFF" />
        <Text style={styles.permissionTitle}>Permissão da câmera necessária</Text>
        <Text style={styles.permissionText}>Precisamos da câmera para reconhecer o alimento e preencher a busca automaticamente.</Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Permitir câmera</Text>
        </Pressable>
        <Pressable style={styles.permissionButton} onPress={() => router.back()}>
          <Text style={styles.permissionButtonText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ExpoStatusBar style="light" translucent />

      <CameraView ref={cameraRef} style={styles.camera} facing="back" />

      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <Pressable style={styles.topButton} onPress={() => router.back()} accessibilityRole="button">
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </Pressable>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Reconhecer alimento</Text>
          </View>
          <View style={styles.topButton}>
            <Ionicons name="scan" size={20} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.centerGuide} />

        <View style={styles.bottomBar}>
          <Text style={styles.helpText}>Posicione o alimento dentro da moldura e toque no botão para capturar.</Text>
          <View style={styles.captureButtonRow}>
            <Pressable style={styles.captureButton} onPress={() => void takePicture()} accessibilityRole="button" disabled={loading}>
              <View style={styles.captureButtonInner} />
            </Pressable>
          </View>
        </View>

        {error ? (
          <View style={styles.loadingWrap} pointerEvents="none">
            <View style={styles.loadingCard}>
              <Text style={styles.loadingText}>{error}</Text>
            </View>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loadingWrap} pointerEvents="none">
            <View style={styles.loadingCard}>
              <Text style={styles.loadingText}>Analisando imagem...</Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}
