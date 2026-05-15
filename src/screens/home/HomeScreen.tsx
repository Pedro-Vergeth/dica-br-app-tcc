import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import AppHeader from "../../components/AppHeader";
import { loadProfileSummary } from "../../services/profileStorage";
import { loadSelectedState } from "../../services/onboardingStorage";
import { fetchRecipes, type RecipeItem } from "../../services/recipeService";
import { styles as profileStyles } from "../../styles/ProfileScreenStyles";
import { styles } from "../../styles/HomeScreenStyles";

export default function HomeScreen() {
  const router = useRouter();
  const [hasProfile, setHasProfile] = React.useState<boolean | null>(null);
  const [recipes, setRecipes] = React.useState<RecipeItem[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const load = async () => {
        const [storedProfile, storedState] = await Promise.all([
          loadProfileSummary(),
          loadSelectedState(),
        ]);

        if (!isActive) return;

        setHasProfile(Boolean(storedProfile));

        try {
          const data = await fetchRecipes({
            page: 0,
            size: 5,
            estadoId: storedState?.id ?? undefined,
          });
          if (isActive) setRecipes(data);
        } catch {
          if (isActive) setRecipes([]);
        }
      };

      void load();

      return () => {
        isActive = false;
      };
    }, []),
  );

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" translucent />

      <View style={styles.content}>
        <AppHeader title="Início" />

        {hasProfile === false ? (
          <Pressable style={profileStyles.setupCard} onPress={() => router.push("/profile") }>
            <View style={profileStyles.setupCardTextWrap}>
              <Text style={profileStyles.setupCardTitle}>Personalize sua alimentação</Text>
              <View>
                <Text style={profileStyles.setupCardText}>
                  Informe sua altura, peso e idade para calcular seu Índice de Massa Corporal (IMC) e descubra suas metas diárias baseadas na alimentação cardioprotetora.
                </Text>
                <Pressable style={profileStyles.actionButton} onPress={() => router.push("/profile-setup") }>
                  <Text style={profileStyles.actionButtonText}>Configurar perfil</Text>
                </Pressable>
              </View>
            </View>
            <Image source={require("../../../assets/images/profile/image.png")} resizeMode="contain" style={profileStyles.setupCardImage} />
          </Pressable>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Sugestões Para Você</Text>
          <Pressable onPress={() => router.push("/recipes")}>
            <Text style={styles.sectionHeaderAction}>Ver tudo</Text>
          </Pressable>
        </View>
        <View style={styles.carouselWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            style={styles.carousel}
          >
            {recipes.length === 0 ? (
              <Text style={styles.carouselEmpty}>Nenhuma sugestão disponível</Text>
            ) : (
              recipes.map((recipe) => (
                <Pressable
                  key={recipe.id}
                  style={styles.recipeCard}
                  onPress={() =>
                    router.push({
                      pathname: "/recipe-details",
                      params: { recipeId: recipe.id },
                    })
                  }
                >
                  {recipe.imagem64 ? (
                    <Image
                      source={{ uri: `data:image/png;base64,${recipe.imagem64}` }}
                      style={styles.recipeCardImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.recipeCardImage, styles.recipeCardImagePlaceholder]} />
                  )}
                  <View style={styles.recipeCardContent}>
                    <Text style={styles.recipeCardTitle} numberOfLines={2}>
                      {recipe.titulo}
                    </Text>
                    {recipe.tempoPreparoMinutos ? (
                      <Text style={styles.recipeCardMeta}>⏱ {recipe.tempoPreparoMinutos} min</Text>
                    ) : recipe.tipoRefeicao ? (
                      <Text style={styles.recipeCardMeta}>📋 {recipe.tipoRefeicao}</Text>
                    ) : null}
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
        <Text style={styles.sectionHeaderTitle}>Game Monte seu Prato</Text>
        <Pressable style={styles.gameCard} onPress={() => router.push("/game-intro")}>
          <View style={styles.gameCardLeft}>
            <View>
              <View style={styles.gameTitleBox}>
                <Text style={styles.gameCardTitle}>VEJA SE APRENDEU</Text>
              </View>

              <View style={styles.gameSubtitleBox}>
                <Text style={styles.gameCardSubtitle}>Monte o seu Prato</Text>
              </View>
            </View>

            <View style={styles.gameButtonWrap}>
              <Text style={styles.gameButtonText}>Começar</Text>
            </View>
          </View>

          <View style={styles.gameCardRight}>
            <View style={styles.gamePlateWrap}>
              <Image source={require("../../../assets/images/home/midPlate.png")} resizeMode="contain" style={styles.gamePlateImage} />
            </View>
            <View style={styles.gameFoodsWrap}>
              <Image source={require("../../../assets/images/home/cardProfileFoods.png")} resizeMode="cover" style={styles.gameFoodsImage} />
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
