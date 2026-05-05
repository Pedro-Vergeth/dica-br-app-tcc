import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import BackHeader from "../../components/BackHeader";
import { styles } from "../../styles/ProfileScreenStyles";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <ExpoStatusBar style="dark" translucent />
      <View style={styles.content}>
        <BackHeader title="Perfil" onBackPress={() => router.back()} />

        <Text style={styles.title}>Meu perfil</Text>
        <View style={styles.setupCard}>
          <View style={styles.setupCardTextWrap}>
            <Text style={styles.setupCardTitle}>Personalize sua alimentação</Text>
            <View>
              <Text style={styles.setupCardText}>
                Informe sua altura, peso e idade para calcular seu Índice de Massa Corporal (IMC) e descubra suas metas diárias baseadas na alimentação cardioprotetora.
              </Text>
              <Pressable style={styles.actionButton} onPress={() => router.push("/profile-setup")}>
                <Text style={styles.actionButtonText}>Configurar perfil</Text>
              </Pressable>
            </View>
          </View>
          <Image source={require("../../../assets/images/profile/image.png")} resizeMode="contain" style={styles.setupCardImage} />
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Não há informações disponíveis</Text>
          <Text style={styles.emptyStateText}>
            Configure seu perfil pra ter acesso as informações da sua alimentação
          </Text>
        </View>
      </View>
    </View>
  );
}
