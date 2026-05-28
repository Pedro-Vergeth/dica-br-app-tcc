import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import BackHeader from "../../components/BackHeader";
import { styles } from "../../styles/CreditsScreenStyles";

const SECTIONS = [
  {
    title: "Professores e Pesquisadores envolvidos :",
    names: ["Camila Calado de Vasconcelos", "Isadora Bianco Cardoso de Menezes",  "Wagner de Oliveira Lima Palmeira de Araujo"],
  },
  {
    title: "Desenvolvedores responsáveis:",
    names: ["Pedro Frota Vergeth Sarmento"],
  },
  {
    title: "Designers:",
    names: ["Dayane Pontes", "Isabela Soares"],
  },
  {
    title: "Colaboração:",
    names: [],
  },
];

export default function CreditsScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <BackHeader title="Créditos" onBackPress={() => router.back()} />
        <Text style={styles.developedByLabel}>Desenvolvido por:</Text>

        <View style={styles.mediaRow}>
          <View style={styles.gifCell}>
            <Image
              source={require("../../../assets/gifs/gif1.gif")}
              style={styles.gif}
              resizeMode="contain"
            />
          </View>
          <View style={styles.secondImageCell}>
            <Image
              source={require("../../../assets/images/home/EscudoMedicina.png")}
              style={styles.secondImage}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.sectionsWrap}>
          {SECTIONS.map((section, index) => (
            <React.Fragment key={section.title}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.names.map((name) => (
                  <View key={name} style={styles.nameItem}>
                    <Text style={styles.nameText}>{name}</Text>
                  </View>
                ))}
              </View>
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
