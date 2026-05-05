import React from "react";
import { Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import BackHeader from "../../components/BackHeader";
import { recognizeFoodFromImage } from "../../services/foodRecognitionService";
import { styles } from "../../styles/CameraScreenStyles";

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
        <ExpoStatusBar style="light" hidden translucent />
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
      <ExpoStatusBar style="light" hidden translucent />

      <CameraView ref={cameraRef} style={styles.camera} facing="back" />

      <View style={styles.overlay} pointerEvents="box-none">
        <BackHeader
          title="Pesquisar por imagem"
          onBackPress={() => router.back()}
          containerStyle={styles.header}
          backButtonStyle={styles.backButton}
          backButtonIconColor="#FFFFFF"
          backButtonIconSize={24}
          titleWrapStyle={styles.titleWrap}
          titleStyle={styles.title}
          showShadow={false}
        />

        <View style={styles.topActions} pointerEvents="box-none">
          <View style={styles.actionButton}>
            <Ionicons name="camera-reverse-outline" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.actionButton}>
            <Ionicons name="flash-outline" size={24} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.frameWrap} pointerEvents="none">
          <View style={styles.frameCornerTopLeft} />
          <View style={styles.frameCornerTopRight} />
          <View style={styles.frameCornerBottomLeft} />
          <View style={styles.frameCornerBottomRight} />
        </View>

        <View style={styles.bottomActions} pointerEvents="box-none">
          <Pressable style={styles.galleryButton} accessibilityRole="button">
            <Ionicons name="image-outline" size={22} color="#2E2E2E" />
          </Pressable>

          <Pressable
            style={styles.captureButton}
            onPress={() => void takePicture()}
            accessibilityRole="button"
            disabled={loading}
          >
            <View style={styles.captureButtonInner}>
              <Ionicons name="search" size={24} color="#2E2E2E" />
            </View>
          </Pressable>
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
