import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import BackHeader from "../../components/BackHeader";
import { loadProfileSummary, type ProfileSummary } from "../../services/profileStorage";
import { styles } from "../../styles/ProfileResultScreenStyles";

function ResultHeart({ value, color }: { value: number; color: string }) {
  return (
    <View style={styles.heartCard}>
      <View style={styles.heartIconWrap}>
        <Ionicons name="heart" size={72} color={color} />
        <Text style={styles.heartIconText}>{value}</Text>
      </View>
    </View>
  );
}

function getConditionText(classification: ProfileSummary["classification"]) {
  switch (classification) {
    case "Baixo Peso":
      return "Seu resultado indica baixo peso. Isso pode significar que seu corpo precisa de mais energia e nutrientes, então vale organizar melhor as refeições e buscar orientação para ganhar peso com saúde.";
    case "Eutrofia":
      return "Seu resultado indica eutrofia. Isso significa que seu peso está em uma faixa adequada, e o foco agora é manter esse equilíbrio com uma alimentação variada, porções adequadas e rotina regular.";
    case "Obesidade":
      return "Seu resultado indica obesidade. Essa condição pede atenção especial, porque pode aumentar o risco para a saúde, e ajustar a alimentação junto com acompanhamento profissional pode ajudar bastante.";
    default:
      return "Esse resultado pode exigir ajustes na alimentação e nos hábitos do dia a dia. Manter o acompanhamento ajuda a encontrar o melhor caminho para o seu caso.";
  }
}

export default function ProfileResultScreen() {
  const router = useRouter();
  const [summary, setSummary] = React.useState<ProfileSummary | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const storedProfile = await loadProfileSummary();

      if (!isMounted) {
        return;
      }

      if (!storedProfile) {
        router.replace("/profile-setup");
        return;
      }

      setSummary(storedProfile);
      setLoading(false);
    };

    void initialize();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading || !summary) {
    return (
      <View style={styles.screen}>
        <ExpoStatusBar style="dark" translucent />
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#085491" />
          <Text style={styles.loadingText}>Carregando resultado...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ExpoStatusBar style="dark" translucent />


      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <BackHeader title="Perfil" onBackPress={() => router.back()} />
        <Text style={styles.sectionTitle}>Meu perfil</Text>
        <Text style={styles.sectionSubtitle}>
          As informações que você fornece são utilizadas exclusivamente para melhorar sua experiência no app e oferecer recomendações personalizadas.
        </Text>

        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Seu resultado:</Text>

          <View style={styles.imcRow}>
            <View style={styles.imcColumn}>
              <Text style={styles.imcLabel}>Seu IMC é:</Text>
              <View style={styles.imcBubble}>
                <Text style={styles.imcValue}>{summary.bmi.toFixed(0)}</Text>
              </View>
            </View>

            <View style={styles.resultTextWrap}>
              <Text style={styles.resultText}>
                <Text style={styles.resultTextHighlight}>{summary.classification}: </Text>
                {getConditionText(summary.classification)}
              </Text>
            </View>
          </View>

          <Text style={styles.metaTitle}>Sua Meta Diária é:</Text>

          <View style={styles.heartsRow}>
            <ResultHeart value={summary.goalPlan.greenCount} color="#01AB51" />
            <ResultHeart value={summary.goalPlan.yellowCount} color="#FAC800" />
            <ResultHeart value={summary.goalPlan.blueCount} color="#145FA0" />
          </View>

          <Text style={styles.explanationText}>
            <Text style={styles.explanationHighlight}>Explicação: </Text>
            Este é o número de porções de cada grupo alimentar recomendado por dia.
          </Text>

          <Text style={styles.explanationText}>
            Saiba mais sobre os alimentos e as porções ideais para incluir na sua alimentação na aba ‘Pesquisar alimentos’.
          </Text>

          <Text style={styles.explanationText}>
            <Text style={styles.explanationHighlight}>Atenção: </Text>
            Para um acompanhamento individualizado, procure um nutricionista. Este aplicativo tem caráter orientativo e não substitui a avaliação ou prescrição profissional.
          </Text>
        </View>

        <Pressable style={styles.profileLinkButton} onPress={() => router.replace("/profile-home")} accessibilityRole="button">
          <Text style={styles.profileLinkText}>ir para minha página de perfil</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}