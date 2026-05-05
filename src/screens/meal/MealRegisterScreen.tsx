import React from "react";
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";

import BackHeader from "../../components/BackHeader";
import { fetchSearchFoods, type SearchFoodItem } from "../../services/searchFoodService";
import {
  HEART_MULTIPLIERS,
  formatFoodBaseQuantity,
  formatHeartQuantity,
  mealTypeLabels,
  saveMealRecord,
  type MealFoodEntry,
  type MealType,
} from "../../services/mealLogService";
import { styles } from "../../styles/MealRegisterScreenStyles";

const mealTypeOptions: MealType[] = ["CAFE_DA_MANHA", "ALMOCO", "JANTAR", "LANCHE"];

type SelectedFood = MealFoodEntry;

function toImageUri(imagem64: string) {
  if (imagem64.startsWith("data:")) {
    return imagem64;
  }

  if (imagem64.startsWith("http://") || imagem64.startsWith("https://")) {
    return imagem64;
  }

  return `data:image/png;base64,${imagem64}`;
}

function readFoodQuantity(item: SearchFoodItem) {
  const candidate = item.quantidade;

  if (typeof candidate === "number" && Number.isFinite(candidate)) {
    return candidate;
  }

  if (typeof candidate === "string" && candidate.trim()) {
    const parsedValue = Number(candidate.replace(",", "."));
    return Number.isFinite(parsedValue) ? parsedValue : 1;
  }

  return 1;
}

function readFoodUnit(item: SearchFoodItem) {
  return item.unidade?.trim() || "unidade";
}

function SearchResultCard({
  item,
  onPress,
  added,
}: {
  item: SearchFoodItem;
  onPress: () => void;
  added: boolean;
}) {
  const imageUri = toImageUri(item.imagem64);
  const baseQuantity = readFoodQuantity(item);
  const unit = readFoodUnit(item);

  return (
    <Pressable style={styles.resultCard} onPress={onPress} accessibilityRole="button">
      <View style={styles.resultThumbWrap}>
        <Image source={{ uri: imageUri }} resizeMode="cover" style={styles.resultThumb} />
      </View>

      <View style={styles.resultContent}>
        <Text style={styles.resultTitle} numberOfLines={2}>
          {item.nomePrincipal}
        </Text>
        <Text style={styles.resultMeta} numberOfLines={1}>
          {item.grupoAlimentar}
        </Text>
        <Text style={styles.resultHeart} numberOfLines={1}>
          {formatFoodBaseQuantity(baseQuantity, unit)}
        </Text>
      </View>

      <View style={[styles.resultAction, added ? styles.resultActionDisabled : null]}>
        <Text style={styles.resultActionText}>{added ? "Adicionado" : "Adicionar"}</Text>
      </View>
    </Pressable>
  );
}

