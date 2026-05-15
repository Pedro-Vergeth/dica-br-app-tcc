import React from "react";
import { ScrollView, Text, View } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import BackHeader from "../../components/BackHeader";
import { styles } from "../../styles/SearchRedGroupScreenStyles";

const redGroupExamples = [
  "Macarrão instantâneo",
  "Salgadinhos de pacote",
  "Biscoitos e bolachas",
  "Embutidos (presunto, mortadela, salame)",
  "Sucos industrializados (em pó ou de caixinha)",
  "Refrigerantes",
  "Linguiça",
  "Achocolatado em pó",
  "Salsicha",
  "Refeições congeladas industrializadas (ex.: lasanha)",
  "Molhos industrializados (ketchup e mostarda)",
  "Sorvete (massa ou picolé)",
  "Farinha láctea",
];

function Highlight({ children, color }: { children: React.ReactNode; color: string }) {
  return <Text style={{ color }}>{children}</Text>;
}

export default function SearchRedGroupScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <ExpoStatusBar style="dark" translucent />

      <View style={styles.content}>
        <BackHeader title="Entenda mais" onBackPress={() => router.back()} showShadow />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Grupo vermelho</Text>

          <Text style={styles.paragraph}>
            Além dos grupos alimentares recomendados ({" "}
            <Highlight color="#008A3A">verde</Highlight>, <Highlight color="#F4B400">amarelo</Highlight> e{" "}
            <Highlight color="#0077CC">azul</Highlight>), existe o grupo <Highlight color="#E60000">vermelho</Highlight>, que não é recomendado para uma alimentação saudável. Assim, o ideal é evitá-lo.
          </Text>

          <Text style={styles.paragraph}>
            O grupo vermelho é composto por alimentos ultraprocessados. Esses alimentos têm aditivos químicos com efeitos desconhecidos na saúde, como conservantes, estabilizantes, corantes, edulcorantes e aromatizantes, além de excesso de alguns ingredientes, como gordura vegetal hidrogenada, açúcar e sódio (sal).
          </Text>

          <Text style={styles.sectionTitle}>
            Exemplos de alimentos do grupo <Text style={styles.sectionTitleRed}>vermelho:</Text>
          </Text>

          <View style={styles.bulletList}>
            {redGroupExamples.map((item) => (
              <View key={item} style={styles.bulletRow}>
                <Text style={styles.bulletMark}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}