function SelectedFoodCard({
  item,
  onQuantityChange,
  onRemove,
}: {
  item: SelectedFood;
  onQuantityChange: (value: number) => void;
  onRemove: () => void;
}) {
  const heartOptions = React.useMemo(() => {
    return HEART_MULTIPLIERS.map((multiplier) => ({
      value: multiplier,
      label: `${formatHeartQuantity(multiplier)} (${formatFoodBaseQuantity(item.quantity * multiplier, item.unit)})`,
    }));
  }, [item.quantity, item.unit]);

  return (
    <View style={styles.selectedCard}>
      <View style={styles.selectedCardHeader}>
        <View style={styles.selectedTitleWrap}>
          <Text style={styles.selectedFoodTitle}>{item.title}</Text>
          <Text style={styles.selectedFoodMeta}>{item.group}</Text>
          <Text style={styles.selectedFoodMeta}>
            {formatFoodBaseQuantity(item.quantity, item.unit)}
          </Text>
        </View>

        <Text style={styles.selectedFoodHeart}>{formatHeartQuantity(item.heartQuantity)}</Text>
      </View>

      <View style={styles.heartOptionsRow}>
        {heartOptions.map((option) => {
          const isActive = item.heartQuantity === option.value;

          return (
            <Pressable
              key={option.value}
              style={[styles.heartOptionChip, isActive ? styles.heartOptionChipActive : null]}
              onPress={() => onQuantityChange(option.value)}
              accessibilityRole="button"
            >
              <Text style={[styles.heartOptionText, isActive ? styles.heartOptionTextActive : null]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.removeButton} onPress={onRemove} accessibilityRole="button">
        <Text style={styles.removeButtonText}>Remover</Text>
      </Pressable>
    </View>
  );
}

export default function MealRegisterScreen() {
  const router = useRouter();
  const [mealType, setMealType] = React.useState<MealType | null>(null);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchFoodItem[]>([]);
  const [selectedFoods, setSelectedFoods] = React.useState<SelectedFood[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [mealDropdownOpen, setMealDropdownOpen] = React.useState(false);
  const [foodPickerVisible, setFoodPickerVisible] = React.useState(false);

  const todayLabel = React.useMemo(
    () =>
      new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    [],
  );

  const runSearch = React.useCallback(async (searchValue: string) => {
    const normalizedSearch = searchValue.trim();

    if (!normalizedSearch) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      const foods = await fetchSearchFoods(normalizedSearch);
      setResults(foods);
      setError(null);
    } catch (searchError) {
      setResults([]);
      setError(searchError instanceof Error ? searchError.message : "Não foi possível buscar alimentos.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);

    const timeoutId = setTimeout(() => {
      void runSearch(normalizedQuery);
    }, 350);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query, runSearch]);

  const addFood = React.useCallback((item: SearchFoodItem) => {
    const id = `${item.nomePrincipal.trim().toLowerCase()}|${item.grupoAlimentar.trim().toLowerCase()}`;
    const quantity = readFoodQuantity(item);
    const unit = readFoodUnit(item);

    setSelectedFoods((currentFoods) => {
      if (currentFoods.some((food) => food.id === id)) {
        return currentFoods;
      }

      return [
        ...currentFoods,
        {
          id,
          title: item.nomePrincipal,
          group: item.grupoAlimentar,
          imageUri: toImageUri(item.imagem64),
          heartColor: item.heartColor,
          quantity,
          unit,
          heartQuantity: 1,
        },
      ];
    });
  }, []);

  const updateHeartQuantity = React.useCallback((foodId: string, value: number) => {
    setSelectedFoods((currentFoods) =>
      currentFoods.map((food) => (food.id === foodId ? { ...food, heartQuantity: value } : food)),
    );
  }, []);

  const removeFood = React.useCallback((foodId: string) => {
    setSelectedFoods((currentFoods) => currentFoods.filter((food) => food.id !== foodId));
  }, []);

  const handleSave = React.useCallback(async () => {
    if (!mealType) {
      setError("Selecione a refeição antes de finalizar o registro.");
      return;
    }

    if (selectedFoods.length === 0) {
      setError("Selecione pelo menos um alimento para registrar a refeição.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await saveMealRecord({
        mealType,
        foods: selectedFoods,
      });
      setMessage("Refeição salva com sucesso.");
      router.replace("/meal-history");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar a refeição.");
    } finally {
      setSaving(false);
    }
  }, [mealType, router, selectedFoods]);

  const selectedCount = selectedFoods.length;
  const totalHearts = selectedFoods.reduce((sum, food) => sum + food.heartQuantity, 0);
  const canFinalize = Boolean(mealType) && selectedFoods.length > 0 && !saving;

  return (
    <View style={styles.screen}>
      <ExpoStatusBar style="dark" translucent />

      <View style={styles.content}>
        <BackHeader title="Registro alimentar" onBackPress={() => router.back()} />
        <View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.mainContent}>
              <Text style={styles.pageTitle}>Registro {todayLabel}</Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Refeição</Text>
                <Pressable
                  style={styles.dropdownButton}
                  onPress={() => setMealDropdownOpen((currentValue) => !currentValue)}
                  accessibilityRole="button"
                >
                  <Text style={[styles.dropdownText, !mealType ? styles.dropdownPlaceholder : null]} numberOfLines={1}>
                    {mealType ? mealTypeLabels[mealType] : "selecione"}
                  </Text>
                  <Ionicons name={mealDropdownOpen ? "chevron-up" : "chevron-down"} size={22} color="#01AB51" />
                </Pressable>

                {mealDropdownOpen ? (
                  <View style={styles.dropdownMenu}>
                    {mealTypeOptions.map((option) => {
                      const isActive = mealType === option;

                      return (
                        <Pressable
                          key={option}
                          style={[styles.dropdownOption, isActive ? styles.dropdownOptionActive : null]}
                          onPress={() => {
                            setMealType(option);
                            setMealDropdownOpen(false);
                          }}
                          accessibilityRole="button"
                        >
                          <Text style={[styles.dropdownOptionText, isActive ? styles.dropdownOptionTextActive : null]}>
                            {mealTypeLabels[option]}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Adicionar alimento</Text>
                <Pressable style={styles.addFoodButton} onPress={() => setFoodPickerVisible(true)} accessibilityRole="button">
                  <Ionicons name="add" size={24} color="#196926" />
                  <Text style={styles.addFoodButtonText}>Adicionar Alimento</Text>
                </Pressable>
              </View>

              <Text style={styles.sectionLabel}>Alimentos Adicionados</Text>

              <View style={styles.addedFoodsSection}>
                {selectedFoods.length === 0 ? null : selectedFoods.map((item) => (
                  <SelectedFoodCard
                    key={item.id}
                    item={item}
                    onQuantityChange={(value) => updateHeartQuantity(item.id, value)}
                    onRemove={() => removeFood(item.id)}
                  />
                ))}
              </View>

              <View style={styles.spacer} />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              {message ? <Text style={styles.statusText}>{message}</Text> : null}

              <Pressable
                style={[styles.saveButton, !canFinalize ? styles.saveButtonDisabled : null]}
                onPress={() => void handleSave()}
                accessibilityRole="button"
                disabled={!canFinalize}
              >
                <Text style={styles.saveButtonText}>{saving ? "Salvando..." : "Finalizar Registro"}</Text>
              </Pressable>
            </View>
          </ScrollView>

          <Modal visible={foodPickerVisible} backdropColor="rgba(0, 0, 0, 0.5)" animationType="slide" onRequestClose={() => setFoodPickerVisible(false)}>
            <BlurView style={styles.foodPickerScreen} intensity={80} tint="light">
              <View style={styles.foodPickerHeader}>
                <Pressable style={styles.foodPickerCloseButton} onPress={() => setFoodPickerVisible(false)} accessibilityRole="button">
                  <Ionicons name="close" size={26} color="#01AB51" />
                </Pressable>
                <Text style={styles.foodPickerTitle}>Adicionar alimento</Text>
                <View style={styles.foodPickerHeaderSpacer} />
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.foodPickerContent}>
                <View style={styles.searchBarRow}>
                  <View style={styles.searchInputWrap}>
                    <View style={styles.searchInputIconWrap}>
                      <Ionicons name="search" size={18} color="#145FA0" />
                    </View>
                    <TextInput
                      value={query}
                      onChangeText={setQuery}
                      placeholder="Ex.: arroz, maçã, uva-itália"
                      placeholderTextColor="#145FA0"
                      style={styles.searchInput}
                      returnKeyType="search"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  <Pressable style={styles.searchButton} onPress={() => void runSearch(query)} accessibilityRole="button">
                    <Text style={styles.searchButtonText}>Buscar</Text>
                  </Pressable>
                </View>

                {loading ? (
                  <View style={styles.loadingWrap}>
                    <ActivityIndicator color="#145FA0" />
                    <Text style={styles.statusText}>Buscando alimentos...</Text>
                  </View>
                ) : null}
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                {message ? <Text style={styles.statusText}>{message}</Text> : null}

                <View style={styles.resultList}>
                  {results.map((item) => {
                    const key = `${item.nomePrincipal}-${item.grupoAlimentar}`;
                    const added = selectedFoods.some((food) => food.id === `${item.nomePrincipal.trim().toLowerCase()}|${item.grupoAlimentar.trim().toLowerCase()}`);

                    return <SearchResultCard key={key} item={item} added={added} onPress={() => addFood(item)} />;
                  })}
                </View>

                <View style={styles.selectedSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Alimentos selecionados</Text>
                    <Text style={styles.sectionSubtitle}>
                      {selectedCount} item(ns) • {formatHeartQuantity(totalHearts)}
                    </Text>
                  </View>

                  {selectedFoods.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateTitle}>Nenhum alimento selecionado</Text>
                      <Text style={styles.emptyStateText}>Busque acima e toque nos alimentos para adicioná-los à refeição.</Text>
                    </View>
                  ) : (
                    selectedFoods.map((item) => (
                      <SelectedFoodCard
                        key={item.id}
                        item={item}
                        onQuantityChange={(value) => updateHeartQuantity(item.id, value)}
                        onRemove={() => removeFood(item.id)}
                      />
                    ))
                  )}
                </View>

                <Pressable style={styles.saveButton} onPress={() => setFoodPickerVisible(false)} accessibilityRole="button">
                  <Text style={styles.saveButtonText}>Fechar</Text>
                </Pressable>
              </ScrollView>
            </BlurView>
          </Modal>
        </View>

      </View>

    </View>
  );
}
